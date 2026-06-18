import { generateEmbeddings } from "./embeddings"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL

interface Chunk {
  content: string
  source: string
  chunkType: string
}

function chunkTransactions(transactions: any[]): Chunk[] {
  return transactions.slice(0, 100).map((t) => {
    const date = new Date(t.createdAt).toLocaleDateString("en-NG")
    const dir = t.type === "credit" ? "received" : "sent"
    return {
      content: `On ${date}, you ${dir} ₦${t.amount.toLocaleString()} for ${t.description}. Status: ${t.status}. Reference: ${t.reference ?? "N/A"}.`,
      source: "transaction",
      chunkType: "transaction",
    }
  })
}

function chunkBeneficiaries(beneficiaries: any[]): Chunk[] {
  return beneficiaries.map((b) => ({
    content: `Saved beneficiary: ${b.name}, Bank: ${b.bankName}, Account: ${b.accountNumber}${b.tag ? `, Tag: ${b.tag}` : ""}${b.isFavorite ? " (Favorite)" : ""}.`,
    source: "beneficiary",
    chunkType: "beneficiary",
  }))
}

function chunkScheduledPayments(payments: any[]): Chunk[] {
  return payments.map((p) => {
    const nextDate = new Date(p.nextPaymentDate).toLocaleDateString("en-NG")
    return {
      content: `${p.frequency.charAt(0).toUpperCase() + p.frequency.slice(1)} payment: ₦${p.amount.toLocaleString()} to ${p.recipientName}${p.description ? ` (${p.description})` : ""}. Next payment: ${nextDate}. Status: ${p.isActive ? "Active" : "Paused"}.`,
      source: "scheduledPayment",
      chunkType: "scheduled_payment",
    }
  })
}

function chunkSpendingSummary(transactions: any[], balance: number): Chunk[] {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const monthTxs = transactions.filter((t: any) => t.createdAt >= firstOfMonth)
  const debits = monthTxs.filter((t: any) => t.type === "debit")
  const totalSpent = debits.reduce((s: number, t: any) => s + t.amount, 0)
  const byCategory: Record<string, number> = {}
  for (const t of debits) {
    const cat = t.category ?? t.description ?? "Other"
    byCategory[cat] = (byCategory[cat] ?? 0) + t.amount
  }
  const topCats = Object.entries(byCategory)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat} (₦${(amt as number).toLocaleString()})`)
    .join(", ")

  return [
    {
      content: `Monthly summary: This month (${now.toLocaleString("default", { month: "long", year: "numeric" })}), your total spending is ₦${totalSpent.toLocaleString()} across ${debits.length} transactions. Top categories: ${topCats || "None"}. Current balance: ₦${balance.toLocaleString()}.`,
      source: "analytics",
      chunkType: "monthly_summary",
    },
  ]
}

function chunkKnowledgeBase(): Chunk[] {
  return [
    {
      content: "Kumbapay supports sending money to any Nigerian bank via 9PSB. You can send to saved beneficiaries or enter new account details.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Airtime can be purchased for MTN, Airtel, Glo, and 9mobile networks through Kumbapay.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Data bundles are available for all Nigerian networks. Prices and plans vary by network.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Electricity bills can be paid for IKEDC, EKEDC, AEDC, PHEDC, IBEDC, and KEDC. You need your meter number.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "TV subscriptions supported: DSTV, GOtv, and StarTimes. You need your smart card number.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "You can schedule one-time or recurring payments (daily, weekly, monthly) for bills, rent, or any regular expenses.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Kumbapay receipts can be shared on WhatsApp after any successful transaction.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Transaction PIN is required to authorize all payments and transfers. Keep your PIN secure and never share it.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "You can compare product prices across stores like Jumia and Konga using Kumbapay's shopping feature.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Kumba AI can help you track your budget, analyze spending patterns, and give personalized financial advice.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Saving tip: Try the 50/30/20 rule - 50% for needs, 30% for wants, 20% for savings. Kumbapay can help you track this.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Bank transfers in Nigeria typically use NUBAN (10-digit account numbers) and bank codes (e.g., 044 for Access Bank, 058 for GTBank).",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Kumbapay has an AI Budget Planner that helps you create and track budgets. You can set spending limits by category and get alerts when you're close to your limit.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "The Budget Analytics screen shows your spending vs budget in charts and reports. See which categories are over or under budget and adjust accordingly.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Kumbapay has a Transaction Analytics screen with visual insights on your income, expenses, and spending trends over time.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "The AI Tax Calculator estimates your PAYE tax based on Nigerian tax brackets. It uses your income data to calculate estimated monthly and annual tax.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "The Financial Stability Analyzer scores your financial health based on savings rate, emergency fund, income vs expenses, and gives personalized recommendations.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "You can manage beneficiaries in Kumbapay: add, edit, or remove saved bank accounts for faster transfers. Beneficiaries can be marked as favorites.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Kumbapay has a QR code scanner for quick payments. Scan a merchant's QR code to pay without entering account details.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "The Fund Wallet screen shows options to add money to your Kumbapay wallet: bank transfer, card payment, or from another wallet.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Kumbapay's transaction history shows all your completed, pending, and failed transactions with full details, filters, and search.",
      source: "kb",
      chunkType: "knowledge",
    },
    {
      content: "Nigerian PAYE tax brackets (2024): 1% on first ₦300k, 5% on ₦300k-₦600k, 10% on ₦600k-₦1.1M, 15% on ₦1.1M-₦1.6M, 20% on ₦1.6M-₦3.2M, 24% above ₦3.2M.",
      source: "kb",
      chunkType: "knowledge",
    },
  ]
}

export function buildRagChunks(
  transactions: any[],
  beneficiaries: any[],
  scheduledPayments: any[],
  balance: number,
): Chunk[] {
  return [
    ...chunkTransactions(transactions),
    ...chunkBeneficiaries(beneficiaries),
    ...chunkScheduledPayments(scheduledPayments),
    ...chunkSpendingSummary(transactions, balance),
    ...chunkKnowledgeBase(),
  ]
}

export async function ingestUserData(
  userId: string,
  transactions: any[],
  beneficiaries: any[],
  scheduledPayments: any[],
  balance: number,
) {
  if (!convexUrl) return

  const chunks = buildRagChunks(transactions, beneficiaries, scheduledPayments, balance)

  const batchSize = 20
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    const embeddings = await generateEmbeddings(batch.map((c) => c.content))

    const payload = batch.map((c, j) => ({
      content: c.content,
      embedding: embeddings[j],
      source: c.source,
      chunkType: c.chunkType,
    }))

    await fetch(`${convexUrl}/api/mutation/rag:store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ args: { userId, chunks: payload } }),
    })
  }
}

export async function clearUserRagChunks(userId: string) {
  if (!convexUrl) return
  await fetch(`${convexUrl}/api/mutation/rag:clearUserChunks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args: { userId } }),
  })
}
