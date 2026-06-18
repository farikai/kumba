import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get wallet balance for a user
export const getBalance = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();
        return wallet ? wallet.balance : 0;
    },
});

// Get recent transactions for a user
export const getTransactions = query({
    args: { userId: v.id("users"), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 10;
        const transactions = await ctx.db
            .query("transactions")
            .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(limit);
        return transactions;
    },
});

// Get the full wallet object
export const getWallet = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("wallets")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();
    },
});

// Send money (debit sender, create transaction)
export const sendMoney = mutation({
    args: {
        userId: v.id("users"),
        amount: v.number(),
        recipientName: v.string(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        // Get wallet
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (!wallet) throw new Error("Wallet not found");
        if (wallet.balance < args.amount) throw new Error("Insufficient balance");

        // Deduct balance
        await ctx.db.patch(wallet._id, {
            balance: wallet.balance - args.amount,
            updatedAt: Date.now(),
        });

        // Create transaction record
        await ctx.db.insert("transactions", {
            userId: args.userId,
            type: "debit",
            amount: args.amount,
            currency: wallet.currency,
            description: args.description,
            status: "completed",
            recipientName: args.recipientName,
            reference: `TXN-${Date.now()}`,
            createdAt: Date.now(),
        });

        return { success: true, newBalance: wallet.balance - args.amount };
    },
});

// Fund wallet (credit)
export const fundWallet = mutation({
    args: {
        userId: v.id("users"),
        amount: v.number(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();

        if (!wallet) throw new Error("Wallet not found");

        await ctx.db.patch(wallet._id, {
            balance: wallet.balance + args.amount,
            updatedAt: Date.now(),
        });

        await ctx.db.insert("transactions", {
            userId: args.userId,
            type: "credit",
            amount: args.amount,
            currency: wallet.currency,
            description: args.description ?? "Wallet funded",
            status: "completed",
            reference: `FND-${Date.now()}`,
            createdAt: Date.now(),
        });

        return { success: true, newBalance: wallet.balance + args.amount };
    },
});
