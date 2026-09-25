import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOwner, requireSession } from "./lib/auth";

const sessionArgs = { userId: v.id("users"), sessionToken: v.string() };

// Get all beneficiaries for a user
export const getAll = query({
    args: sessionArgs,
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        return await ctx.db
            .query("beneficiaries")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

// Add a new beneficiary
export const add = mutation({
    args: {
        userId: v.id("users"),
        sessionToken: v.string(),
        name: v.string(),
        bankName: v.string(),
        accountNumber: v.string(),
        tag: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        const name = args.name.trim();
        if (!name) throw new Error("Beneficiary name is required");
        if (!args.bankName.trim()) throw new Error("Bank name is required");
        if (!/^\d{10}$/.test(args.accountNumber))
            throw new Error("Account number must be 10 digits");
        return await ctx.db.insert("beneficiaries", {
            userId: args.userId,
            name,
            bankName: args.bankName.trim(),
            accountNumber: args.accountNumber,
            tag: args.tag,
            isFavorite: false,
            createdAt: Date.now(),
        });
    },
});

// Update a beneficiary (ownership-checked)
export const update = mutation({
    args: {
        userId: v.id("users"),
        sessionToken: v.string(),
        beneficiaryId: v.id("beneficiaries"),
        name: v.optional(v.string()),
        bankName: v.optional(v.string()),
        accountNumber: v.optional(v.string()),
        tag: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        const beneficiary = await ctx.db.get(args.beneficiaryId);
        requireOwner(beneficiary, args.userId, "beneficiary");
        const updates: { name?: string; bankName?: string; accountNumber?: string; tag?: string } = {};
        if (args.name !== undefined) {
            if (!args.name.trim()) throw new Error("Beneficiary name is required");
            updates.name = args.name.trim();
        }
        if (args.bankName !== undefined) {
            if (!args.bankName.trim()) throw new Error("Bank name is required");
            updates.bankName = args.bankName.trim();
        }
        if (args.accountNumber !== undefined) {
            if (!/^\d{10}$/.test(args.accountNumber))
                throw new Error("Account number must be 10 digits");
            updates.accountNumber = args.accountNumber;
        }
        if (args.tag !== undefined) updates.tag = args.tag;
        await ctx.db.patch(args.beneficiaryId, updates);
        return { success: true };
    },
});

// Toggle favorite (ownership-checked)
export const toggleFavorite = mutation({
    args: {
        userId: v.id("users"),
        sessionToken: v.string(),
        beneficiaryId: v.id("beneficiaries"),
    },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        const beneficiary = await ctx.db.get(args.beneficiaryId);
        requireOwner(beneficiary, args.userId, "beneficiary");
        await ctx.db.patch(args.beneficiaryId, {
            isFavorite: !beneficiary!.isFavorite,
        });
    },
});

// Delete a beneficiary (ownership-checked)
export const remove = mutation({
    args: {
        userId: v.id("users"),
        sessionToken: v.string(),
        beneficiaryId: v.id("beneficiaries"),
    },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        const beneficiary = await ctx.db.get(args.beneficiaryId);
        requireOwner(beneficiary, args.userId, "beneficiary");
        await ctx.db.delete(args.beneficiaryId);
    },
});
