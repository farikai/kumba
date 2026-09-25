import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireSession } from "./lib/auth";

const sessionArgs = { userId: v.id("users"), sessionToken: v.string() };

function makeReference(prefix: string, key?: string) {
    return key ?? `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Get wallet balance for a user
export const getBalance = query({
    args: sessionArgs,
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();
        return wallet ? wallet.balance : 0;
    },
});

// Get recent transactions for a user
export const getTransactions = query({
    args: { userId: v.id("users"), sessionToken: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
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
    args: sessionArgs,
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        return await ctx.db
            .query("wallets")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .first();
    },
});

// Send money (debit sender, create transaction).
// Convex mutations execute transactionally, so the balance check +
// patch + insert below are atomic — concurrent mutations serialize.
// idempotencyKey additionally neutralizes client retries/double-taps.
export const sendMoney = mutation({
    args: {
        userId: v.id("users"),
        sessionToken: v.string(),
        amount: v.number(),
        recipientName: v.string(),
        description: v.string(),
        category: v.optional(v.string()),
        idempotencyKey: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        if (!Number.isFinite(args.amount) || args.amount <= 0)
            throw new Error("Amount must be greater than zero");

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
                return { success: true, newBalance: wallet?.balance ?? 0, duplicate: true };
            }
        }

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
            category: args.category ?? "Transfers",
            reference: makeReference("TXN", args.idempotencyKey),
            idempotencyKey: args.idempotencyKey,
            createdAt: Date.now(),
        });

        return { success: true, newBalance: wallet.balance - args.amount };
    },
});

// Fund wallet (credit). BUILDING-STAGE DEMO ONLY: there is no real
// money movement behind this — no virtual-account webhook, no bank
// rail. Every credit is explicitly labeled as a demo top-up so a
// future real funding rail cannot be confused with it.
//
// SAFETY RAILS (do not remove before a real rail exists):
// - Kill-switch: set DEMO_TOPUP_ENABLED=false to disable entirely.
// - Per-transaction cap: single demo credits above MAX_DEMO_TOPUP are
//   rejected server-side, so a leaked session cannot mint unbounded funds.
// MUST be deleted (not just disabled) before any production rail goes live.
const MAX_DEMO_TOPUP = 200_000;
export const fundWallet = mutation({
    args: {
        userId: v.id("users"),
        sessionToken: v.string(),
        amount: v.number(),
        description: v.optional(v.string()),
        idempotencyKey: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        if (process.env.DEMO_TOPUP_ENABLED === "false")
            throw new Error("Demo top-ups are disabled");
        if (!Number.isFinite(args.amount) || args.amount <= 0)
            throw new Error("Amount must be greater than zero");
        if (args.amount > MAX_DEMO_TOPUP)
            throw new Error(`Demo top-up limit is ₦${MAX_DEMO_TOPUP.toLocaleString()} per transaction`);

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
                return { success: true, newBalance: wallet?.balance ?? 0, duplicate: true };
            }
        }

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
            description: args.description ?? "Demo wallet top-up (no real money)",
            status: "completed",
            category: "Income",
            reference: makeReference("FND", args.idempotencyKey),
            idempotencyKey: args.idempotencyKey,
            createdAt: Date.now(),
        });

        return { success: true, newBalance: wallet.balance + args.amount };
    },
});
