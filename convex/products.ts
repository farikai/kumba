import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("products").collect()
    const q = args.query.toLowerCase()
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.store.toLowerCase().includes(q)
    ).filter((p) => p.inStock)
  },
})

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("inStock"), true))
      .collect()
  },
})

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").filter((q) => q.eq(q.field("inStock"), true)).collect()
  },
})

export const getBySeller = query({
  args: { sellerId: v.id("sellers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", args.sellerId))
      .collect()
  },
})

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first()
    if (existing) return { seeded: false, reason: "already seeded" }

    const products = [
      { name: "Mama Gold Premium Rice (50kg)", price: 45000, originalPrice: 52000, store: "Jumia", category: "Rice & Grains", rating: 4.8, freeDelivery: true, savings: 7000, inStock: true, isMarketplace: false },
      { name: "Royal Stallion Rice (50kg)", price: 47500, originalPrice: 51000, store: "Konga", category: "Rice & Grains", rating: 4.6, freeDelivery: false, savings: 3500, inStock: true, isMarketplace: false },
      { name: "Caprice Rice (50kg)", price: 44000, originalPrice: 50000, store: "Jiji", category: "Rice & Grains", rating: 4.7, freeDelivery: true, savings: 6000, inStock: true, isMarketplace: false },
      { name: "Tomato Rice (50kg)", price: 43000, originalPrice: 49000, store: "Jumia", category: "Rice & Grains", rating: 4.5, freeDelivery: true, savings: 6000, inStock: true, isMarketplace: false },
      { name: "Golden Penny Spaghetti (1kg x 20)", price: 12500, originalPrice: 15000, store: "Konga", category: "Rice & Grains", rating: 4.4, freeDelivery: true, savings: 2500, inStock: true, isMarketplace: false },
      { name: "Indomie Instant Noodles (50 carton)", price: 18500, originalPrice: 22000, store: "Jumia", category: "Beverages", rating: 4.9, freeDelivery: true, savings: 3500, inStock: true, isMarketplace: false },
      { name: "Nestle Peak Milk (400g x 24)", price: 32000, originalPrice: 38000, store: "Jiji", category: "Beverages", rating: 4.7, freeDelivery: true, savings: 6000, inStock: true, isMarketplace: false },
      { name: "Milo Active (500g x 12)", price: 28000, originalPrice: 34000, store: "Konga", category: "Beverages", rating: 4.6, freeDelivery: false, savings: 6000, inStock: true, isMarketplace: false },
      { name: "Cway Pure Water (75cl x 12)", price: 3200, originalPrice: 4000, store: "Jumia", category: "Beverages", rating: 4.3, freeDelivery: true, savings: 800, inStock: true, isMarketplace: false },
      { name: "Nokia 105 Dual SIM", price: 12500, originalPrice: 15000, store: "Jumia", category: "Electronics", rating: 4.5, freeDelivery: true, savings: 2500, inStock: true, isMarketplace: false },
      { name: "Tecno Spark 20 Pro", price: 185000, originalPrice: 210000, store: "Konga", category: "Electronics", rating: 4.7, freeDelivery: true, savings: 25000, inStock: true, isMarketplace: false },
      { name: "Oraimo Boom 3 Speaker", price: 8500, originalPrice: 12000, store: "Jiji", category: "Electronics", rating: 4.4, freeDelivery: true, savings: 3500, inStock: true, isMarketplace: false },
      { name: "LG 43inch HD Smart TV", price: 285000, originalPrice: 350000, store: "Jumia", category: "Electronics", rating: 4.6, freeDelivery: true, savings: 65000, inStock: true, isMarketplace: false },
      { name: "DLC Power Bank 20000mAh", price: 15000, originalPrice: 18000, store: "Konga", category: "Electronics", rating: 4.3, freeDelivery: true, savings: 3000, inStock: true, isMarketplace: false },
      { name: "Native Senator Wear (Men)", price: 25000, originalPrice: 32000, store: "Jiji", category: "Fashion", rating: 4.5, freeDelivery: false, savings: 7000, inStock: true, isMarketplace: false },
      { name: "Gele (Head Wrap) - Premium Aso Oke", price: 8500, originalPrice: 12000, store: "Jumia", category: "Fashion", rating: 4.6, freeDelivery: true, savings: 3500, inStock: true, isMarketplace: false },
      { name: "Agbada & Kufi Set", price: 45000, originalPrice: 55000, store: "Konga", category: "Fashion", rating: 4.8, freeDelivery: true, savings: 10000, inStock: true, isMarketplace: false },
      { name: "Nike Running Shoes", price: 35000, originalPrice: 45000, store: "Jumia", category: "Fashion", rating: 4.7, freeDelivery: true, savings: 10000, inStock: true, isMarketplace: false },
      { name: "Moulinex Blender 1000W", price: 18000, originalPrice: 25000, store: "Konga", category: "Home & Kitchen", rating: 4.5, freeDelivery: true, savings: 7000, inStock: true, isMarketplace: false },
      { name: "Thermos Flask 1.5L", price: 7500, originalPrice: 9500, store: "Jiji", category: "Home & Kitchen", rating: 4.4, freeDelivery: true, savings: 2000, inStock: true, isMarketplace: false },
      { name: "Prestige Pressure Pot 7L", price: 22000, originalPrice: 28000, store: "Jumia", category: "Home & Kitchen", rating: 4.6, freeDelivery: true, savings: 6000, inStock: true, isMarketplace: false },
    ]
    for (const p of products) {
      await ctx.db.insert("products", { ...p, sellerId: undefined, sellerProductId: undefined })
    }
    return { seeded: true, count: products.length }
  },
})
