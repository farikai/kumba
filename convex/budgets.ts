import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { MONTH_MS } from "./lib/constants"
import { requireOwner, requireSession } from "./lib/auth"

const sessionArgs = { userId: v.id("users"), sessionToken: v.string() }

export const list = query({
  args: sessionArgs,
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    return await ctx.db
      .query("budgets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()
  },
})

export const setBudget = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    category: v.string(),
    amount: v.number(),
    period: v.union(v.literal("weekly"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    if (!Number.isFinite(args.amount) || args.amount <= 0)
      throw new Error("Budget amount must be greater than zero");
    const category = args.category.trim();
    if (!category) throw new Error("Category is required");
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_userId_category", (q) =>
        q.eq("userId", args.userId).eq("category", category)
      )
      .first()
    if (existing) {
      await ctx.db.patch(existing._id, { amount: args.amount, period: args.period })
      return existing._id
    }
    return await ctx.db.insert("budgets", {
      userId: args.userId,
      category,
      amount: args.amount,
      period: args.period,
      createdAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { userId: v.id("users"), sessionToken: v.string(), id: v.id("budgets") },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const budget = await ctx.db.get(args.id)
    requireOwner(budget, args.userId, "budget")
    await ctx.db.delete(args.id)
  },
})

export const getSpendingByCategory = query({
  args: { userId: v.id("users"), sessionToken: v.string(), startDate: v.number(), endDate: v.number() },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), args.startDate),
          q.lte(q.field("createdAt"), args.endDate),
          q.eq(q.field("type"), "debit")
        )
      )
      .collect()
    const grouped: Record<string, number> = {}
    for (const t of transactions) {
      const cat = t.category ?? "Other"
      grouped[cat] = (grouped[cat] ?? 0) + t.amount
    }
    return grouped
  },
})

export const getBudgetAnalytics = query({
  args: sessionArgs,
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const now = Date.now()
    const monthStart = now - MONTH_MS
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()
    const spending = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), monthStart),
          q.eq(q.field("type"), "debit")
        )
      )
      .collect()
    const spendingByCategory: Record<string, number> = {}
    for (const t of spending) {
      const cat = t.category ?? "Other"
      spendingByCategory[cat] = (spendingByCategory[cat] ?? 0) + t.amount
    }
    const analytics = budgets.map((b) => ({
      category: b.category,
      budget: b.amount,
      spent: spendingByCategory[b.category] ?? 0,
      remaining: b.amount - (spendingByCategory[b.category] ?? 0),
      percentUsed: b.amount > 0 ? Math.round(((spendingByCategory[b.category] ?? 0) / b.amount) * 100) : 0,
    }))
    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
    const totalSpent = Object.values(spendingByCategory).reduce((s, v) => s + v, 0)
    return { analytics, totalBudget, totalSpent, budgets, spendingByCategory }
  },
})
