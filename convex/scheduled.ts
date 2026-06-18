import { mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"

// List scheduled payments for a user
export const list = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
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
    recipientName: v.string(),
    amount: v.number(),
    currency: v.optional(v.string()),
    frequency: v.union(v.literal("once"), v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    nextPaymentDate: v.number(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("scheduledPayments", {
      userId: args.userId,
      recipientName: args.recipientName,
      amount: args.amount,
      currency: args.currency ?? "NGN",
      frequency: args.frequency,
      nextPaymentDate: args.nextPaymentDate,
      isActive: true,
      description: args.description,
      icon: args.icon,
      createdAt: Date.now(),
    })
    return id
  },
})

// Toggle active status
export const toggleActive = mutation({
  args: { id: v.id("scheduledPayments") },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.id)
    if (!payment) throw new Error("Payment not found")
    await ctx.db.patch(args.id, { isActive: !payment.isActive })
    return { isActive: !payment.isActive }
  },
})

// Delete a scheduled payment
export const remove = mutation({
  args: { id: v.id("scheduledPayments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return { success: true }
  },
})

// Update next payment date after execution
export const updateNextDate = mutation({
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
      .filter((q) => q.and(q.eq(q.field("isActive"), true), q.lte(q.field("nextPaymentDate"), now)))
      .collect()

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
          reference: `SCH-FAIL-${Date.now()}`,
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
        reference: `SCH-${Date.now()}`,
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
