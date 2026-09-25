import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { requireOwner, requireSession } from "./lib/auth"

const sessionArgs = { userId: v.id("users"), sessionToken: v.string() }

// List scheduled payments for a user
export const list = query({
  args: sessionArgs,
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const payments = await ctx.db
      .query("scheduledPayments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()
    return payments
  },
})

// Create a scheduled payment
export const create = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    recipientName: v.string(),
    amount: v.number(),
    currency: v.optional(v.string()),
    frequency: v.union(v.literal("once"), v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    nextPaymentDate: v.number(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    if (!Number.isFinite(args.amount) || args.amount <= 0)
      throw new Error("Amount must be greater than zero");
    if (!args.recipientName.trim())
      throw new Error("Recipient name is required");
    if (!Number.isFinite(args.nextPaymentDate) || args.nextPaymentDate <= 0)
      throw new Error("Invalid nextPaymentDate");
    // Idempotent create: a retry with the same key returns the original.
    if (args.idempotencyKey) {
      const dup = await ctx.db
        .query("scheduledPayments")
        .withIndex("by_userId_idempotencyKey", (q) =>
          q.eq("userId", args.userId).eq("idempotencyKey", args.idempotencyKey!),
        )
        .first();
      if (dup) return dup._id;
    }
    const id = await ctx.db.insert("scheduledPayments", {
      userId: args.userId,
      recipientName: args.recipientName.trim(),
      amount: args.amount,
      currency: args.currency ?? "NGN",
      frequency: args.frequency,
      nextPaymentDate: args.nextPaymentDate,
      isActive: true,
      description: args.description,
      icon: args.icon,
      idempotencyKey: args.idempotencyKey,
      createdAt: Date.now(),
    })
    return id
  },
})

// Toggle active status (ownership-checked)
export const toggleActive = mutation({
  args: { userId: v.id("users"), sessionToken: v.string(), id: v.id("scheduledPayments") },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const payment = await ctx.db.get(args.id)
    requireOwner(payment, args.userId, "scheduled payment")
    await ctx.db.patch(args.id, { isActive: !payment!.isActive })
    return { isActive: !payment!.isActive }
  },
})

// Delete a scheduled payment (ownership-checked)
export const remove = mutation({
  args: { userId: v.id("users"), sessionToken: v.string(), id: v.id("scheduledPayments") },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const payment = await ctx.db.get(args.id)
    requireOwner(payment, args.userId, "scheduled payment")
    await ctx.db.delete(args.id)
    return { success: true }
  },
})

// Update next payment date after execution.
// INTERNAL ONLY (was a public mutation any client could call to tamper
// with another user's schedule). Only the cron may invoke this.
export const updateNextDate = internalMutation({
  args: {
    id: v.id("scheduledPayments"),
    nextPaymentDate: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { nextPaymentDate: args.nextPaymentDate })
  },
})

export const executePayments = internalMutation({
  handler: async (ctx) => {
    const now = Date.now()
    const payments = await ctx.db
      .query("scheduledPayments")
      .withIndex("by_active_nextDate", (q) => q.eq("isActive", true).lte("nextPaymentDate", now))
      .take(100)

    for (const payment of payments) {
      const wallet = await ctx.db
        .query("wallets")
        .withIndex("by_userId", (q) => q.eq("userId", payment.userId))
        .first()

      if (!wallet) continue

      if (wallet.balance < payment.amount) {
        await ctx.db.patch(payment._id, { isActive: false })
        await ctx.db.insert("transactions", {
          userId: payment.userId,
          type: "debit",
          amount: payment.amount,
          currency: payment.currency,
          description: `Failed: ${payment.description ?? payment.recipientName}`,
          status: "failed",
          category: "Bills",
          reference: `SCH-FAIL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
        })
        continue
      }

      await ctx.db.patch(wallet._id, {
        balance: wallet.balance - payment.amount,
        updatedAt: Date.now(),
      })

      await ctx.db.insert("transactions", {
        userId: payment.userId,
        type: "debit",
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description ?? payment.recipientName,
        status: "completed",
        recipientName: payment.recipientName,
        category: "Bills",
        reference: `SCH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      })

      if (payment.frequency === "once") {
        await ctx.db.patch(payment._id, { isActive: false })
      } else {
        let nextDate = now
        switch (payment.frequency) {
          case "daily":
            nextDate = now + 86400000
            break
          case "weekly":
            nextDate = now + 7 * 86400000
            break
          case "monthly":
            nextDate = now + 30 * 86400000
            break
        }
        await ctx.db.patch(payment._id, { nextPaymentDate: nextDate })
      }
    }
  },
})
