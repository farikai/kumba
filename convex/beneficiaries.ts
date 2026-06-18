import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all beneficiaries for a user
export const getAll = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
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
        name: v.string(),
        bankName: v.string(),
        accountNumber: v.string(),
        tag: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("beneficiaries", {
            userId: args.userId,
            name: args.name,
            bankName: args.bankName,
            accountNumber: args.accountNumber,
            tag: args.tag,
            isFavorite: false,
            createdAt: Date.now(),
        });
    },
});

// Toggle favorite
export const toggleFavorite = mutation({
    args: { beneficiaryId: v.id("beneficiaries") },
    handler: async (ctx, args) => {
        const beneficiary = await ctx.db.get(args.beneficiaryId);
        if (!beneficiary) throw new Error("Beneficiary not found");
        await ctx.db.patch(args.beneficiaryId, {
            isFavorite: !beneficiary.isFavorite,
        });
    },
});

// Delete a beneficiary
export const remove = mutation({
    args: { beneficiaryId: v.id("beneficiaries") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.beneficiaryId);
    },
});
