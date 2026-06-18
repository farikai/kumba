import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        phone: v.string(),
        tag: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        transactionPin: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_phone", ["phone"]),

    wallets: defineTable({
        userId: v.id("users"),
        balance: v.number(),
        currency: v.string(),
        updatedAt: v.number(),
    }).index("by_userId", ["userId"]),

    transactions: defineTable({
        userId: v.id("users"),
        type: v.union(
            v.literal("credit"),
            v.literal("debit"),
            v.literal("transfer")
        ),
        amount: v.number(),
        currency: v.string(),
        description: v.string(),
        status: v.union(
            v.literal("completed"),
            v.literal("pending"),
            v.literal("failed")
        ),
        recipientName: v.optional(v.string()),
        reference: v.optional(v.string()),
        category: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_createdAt", ["userId", "createdAt"]),

    beneficiaries: defineTable({
        userId: v.id("users"),
        name: v.string(),
        bankName: v.string(),
        accountNumber: v.string(),
        tag: v.optional(v.string()),
        isFavorite: v.boolean(),
        createdAt: v.number(),
    }).index("by_userId", ["userId"]),

    scheduledPayments: defineTable({
        userId: v.id("users"),
        recipientName: v.string(),
        amount: v.number(),
        currency: v.string(),
        frequency: v.union(
            v.literal("once"),
            v.literal("daily"),
            v.literal("weekly"),
            v.literal("monthly")
        ),
        nextPaymentDate: v.number(),
        isActive: v.boolean(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_userId", ["userId"]),

    budgets: defineTable({
        userId: v.id("users"),
        category: v.string(),
        amount: v.number(),
        period: v.union(v.literal("weekly"), v.literal("monthly")),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_category", ["userId", "category"]),

    products: defineTable({
        name: v.string(),
        price: v.number(),
        originalPrice: v.optional(v.number()),
        store: v.string(),
        category: v.string(),
        rating: v.optional(v.number()),
        freeDelivery: v.boolean(),
        imageUrl: v.optional(v.string()),
        savings: v.optional(v.number()),
        inStock: v.boolean(),
        sellerId: v.optional(v.id("sellers")),
        sellerProductId: v.optional(v.id("sellerProducts")),
        isMarketplace: v.optional(v.boolean()),
    }).index("by_category", ["category"])
      .index("by_sellerId", ["sellerId"]),

    orders: defineTable({
        userId: v.id("users"),
        productName: v.string(),
        productPrice: v.number(),
        store: v.string(),
        category: v.string(),
        status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
        reference: v.string(),
        deliveryAddress: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_createdAt", ["userId", "createdAt"]),

    sellers: defineTable({
        userId: v.id("users"),
        storeName: v.string(),
        description: v.optional(v.string()),
        phone: v.string(),
        email: v.optional(v.string()),
        address: v.string(),
        bankAccount: v.optional(v.string()),
        bankName: v.optional(v.string()),
        accountName: v.optional(v.string()),
        status: v.union(v.literal("pending"), v.literal("active"), v.literal("suspended"), v.literal("rejected")),
        kycVerified: v.boolean(),
        commissionRate: v.number(), // percentage (e.g., 5 = 5%)
        rating: v.optional(v.number()),
        totalSales: v.number(),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_status", ["status"]),

    sellerProducts: defineTable({
        sellerId: v.id("sellers"),
        userId: v.id("users"), // seller's userId for easy queries
        name: v.string(),
        description: v.string(),
        price: v.number(),
        originalPrice: v.optional(v.number()),
        category: v.string(),
        images: v.array(v.string()),
        stock: v.number(),
        status: v.union(v.literal("draft"), v.literal("pending_review"), v.literal("active"), v.literal("out_of_stock"), v.literal("rejected")),
        commissionRate: v.number(), // override default
        tags: v.array(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_sellerId", ["sellerId"])
        .index("by_userId", ["userId"])
        .index("by_status", ["status"])
        .index("by_category", ["category"]),

    sellerPayouts: defineTable({
        sellerId: v.id("sellers"),
        userId: v.id("users"),
        amount: v.number(),
        status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
        reference: v.string(),
        periodStart: v.number(),
        periodEnd: v.number(),
        createdAt: v.number(),
        processedAt: v.optional(v.number()),
    })
        .index("by_sellerId", ["sellerId"])
        .index("by_userId", ["userId"])
        .index("by_status", ["status"]),

    ragChunks: defineTable({
        userId: v.id("users"),
        content: v.string(),
        embedding: v.array(v.number()),
        source: v.string(),
        chunkType: v.string(),
        createdAt: v.number(),
    })
        .vectorIndex("by_embedding", {
            vectorField: "embedding",
            dimensions: 1536,
            filterFields: ["userId"],
        })
        .index("by_userId", ["userId"])
        .index("by_userId_chunkType", ["userId", "chunkType"]),
});
