import { generateEmbedding } from "./embeddings"

export interface FinancialContext {
  user: { name: string; phone: string; tag?: string } | null
  balance: number
  recentTransactions: Transaction[]
  spendingByCategory: Record<string, number>
  totalSpentThisMonth: number
  totalReceivedThisMonth: number
  beneficiaries: { name: string; bankName: string; accountNumber: string }[]
  scheduledPayments: { recipientName: string; amount: number; frequency: string; nextDate: number; isActive: boolean }[]
  savingsStreak: number
  monthlyBudget: number
  budgetUsed: number
  semanticChunks: string[]
}

interface Transaction {
  _id: string
  type: "credit" | "debit" | "transfer"
  amount: number
  description: string
  status: string
  recipientName?: string
  createdAt: number
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL

export async function buildFinancialContext(userId: string): Promise<FinancialContext> {
  const empty = getEmptyContext()
  if (!convexUrl) return empty

  try {
    const [userRaw, balance, transactions, beneficiaries, scheduled] = await Promise.all([
      fetchFromConvex(convexUrl, "users:getById", { userId }),
      fetchFromConvex(convexUrl, "wallet:getBalance", { userId }),
      fetchFromConvex(convexUrl, "wallet:getTransactions", { userId, limit: 50 }),
      fetchFromConvex(convexUrl, "beneficiaries:getAll", { userId }),
      fetchFromConvex(convexUrl, "scheduled:list", { userId }),
    ])

    const user = userRaw as { name: string; phone: string; tag?: string } | null
    const txs = transactions as Transaction[]
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const thisMonthTxs = txs.filter((t) => t.createdAt >= firstOfMonth)
    const debits = thisMonthTxs.filter((t) => t.type === "debit")
    const credits = thisMonthTxs.filter((t) => t.type === "credit")

    const byCategory: Record<string, number> = {}
    for (const t of debits) {
      const cat = getCategory(t.description)
      byCategory[cat] = (byCategory[cat] ?? 0) + t.amount
    }

    const totalSpent = debits.reduce((s, t) => s + t.amount, 0)
    const totalReceived = credits.reduce((s, t) => s + t.amount, 0)

    const ctx: FinancialContext = {
      user,
      balance: (balance as number) ?? 0,
      recentTransactions: txs.slice(0, 10),
      spendingByCategory: byCategory,
      totalSpentThisMonth: totalSpent,
      totalReceivedThisMonth: totalReceived,
      beneficiaries: beneficiaries as any[],
      scheduledPayments: scheduled as any[],
      savingsStreak: calculateSavingsStreak(txs),
      monthlyBudget: 300000,
      budgetUsed: totalSpent,
      semanticChunks: [],
    }

    try {
      ctx.semanticChunks = await querySemanticRag(userId, txs)
    } catch {
      ctx.semanticChunks = []
    }

    return ctx
  } catch {
    return empty
  }
}

async function querySemanticRag(userId: string, _transactions: Transaction[]): Promise<string[]> {
  if (!convexUrl) return []

  try {
    const res = await fetch(`${convexUrl}/api/query/rag:getAllChunks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ args: { userId } }),
    })
    if (!res.ok) return []
    const { value: chunks } = await res.json()
    if (!chunks || (chunks as any[]).length === 0) return []

    const queryEmbedding = await generateEmbedding("User financial information, transactions, beneficiaries, and account overview")

    const scored = (chunks as any[])
      .map((c: any) => ({
        content: c.content,
        score: cosineSimilarity(queryEmbedding, c.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    return scored.map((s) => s.content)
  } catch {
    return []
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

export function formatFinancialContext(ctx: FinancialContext): string {
  const lines: string[] = []

  lines.push("CURRENT USER FINANCIAL CONTEXT (REAL DATA):")
  if (ctx.user) {
    lines.push(`- User: ${ctx.user.name} (${ctx.user.phone})`)
  }
  lines.push(`- Wallet Balance: ₦${ctx.balance.toLocaleString()}`)
  lines.push(`- This Month: Spent ₦${ctx.totalSpentThisMonth.toLocaleString()}, Received ₦${ctx.totalReceivedThisMonth.toLocaleString()}`)
  lines.push(`- Monthly Budget: ₦${ctx.monthlyBudget.toLocaleString()} (${Math.round((ctx.budgetUsed / ctx.monthlyBudget) * 100)}% used)`)

  if (ctx.savingsStreak > 0) {
    lines.push(`- Savings Streak: ${ctx.savingsStreak} day${ctx.savingsStreak > 1 ? "s" : ""}`)
  }

  if (Object.keys(ctx.spendingByCategory).length > 0) {
    lines.push("")
    lines.push("SPENDING BY CATEGORY THIS MONTH:")
    for (const [cat, amount] of Object.entries(ctx.spendingByCategory).sort((a, b) => b[1] - a[1])) {
      lines.push(`  • ${cat}: ₦${amount.toLocaleString()}`)
    }
  }

  if (ctx.recentTransactions.length > 0) {
    lines.push("")
    lines.push("RECENT TRANSACTIONS (last 10):")
    for (const t of ctx.recentTransactions) {
      const dir = t.type === "credit" ? "+" : "-"
      const date = new Date(t.createdAt).toLocaleDateString("en-NG")
      lines.push(`  • ${date} ${dir}₦${t.amount.toLocaleString()} - ${t.description} [${t.status}]`)
    }
  }

  if (ctx.beneficiaries.length > 0) {
    lines.push("")
    lines.push("SAVED BENEFICIARIES:")
    for (const b of ctx.beneficiaries) {
      lines.push(`  • ${b.name} - ${b.bankName} (${b.accountNumber})`)
    }
  }

  if (ctx.scheduledPayments.length > 0) {
    lines.push("")
    lines.push("SCHEDULED PAYMENTS:")
    for (const s of ctx.scheduledPayments) {
      const nextDate = new Date(s.nextDate).toLocaleDateString("en-NG")
      lines.push(`  • ₦${s.amount.toLocaleString()} to ${s.recipientName} - ${s.frequency} (next: ${nextDate})${s.isActive ? "" : " [PAUSED]"}`)
    }
  }

  if (ctx.semanticChunks.length > 0) {
    lines.push("")
    lines.push("RELEVANT KNOWLEDGE:")
    for (const chunk of ctx.semanticChunks.slice(0, 5)) {
      lines.push(`  • ${chunk}`)
    }
  }

  return lines.join("\n")
}

function getEmptyContext(): FinancialContext {
  return {
    user: null,
    balance: 0,
    recentTransactions: [],
    spendingByCategory: {},
    totalSpentThisMonth: 0,
    totalReceivedThisMonth: 0,
    beneficiaries: [],
    scheduledPayments: [],
    savingsStreak: 0,
    monthlyBudget: 300000,
    budgetUsed: 0,
    semanticChunks: [],
  }
}

async function fetchFromConvex(convexUrl: string, path: string, args: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${convexUrl}/api/query/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args }),
  })
  if (!res.ok) throw new Error(`Convex query ${path} failed: ${res.status}`)
  return res.json()
}

function getCategory(description: string): string {
  const lower = description.toLowerCase()
  if (lower.includes("food") || lower.includes("restaurant") || lower.includes("chicken") || lower.includes("shoprite") || lower.includes("market") || lower.includes("groceries")) return "Food & Groceries"
  if (lower.includes("uber") || lower.includes("bolt") || lower.includes("transport") || lower.includes("fuel") || lower.includes("bus")) return "Transport"
  if (lower.includes("airtime") || lower.includes("mtn") || lower.includes("airtel") || lower.includes("glo") || lower.includes("9mobile") || lower.includes("recharge")) return "Airtime"
  if (lower.includes("data") || lower.includes("internet") || lower.includes("wifi")) return "Data & Internet"
  if (lower.includes("electricity") || lower.includes("nepa") || lower.includes("aedc") || lower.includes("ikedc") || lower.includes("ekedc")) return "Electricity"
  if (lower.includes("dstv") || lower.includes("gotv") || lower.includes("startimes") || lower.includes("tv") || lower.includes("subscription")) return "TV & Entertainment"
  if (lower.includes("rent")) return "Rent"
  if (lower.includes("transfer") || lower.includes("send") || lower.includes("sent")) return "Transfers"
  if (lower.includes("salary") || lower.includes("credit") || lower.includes("refund")) return "Income"
  return "Other"
}

function calculateSavingsStreak(transactions: Transaction[]): number {
  const credits = transactions.filter((t) => t.type === "credit" && t.status === "completed").sort((a, b) => b.createdAt - a.createdAt)
  if (credits.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 1
  const seenDates = new Set<string>()

  for (const t of credits) {
    const d = new Date(t.createdAt)
    d.setHours(0, 0, 0, 0)
    seenDates.add(d.getTime().toString())
  }

  const dayMs = 86400000
  for (let i = 1; i < 365; i++) {
    const checkDate = new Date(today.getTime() - i * dayMs)
    if (seenDates.has(checkDate.getTime().toString())) {
      streak++
    } else {
      break
    }
  }

  return streak
}
