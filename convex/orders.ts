import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50)
  },
})

export const placeOrder = mutation({
  args: {
    userId: v.id("users"),
    productName: v.string(),
    productPrice: v.number(),
    store: v.string(),
    category: v.string(),
    deliveryAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first()
    if (!wallet) throw new Error("Wallet not found")
    if (wallet.balance < args.productPrice) throw new Error("Insufficient balance")

    const reference = `ORD-${Date.now().toString().slice(-10)}`

    await ctx.db.patch(wallet._id, {
      balance: wallet.balance - args.productPrice,
      updatedAt: Date.now(),
    })

    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      productName: args.productName,
      productPrice: args.productPrice,
      store: args.store,
      category: args.category,
      status: "completed",
      reference,
      deliveryAddress: args.deliveryAddress,
      createdAt: Date.now(),
    })

    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: "debit",
      amount: args.productPrice,
      currency: wallet.currency,
      description: `Order: ${args.productName} from ${args.store}`,
      status: "completed",
      category: args.category,
      reference,
      createdAt: Date.now(),
    })

    return {
      success: true,
      orderId,
      reference,
      newBalance: wallet.balance - args.productPrice,
      receipt: {
        ref: reference,
        amount: args.productPrice,
        item: args.productName,
        store: args.store,
        whatsappUrl: `https://wa.me/?text=Kumbapay%20Order%20Receipt%3A%20${args.productName}%20from%20${args.store}%20-%20%E2%82%A6${args.productPrice.toLocaleString()}%20ref%3A%20${reference}`,
      },
    }
  },
})
