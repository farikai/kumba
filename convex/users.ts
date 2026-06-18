import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create a user by phone number
export const getOrCreate = mutation({
    args: {
        phone: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_phone", (q) => q.eq("phone", args.phone))
            .first();

        if (existing) return existing._id;

        // Create new user
        const userId = await ctx.db.insert("users", {
            name: args.name,
            phone: args.phone,
            tag: `@${args.name.toLowerCase().replace(/\s+/g, "")}`,
            createdAt: Date.now(),
        });

        // Create a default wallet
        await ctx.db.insert("wallets", {
            userId,
            balance: 0,
            currency: "NGN",
            updatedAt: Date.now(),
        });

        return userId;
    },
});

// Get user by ID
export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

// Get user by phone
export const getByPhone = query({
    args: { phone: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_phone", (q) => q.eq("phone", args.phone))
            .first();
    },
});

// Set transaction PIN
export const setPin = mutation({
    args: { userId: v.id("users"), pin: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { transactionPin: args.pin })
    },
});

// Verify transaction PIN (return true/false)
export const verifyPin = query({
    args: { userId: v.id("users"), pin: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId)
        return user?.transactionPin === args.pin
    },
});
