import { executeToolCall } from "@/lib/ai"
import { buildFinancialContext } from "@/lib/rag"

export const maxDuration = 60
export const runtime = "nodejs"

/**
 * Money-movement tools are executed by the Convex action layer
 * (convex/actions/9psb.ts). Each action validates input, calls the 9PSB
 * provider, THEN debits the wallet with reconciliation-safe failure handling,
 * so provider + ledger live in exactly one place. This route only forwards the
 * tool call with the caller's session and a deterministic idempotency key.
 */
const MONEY_ACTION_PATHS: Record<string, string> = {
  send_money: "actions/9psb:sendMoney",
  buy_airtime: "actions/9psb:buyAirtime",
  buy_data: "actions/9psb:buyData",
  pay_electricity: "actions/9psb:payElectricity",
  pay_tv: "actions/9psb:payTv",
}

/** Map an AI money tool call onto the matching 9PSB action's argument shape. */
function buildMoneyActionArgs(
  toolName: string,
  raw: Record<string, unknown>,
  common: { userId: string; sessionToken: string; amount: number; idempotencyKey: string },
): Record<string, unknown> {
  const str = (v: unknown, fallback = "") =>
    typeof v === "string" ? v : v == null ? fallback : String(v)
  switch (toolName) {
    case "send_money":
      return {
        ...common,
        accountNumber: str(raw.accountNumber),
        bankCode: str(raw.bankCode),
        accountName: str(raw.accountName),
        narration: str(raw.narration) || `Transfer to ${str(raw.accountName)}`,
        recipientName: str(raw.accountName),
      }
    case "buy_airtime":
      return {
        ...common,
        network: str(raw.network).toLowerCase(),
        phoneNumber: str(raw.phoneNumber),
      }
    case "buy_data":
      return {
        ...common,
        network: str(raw.network).toLowerCase(),
        phoneNumber: str(raw.phoneNumber),
        planId: str(raw.planId),
      }
    case "pay_electricity":
      return {
        ...common,
        providerCode: str(raw.providerCode),
        meterNumber: str(raw.meterNumber),
        meterType: str(raw.meterType).toLowerCase(),
        phoneNumber: str(raw.phoneNumber),
      }
    case "pay_tv":
      return {
        ...common,
        providerCode: str(raw.providerCode),
        smartCardNumber: str(raw.smartCardNumber),
        packageId: str(raw.packageId),
        phoneNumber: str(raw.phoneNumber),
      }
    default:
      return { ...common }
  }
}

/** Small deterministic hash for idempotency keys (retries dedup). */
function djb2(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36).toUpperCase()
}

async function convexMutation(convexUrl: string, path: string, args: Record<string, unknown>) {  const res = await fetch(`${convexUrl}/api/mutation/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Convex ${path} failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const json = await res.json()
  return json.value ?? json
}

async function convexAction(convexUrl: string, path: string, args: Record<string, unknown>) {
  const res = await fetch(`${convexUrl}/api/action/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Convex action ${path} failed (${res.status}): ${text.slice(0, 200)}`)
  }
  const json = await res.json()
  return json.value ?? json
}

export async function POST(req: Request) {
  try {
    const { userId, sessionToken, toolCalls, pin } = await req.json()

    if (!userId || !sessionToken || !toolCalls || !pin) {
      return new Response(JSON.stringify({ error: "userId, sessionToken, toolCalls, and pin required" }), { status: 400 })
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL
    if (!convexUrl) {
      return new Response(JSON.stringify({ error: "Convex not configured" }), { status: 500 })
    }

    // PIN check is session-bound and attempt-limited (verifyPinStrict
    // records failures and locks out after 5 wrong attempts).
    const verifyRes = await fetch(`${convexUrl}/api/mutation/users:verifyPinStrict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ args: { userId, sessionToken, pin } }),
    })
    if (!verifyRes.ok) {
      const text = await verifyRes.text().catch(() => "")
      const status = verifyRes.status === 500 ? 500 : 403
      return new Response(JSON.stringify({ error: status === 403 ? "Incorrect PIN" : `PIN verification failed: ${text.slice(0, 200)}` }), { status })
    }

    const results = []
    // Use REAL user data (not stubs) so balance checks work
    const finCtx = await buildFinancialContext(userId, sessionToken)
    const fetchUserData = async () => ({
      balance: finCtx.balance,
      transactions: finCtx.recentTransactions,
      beneficiaries: finCtx.beneficiaries,
      scheduledPayments: finCtx.scheduledPayments,
      budgets: finCtx.budgets,
      totalSpentThisMonth: finCtx.totalSpentThisMonth,
      totalReceivedThisMonth: finCtx.totalReceivedThisMonth,
      spendingByCategory: finCtx.spendingByCategory,
    })

    for (const tc of toolCalls) {
      // --- Tools persisted here (not inside executeToolCall) ---
      if (tc.name === "schedule_payment") {
        try {
          const amount = Number(tc.args?.amount)
          const recipient = String(tc.args?.recipientName ?? "").trim()
          const frequency = tc.args?.frequency
          if (!recipient) throw new Error("Recipient name is required")
          if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than zero")
          if (!["once", "daily", "weekly", "monthly"].includes(frequency))
            throw new Error("Frequency must be once, daily, weekly, or monthly")
          const parsedStart = tc.args?.startDate ? new Date(String(tc.args.startDate)).getTime() : NaN
          const nextPaymentDate = Number.isFinite(parsedStart) && parsedStart > Date.now()
            ? parsedStart
            : Date.now() + 24 * 60 * 60 * 1000
          // Deterministic key from schedule content: retrying the same
          // pendingAction POST dedups instead of creating a duplicate.
          const rawKey = tc.args?.idempotencyKey
          const scheduleKey = typeof rawKey === "string" && rawKey
            ? rawKey
            : `SCHED-${djb2(`${recipient}|${amount}|${frequency}|${nextPaymentDate}`)}`
          const id = await convexMutation(convexUrl, "scheduled:create", {
            userId,
            sessionToken,
            recipientName: recipient,
            amount,
            frequency,
            nextPaymentDate,
            description: tc.args?.description,
            idempotencyKey: scheduleKey,
          })
          results.push({ name: tc.name, args: tc.args, result: { success: true, scheduled: true, id, nextPaymentDate } })
        } catch (e) {
          results.push({ name: tc.name, args: tc.args, result: { success: false, error: (e as Error).message } })
        }
        continue
      }

      if (tc.name === "create_budget_plan") {
        try {
          const limits = tc.args?.categoryLimits
          if (!limits || typeof limits !== "object") throw new Error("categoryLimits is required")
          const created: unknown[] = []
          for (const [category, amount] of Object.entries(limits)) {
            const value = Number(amount)
            if (!category.trim() || !Number.isFinite(value) || value <= 0)
              throw new Error(`Invalid budget for "${category}"`)
            const id = await convexMutation(convexUrl, "budgets:setBudget", {
              userId,
              sessionToken,
              category: category.trim(),
              amount: value,
              period: "monthly",
            })
            created.push({ category: category.trim(), amount: value, id })
          }
          results.push({ name: tc.name, args: tc.args, result: { success: true, budgets: created } })
        } catch (e) {
          results.push({ name: tc.name, args: tc.args, result: { success: false, error: (e as Error).message } })
        }
        continue
      }

      if (tc.name === "manage_beneficiaries") {
        try {
          const action = tc.args?.action
          if (action !== "add" && action !== "update")
            throw new Error(`Unsupported beneficiary action: ${action}`)
          if (!String(tc.args?.name ?? "").trim()) throw new Error("Beneficiary name is required")
          if (!String(tc.args?.bankName ?? "").trim()) throw new Error("Bank name is required")
          if (!/^\d{10}$/.test(String(tc.args?.accountNumber ?? "")))
            throw new Error("Account number must be 10 digits")
          if (action === "add") {
            const id = await convexMutation(convexUrl, "beneficiaries:add", {
              userId,
              sessionToken,
              name: String(tc.args.name).trim(),
              bankName: String(tc.args.bankName).trim(),
              accountNumber: String(tc.args.accountNumber),
            })
            results.push({ name: tc.name, args: tc.args, result: { success: true, beneficiaryId: id } })
          } else {
            // beneficiaries:getAll is a QUERY — call the query endpoint
            // directly (a previous build POSTed it as a mutation and
            // relied on a fallback).
            const r = await fetch(`${convexUrl}/api/query/beneficiaries:getAll`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ args: { userId, sessionToken } }),
            })
            if (!r.ok) throw new Error("Could not load beneficiaries")
            const j = await r.json()
            const list: { _id: string; name: string }[] = j.value ?? j
            const match = list.find(
              (b) => b.name.toLowerCase() === String(tc.args.name).trim().toLowerCase()
            )
            if (!match) throw new Error(`No beneficiary named "${tc.args.name}" found to update`)
            await convexMutation(convexUrl, "beneficiaries:update", {
              userId,
              sessionToken,
              beneficiaryId: match._id,
              bankName: String(tc.args.bankName).trim(),
              accountNumber: String(tc.args.accountNumber),
            })
            results.push({ name: tc.name, args: tc.args, result: { success: true, updated: match._id } })
          }
        } catch (e) {
          results.push({ name: tc.name, args: tc.args, result: { success: false, error: (e as Error).message } })
        }
        continue
      }

      // --- Money-movement tools: single path via the Convex action layer ---
      const actionPath = MONEY_ACTION_PATHS[tc.name]
      if (actionPath) {
        try {
          const rawAmount = (tc.args ?? {}).amount
          const coercedAmount = Number(rawAmount)
          if (!Number.isFinite(coercedAmount) || coercedAmount <= 0) {
            // An unparseable amount is a FAILURE, never a silent skip.
            throw new Error(`Invalid amount: ${JSON.stringify(rawAmount)}`)
          }
          // Deterministic per-tool-call key: retrying the same pendingAction
          // POST reuses it, and the wallet dedups on it, so it debits at most once.
          const rawKey = (tc.args ?? {}).idempotencyKey
          const toolKey = typeof rawKey === "string" && rawKey
            ? rawKey
            : `AI-${djb2(`${tc.name}|${JSON.stringify(tc.args ?? {})}`)}`
          const actionArgs = buildMoneyActionArgs(tc.name, tc.args ?? {}, {
            userId,
            sessionToken,
            amount: coercedAmount,
            idempotencyKey: toolKey,
          })
          const result = await convexAction(convexUrl, actionPath, actionArgs)
          results.push({ name: tc.name, args: tc.args, result })
        } catch (e) {
          results.push({ name: tc.name, args: tc.args, result: { success: false, error: (e as Error).message } })
        }
        continue
      }

      // --- Non-money tools (place_order debits inside its own mutation;
      // fund_wallet only navigates) ---
      const result = await executeToolCall(
        {
          id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "function",
          function: { name: tc.name, arguments: JSON.stringify(tc.args) },
        },
        { userId, sessionToken, budgets: finCtx.budgets, fetchUserData },
      )
      results.push({ name: tc.name, args: tc.args, result: JSON.parse(result) })
    }

    // Receipts only for operations that actually succeeded — and the ref is
    // the real provider/wallet reference, not a fabricated number. A
    // debit-after-provider failure (needsReconciliation) has success:false and
    // therefore must NOT look like a completed transfer.
    const receipt = results.map((r) => {
      if (!MONEY_ACTION_PATHS[r.name]) return null
      const result = (r.result ?? {}) as { success?: boolean; reference?: string; providerReference?: string }
      if (result.success !== true) return null
      const ref = result.reference ?? result.providerReference ?? null
      if (!ref) return null
      return {
        type: r.name,
        amount: r.args.amount,
        ref,
        whatsappUrl: `https://wa.me/?text=Kumbapay%20Receipt%3A%20${r.name}%20of%20%E2%82%A6${Number(r.args.amount).toLocaleString()}%20ref%3A%20${ref}`,
      }
    }).filter(Boolean)

    return new Response(
      JSON.stringify({
        success: true,
        results,
        receipt: receipt[0] ?? null,
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Kumba Execute] Error:", msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}
