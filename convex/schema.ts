import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        phone: v.string(),
        tag: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        // DEPRECATED (pre-auth build): plaintext PIN. Never written anymore;
        // login() migrates it to pinHash on first successful use, then clears it.
        transactionPin: v.optional(v.string()),
        // Salted + stretched PIN credential (see convex/lib/auth.ts).
        // pinHashV tracks the KDF version: 1 = legacy single-round
        // SHA-256, 2 = iterated (current). Absent means v1.
        pinHash: v.optional(v.string()),
        pinSalt: v.optional(v.string()),
        pinHashV: v.optional(v.number()),
        // Bearer session token issued at register/login. Every user-scoped
        // function must verify it via requireSession().
        sessionToken: v.optional(v.string()),
        sessionCreatedAt: v.optional(v.number()),
        // Brute-force guard for PIN verification.
        pinFailCount: v.optional(v.number()),
        pinLockedUntil: v.optional(v.number()),
        // Self-attested KYC only (no verification provider wired). Never
        // store full BVN/NIN values — last4 at most.
        kycStatus: v.optional(v.union(v.literal("none"), v.literal("self_attested"))),
        kycIdType: v.optional(v.union(v.literal("bvn"), v.literal("nin"))),
        kycLast4: v.optional(v.string()),
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
        // Client-supplied idempotency key. Mutations that create money
        // movements must check (userId, idempotencyKey) before inserting
        // so retries and double-submits cannot double-spend.
        idempotencyKey: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_createdAt", ["userId", "createdAt"])
        .index("by_userId_idempotencyKey", ["userId", "idempotencyKey"]),

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
        // Client-generated idempotency key: retries with the same key
        // return the existing schedule instead of creating a duplicate.
        idempotencyKey: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_userId", ["userId"])
      .index("by_active_nextDate", ["isActive", "nextPaymentDate"])
      .index("by_userId_idempotencyKey", ["userId", "idempotencyKey"]),

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
        // Marketplace linkage (absent for seeded-catalog orders). sellerId
        // is ALWAYS derived server-side from the sellerProduct — never
        // trusted from the client — so sellers only see their own orders.
        sellerId: v.optional(v.id("sellers")),
        sellerProductId: v.optional(v.id("sellerProducts")),
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_store", ["store"])
        .index("by_sellerId", ["sellerId"])
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
        // Publishing attribution (building stage: sellers self-publish;
        // no admin review queue exists yet — these fields make every
        // publish attributable for future moderation).
        approvedBy: v.optional(v.id("users")),
        approvedAt: v.optional(v.number()),
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
        orderId: v.optional(v.id("orders")),
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
