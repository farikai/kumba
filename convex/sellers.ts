import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sellers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first()
  },
})

export const registerStore = mutation({
  args: {
    userId: v.id("users"),
    storeName: v.string(),
    description: v.optional(v.string()),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sellers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first()
    if (existing) throw new Error("Store already registered")

    return await ctx.db.insert("sellers", {
      userId: args.userId,
      storeName: args.storeName,
      description: args.description,
      phone: args.phone,
      email: args.email,
      address: args.address,
      status: "pending",
      kycVerified: false,
      commissionRate: 5,
      totalSales: 0,
      createdAt: Date.now(),
    })
  },
})

export const updateProfile = mutation({
  args: {
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
    const { sellerId, ...updates } = args
    await ctx.db.patch(sellerId, updates)
  },
})

export const listMyProducts = query({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sellerProducts")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .collect()
  },
})

export const addProduct = mutation({
  args: {
    sellerId: v.id("sellers"),
    userId: v.id("users"),
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
    const seller = await ctx.db.get(args.sellerId)
    if (!seller) throw new Error("Seller not found")

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
      status: "pending_review",
      commissionRate: seller.commissionRate,
      tags: args.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

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
    const { productId, ...updates } = args
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
          inStock: updates.stock ? updates.stock > 0 : platformProduct.inStock,
        })
      }
    }
  },
})

export const removeProduct = mutation({
  args: { productId: v.id("sellerProducts") },
  handler: async (ctx, args) => {
    const sp = await ctx.db.get(args.productId)
    if (!sp) throw new Error("Product not found")
    const platformProduct = await ctx.db
      .query("products")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", sp.sellerId))
      .filter((q) => q.eq(q.field("sellerProductId"), args.productId))
      .first()
    if (platformProduct) await ctx.db.delete(platformProduct._id)
    await ctx.db.delete(args.productId)
  },
})

export const getOrders = query({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    const seller = await ctx.db.get(args.sellerId)
    if (!seller) return []
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("store"), seller.storeName))
      .order("desc")
      .take(100)
  },
})

export const getPayoutHistory = query({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
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
