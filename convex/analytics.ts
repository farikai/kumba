import { query } from "./_generated/server"
import { v } from "convex/values"

const MONTH_MS = 30 * 24 * 60 * 60 * 1000

export const getFinancialHealth = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now()
    const monthStart = now - MONTH_MS
    const prevMonthStart = now - 2 * MONTH_MS

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first()
    const balance = wallet?.balance ?? 0

    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .collect()

    const currentMonthTxs = allTransactions.filter((t) => t.createdAt >= monthStart)
    const prevMonthTxs = allTransactions.filter(
      (t) => t.createdAt >= prevMonthStart && t.createdAt < monthStart
    )

    const income = currentMonthTxs
      .filter((t) => t.type === "credit" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0)
    const expenses = currentMonthTxs
      .filter((t) => t.type === "debit" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0)
    const prevExpenses = prevMonthTxs
      .filter((t) => t.type === "debit" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0)

    const monthlyAvgExpense = expenses || 1
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 10000) / 100 : 0
    const emergencyFundMonths = monthlyAvgExpense > 0 ? balance / monthlyAvgExpense : 0
    const spendingGrowth = prevExpenses > 0
      ? Math.round(((expenses - prevExpenses) / prevExpenses) * 10000) / 100
      : 0

    let score = 50
    if (savingsRate >= 20) score += 20
    else if (savingsRate >= 10) score += 10
    else if (savingsRate >= 5) score += 5

    if (emergencyFundMonths >= 6) score += 20
    else if (emergencyFundMonths >= 3) score += 12
    else if (emergencyFundMonths >= 1) score += 5

    if (spendingGrowth <= 0) score += 5
    else if (spendingGrowth <= 10) score += 2
    else score -= 5

    if (income > expenses) score += 5
    else score -= 10

    score = Math.max(0, Math.min(100, score))

    return {
      balance,
      income,
      expenses,
      savingsRate,
      emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10,
      spendingGrowth,
      score,
      transactionCount: currentMonthTxs.length,
    }
  },
})

export const getMonthlySummary = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now()
    const monthStart = now - MONTH_MS

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("createdAt"), monthStart))
      .collect()

    const income = transactions
      .filter((t) => t.type === "credit" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0)
    const expenses = transactions
      .filter((t) => t.type === "debit" && t.status === "completed")
      .reduce((s, t) => s + t.amount, 0)

    const byCategory: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type === "debit" && t.status === "completed") {
        const cat = t.category ?? "Other"
        byCategory[cat] = (byCategory[cat] ?? 0) + t.amount
      }
    }

    return { income, expenses, byCategory, transactionCount: transactions.length }
  },
})
