import { executeToolCall } from "@/lib/ai"
import { buildFinancialContext } from "@/lib/rag"

export const maxDuration = 60
export const runtime = "nodejs"

const MONEY_TOOLS = new Set(["send_money", "buy_airtime", "buy_data", "pay_electricity", "pay_tv"])

const DEBIT_CATEGORY: Record<string, string> = {
  send_money: "Transfers",
  buy_airtime: "Airtime",
  buy_data: "Data & Internet",
  pay_electricity: "Electricity",
  pay_tv: "TV & Entertainment",
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

    const debitWallet = async (toolName: string, amount: number, recipient: string, description: string, idempotencyKey?: string) => {
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount")
      // Caller-supplied key (deterministic per tool call) so POST retries
      // dedup; fall back to a fresh key only when none is provided.
      const key = idempotencyKey ?? `AI-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const res = await fetch(`${convexUrl}/api/mutation/wallet:sendMoney`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          args: { userId, sessionToken, amount, recipientName: recipient, description, category: DEBIT_CATEGORY[toolName] ?? "Other", idempotencyKey: key },
        }),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(`Wallet debit failed: ${t.slice(0, 200)}`)
      }
      // The wallet transaction reference IS the idempotency key, so the
      // receipt below points at a real, queryable record.
      return key
    }

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

      // --- Provider + debit tools (executed via lib/ai executors) ---
      const result = await executeToolCall(
        {
          id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "function",
          function: { name: tc.name, arguments: JSON.stringify(tc.args) },
        },
        { userId, sessionToken, budgets: finCtx.budgets, fetchUserData },
      )
      const parsed = JSON.parse(result)
      let walletRef: string | null = null
      let debitError: string | null = null
      // Only debit when the provider call succeeded. place_order already
      // debits inside its own mutation — debiting again would double-charge.
      // Amounts are coerced strictly: an unparseable amount is a FAILURE,
      // never a silent skip (which previously reported success).
      if (MONEY_TOOLS.has(tc.name) && parsed.success !== false) {
        const coercedAmount = Number(tc.args?.amount)
        if (!Number.isFinite(coercedAmount) || coercedAmount <= 0) {
          debitError = `Invalid amount: ${JSON.stringify(tc.args?.amount)}`
        } else {
          // Reuse one idempotency key for the whole tool call so a retried
          // POST debits at most once.
          const toolKey = typeof tc.args?.idempotencyKey === "string" && tc.args.idempotencyKey
            ? tc.args.idempotencyKey
            : `AI-${djb2(`${tc.name}|${JSON.stringify(tc.args ?? {})}`)}`
          const debitArgs = { ...(tc.args ?? {}), amount: coercedAmount, idempotencyKey: toolKey }
          try {
            if (tc.name === "send_money") {
              walletRef = await debitWallet(tc.name, debitArgs.amount, tc.args.accountName ?? "Transfer", tc.args.narration ?? `Transfer to ${tc.args.accountName ?? ""}`, toolKey)
            } else if (tc.name === "buy_airtime") {
              walletRef = await debitWallet(tc.name, debitArgs.amount, `${String(tc.args.network ?? "").toUpperCase()} Airtime`, `Airtime purchase - ${tc.args.phoneNumber ?? ""}`, toolKey)
            } else if (tc.name === "buy_data") {
              walletRef = await debitWallet(tc.name, debitArgs.amount, `${String(tc.args.network ?? "").toUpperCase()} Data`, `Data bundle - ${tc.args.phoneNumber ?? ""}`, toolKey)
            } else if (tc.name === "pay_electricity") {
              walletRef = await debitWallet(tc.name, debitArgs.amount, `Electricity - ${tc.args.providerCode ?? ""}`, `Electricity bill - meter ${tc.args.meterNumber ?? ""}`, toolKey)
            } else if (tc.name === "pay_tv") {
              walletRef = await debitWallet(tc.name, debitArgs.amount, `TV - ${tc.args.providerCode ?? ""}`, `TV subscription - ${tc.args.smartCardNumber ?? ""}`, toolKey)
            }
          } catch (e) {
            debitError = (e as Error).message
          }
        }
      }
      results.push({
        name: tc.name,
        args: tc.args,
        result: { ...parsed, ...(walletRef ? { walletRef } : {}), ...(debitError ? { debitError } : {}) },
      })
    }

    // Receipts only for operations that actually succeeded — and the ref is
    // the real wallet transaction reference, not a fabricated number.
    const receipt = results.map((r) => {
      const isTransfer = ["send_money", "buy_airtime", "buy_data", "pay_electricity", "pay_tv"].includes(r.name)
      if (!isTransfer) return null
      const ok = r.result?.success !== false && !r.result?.debitError
      if (!ok) return null
      const ref = r.result.walletRef ?? r.result.reference ?? null
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
