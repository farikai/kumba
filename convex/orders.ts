import { query, mutation } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { v } from "convex/values"
import { requireSession } from "./lib/auth"

export const list = query({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
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
    sessionToken: v.string(),
    productName: v.string(),
    productPrice: v.number(),
    store: v.string(),
    category: v.string(),
    deliveryAddress: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
    // Marketplace linkage. sellerId is never trusted from the client —
    // it is re-derived from the sellerProduct record below.
    sellerProductId: v.optional(v.id("sellerProducts")),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    if (!Number.isFinite(args.productPrice) || args.productPrice <= 0)
      throw new Error("Product price must be greater than zero");
    if (!args.productName.trim()) throw new Error("Product name is required");

    // Idempotent: a retried checkout with the same key returns the
    // original order instead of debiting twice.
    if (args.idempotencyKey) {
      const dup = await ctx.db
        .query("transactions")
        .withIndex("by_userId_idempotencyKey", (q) =>
          q.eq("userId", args.userId).eq("idempotencyKey", args.idempotencyKey!),
        )
        .first();
      if (dup) {
        const wallet = await ctx.db
          .query("wallets")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .first();
        return {
          success: true,
          orderId: null,
          reference: dup.reference ?? args.idempotencyKey,
          newBalance: wallet?.balance ?? 0,
          duplicate: true,
          receipt: null,
        };
      }
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first()
    if (!wallet) throw new Error("Wallet not found")
    if (wallet.balance < args.productPrice) throw new Error("Insufficient balance")

    const reference = args.idempotencyKey ??
      `ORD-${Date.now().toString().slice(-10)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    // Marketplace fulfillment (atomic with the debit above): validate the
    // item is actually sellable, decrement stock, accrue the seller payout.
    // Seeded-catalog orders (no sellerProductId) skip this block.
    let sellerId: Id<"sellers"> | undefined = undefined
    if (args.sellerProductId) {
      const sp = await ctx.db.get(args.sellerProductId)
      if (!sp) throw new Error("Product no longer exists")
      if (sp.status !== "active") throw new Error("Product is not available for sale")
      if (sp.stock <= 0) throw new Error("Product is out of stock")
      // productPrice is item + delivery fee, so it must cover the item.
      if (args.productPrice < sp.price)
        throw new Error("Order total is below the item price")
      sellerId = sp.sellerId
      const newStock = sp.stock - 1
      await ctx.db.patch(sp._id, {
        stock: newStock,
        status: newStock <= 0 ? "out_of_stock" : sp.status,
        updatedAt: Date.now(),
      })
      const mirror = await ctx.db
        .query("products")
        .withIndex("by_sellerId", (q) => q.eq("sellerId", sp.sellerId))
        .filter((q) => q.eq(q.field("sellerProductId"), sp._id))
        .first()
      if (mirror) await ctx.db.patch(mirror._id, { inStock: newStock > 0 })

      const rate = sp.commissionRate ?? 5
      const commission = Math.round((sp.price * rate) / 100)
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
      const orderIdPlaceholder = await ctx.db.insert("orders", {
        userId: args.userId,
        productName: args.productName,
        productPrice: args.productPrice,
        store: args.store,
        category: args.category,
        status: "completed",
        reference,
        deliveryAddress: args.deliveryAddress,
        sellerId,
        sellerProductId: sp._id,
        createdAt: Date.now(),
      })
      await ctx.db.insert("sellerPayouts", {
        sellerId: sp.sellerId,
        userId: sp.userId,
        amount: sp.price - commission,
        status: "pending",
        reference: `PAY-${reference}`,
        orderId: orderIdPlaceholder,
        periodStart: monthStart,
        periodEnd: monthEnd,
        createdAt: Date.now(),
      })
      const seller = await ctx.db.get(sp.sellerId)
      if (seller) await ctx.db.patch(sp.sellerId, { totalSales: seller.totalSales + sp.price })

      await ctx.db.patch(wallet._id, {
        balance: wallet.balance - args.productPrice,
        updatedAt: Date.now(),
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
        idempotencyKey: args.idempotencyKey,
        createdAt: Date.now(),
      })
      return {
        success: true,
        orderId: orderIdPlaceholder,
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
    }

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
      idempotencyKey: args.idempotencyKey,
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
