import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { requireOwner, requireSession } from "./lib/auth"

const sessionArgs = { userId: v.id("users"), sessionToken: v.string() }

export const getProfile = query({
  args: sessionArgs,
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    return await ctx.db
      .query("sellers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first()
  },
})

export const registerStore = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    storeName: v.string(),
    description: v.optional(v.string()),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    if (!args.storeName.trim()) throw new Error("Store name is required")
    if (!args.address.trim()) throw new Error("Address is required")
    const existing = await ctx.db
      .query("sellers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first()
    if (existing) throw new Error("Store already registered")

    return await ctx.db.insert("sellers", {
      userId: args.userId,
      storeName: args.storeName.trim(),
      description: args.description,
      phone: args.phone,
      email: args.email,
      address: args.address.trim(),
      status: "pending",
      kycVerified: false,
      commissionRate: 5,
      totalSales: 0,
      createdAt: Date.now(),
    })
  },
})

async function ownSeller(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userId: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sellerId: any,
) {
  const seller = await ctx.db.get(sellerId)
  if (!seller || seller.userId !== userId) throw new Error("Not found: seller")
  return seller
}

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    sellerId: v.id("sellers"),
    storeName: v.optional(v.string()),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    bankAccount: v.optional(v.string()),
    bankName: v.optional(v.string()),
    accountName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    await ownSeller(ctx, args.userId, args.sellerId)
    const { sellerId, userId: _u, sessionToken: _s, ...updates } = args
    await ctx.db.patch(sellerId, updates)
  },
})

export const listMyProducts = query({
  args: { userId: v.id("users"), sessionToken: v.string(), sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    await ownSeller(ctx, args.userId, args.sellerId)
    return await ctx.db
      .query("sellerProducts")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect()
  },
})

export const addProduct = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    sellerId: v.id("sellers"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    category: v.string(),
    images: v.array(v.string()),
    stock: v.number(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    if (!Number.isFinite(args.price) || args.price <= 0)
      throw new Error("Price must be greater than zero");
    if (!Number.isInteger(args.stock) || args.stock < 0)
      throw new Error("Stock must be a non-negative integer");
    const seller = await ownSeller(ctx, args.userId, args.sellerId)

    const productId = await ctx.db.insert("sellerProducts", {
      sellerId: args.sellerId,
      userId: args.userId,
      name: args.name,
      description: args.description,
      price: args.price,
      originalPrice: args.originalPrice,
      category: args.category,
      images: args.images,
      stock: args.stock,
      // Building stage: sellers self-publish (no admin review queue
      // exists yet). Publish immediately with attribution instead of
      // pretending a review step gates visibility.
      status: "active",
      commissionRate: seller.commissionRate,
      tags: args.tags,
      approvedBy: args.userId,
      approvedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Published items mirror straight into the public catalog.
    await ctx.db.insert("products", {
      name: args.name,
      price: args.price,
      originalPrice: args.originalPrice,
      store: seller.storeName,
      category: args.category,
      freeDelivery: false,
      inStock: args.stock > 0,
      isMarketplace: true,
      sellerId: args.sellerId,
      sellerProductId: productId,
    })

    return productId
  },
})

export const updateProduct = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    productId: v.id("sellerProducts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    category: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    stock: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    if (args.price !== undefined && (!Number.isFinite(args.price) || args.price <= 0))
      throw new Error("Price must be greater than zero");
    if (args.stock !== undefined && (!Number.isInteger(args.stock) || args.stock < 0))
      throw new Error("Stock must be a non-negative integer");
    const { productId, userId, sessionToken: _s, ...updates } = args
    const sp0 = await ctx.db.get(productId)
    requireOwner(sp0, userId, "product")
    await ctx.db.patch(productId, { ...updates, updatedAt: Date.now() })
    const sp = await ctx.db.get(productId)
    if (sp) {
      const platformProduct = await ctx.db
        .query("products")
        .withIndex("by_sellerId", (q) => q.eq("sellerId", sp.sellerId))
        .filter((q) => q.eq(q.field("sellerProductId"), productId))
        .first()
      if (platformProduct) {
        await ctx.db.patch(platformProduct._id, {
          name: updates.name ?? platformProduct.name,
          price: updates.price ?? platformProduct.price,
          originalPrice: updates.originalPrice ?? platformProduct.originalPrice,
          category: updates.category ?? platformProduct.category,
          store: sp.sellerId ? platformProduct.store : platformProduct.store,
          inStock: updates.stock !== undefined ? updates.stock > 0 && sp.status === "active" : platformProduct.inStock,
        })
      }
    }
  },
})

// BUILDING-STAGE NOTE: publishing is by the seller themselves (no admin
// review queue exists yet) — addProduct() already publishes. This
// (re)publishes an item (e.g. after edits or restock) and records WHO
// published it, so future moderation has an attribution trail. Previously
// ANY client could approve ANY product; now ownership is enforced.
export const approveProduct = mutation({
  args: { userId: v.id("users"), sessionToken: v.string(), productId: v.id("sellerProducts") },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const sp = await ctx.db.get(args.productId)
    requireOwner(sp, args.userId, "product")
    await ownSeller(ctx, args.userId, sp!.sellerId)
    await ctx.db.patch(args.productId, { status: "active", approvedBy: args.userId, approvedAt: Date.now(), updatedAt: Date.now() })
    const mirror = await ctx.db
      .query("products")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", sp!.sellerId))
      .filter((q) => q.eq(q.field("sellerProductId"), args.productId))
      .first()
    if (mirror) {
      await ctx.db.patch(mirror._id, {
        name: sp!.name,
        price: sp!.price,
        originalPrice: sp!.originalPrice,
        category: sp!.category,
        inStock: sp!.stock > 0,
      })
    }
    return { success: true }
  },
})

export const removeProduct = mutation({
  args: { userId: v.id("users"), sessionToken: v.string(), productId: v.id("sellerProducts") },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const sp = await ctx.db.get(args.productId)
    requireOwner(sp, args.userId, "product")
    const platformProduct = await ctx.db
      .query("products")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", sp!.sellerId))
      .filter((q) => q.eq(q.field("sellerProductId"), args.productId))
      .first()
    if (platformProduct) await ctx.db.delete(platformProduct._id)
    await ctx.db.delete(args.productId)
  },
})

export const getOrders = query({
  args: { userId: v.id("users"), sessionToken: v.string(), sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const seller = await ownSeller(ctx, args.userId, args.sellerId)
    if (!seller) return []
    // Join on sellerId (server-derived at order time). The store-name
    // query below only covers legacy orders placed before linkage
    // existed — storeName is NOT unique, so it is never the authority.
    const linked = await ctx.db
      .query("orders")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .take(100)
    const legacy = await ctx.db
      .query("orders")
      .withIndex("by_store", (q) => q.eq("store", seller.storeName))
      .order("desc")
      .take(100)
    const seen = new Set(linked.map((o) => o._id))
    const merged = [...linked, ...legacy.filter((o) => !o.sellerId && !seen.has(o._id))]
    merged.sort((a, b) => b.createdAt - a.createdAt)
    return merged.slice(0, 100)
  },
})

export const getPayoutHistory = query({
  args: { userId: v.id("users"), sessionToken: v.string(), sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    await ownSeller(ctx, args.userId, args.sellerId)
    return await ctx.db
      .query("sellerPayouts")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .take(50)
  },
})

export const getAllActiveSellers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sellers")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect()
  },
})
