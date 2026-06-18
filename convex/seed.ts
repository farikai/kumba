import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed demo data for development
export const seedDemoData = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if demo user already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_phone", (q) => q.eq("phone", "+2348012345678"))
            .first();

        if (existing) return { userId: existing._id, message: "Demo data already exists" };

        // Create demo user
        const userId = await ctx.db.insert("users", {
            name: "Adewale Johnson",
            phone: "+2348012345678",
            tag: "@adewalejohnson",
            createdAt: Date.now(),
        });

        // Create wallet with starter balance
        await ctx.db.insert("wallets", {
            userId,
            balance: 842300.5,
            currency: "NGN",
            updatedAt: Date.now(),
        });

        // Seed some transactions
        const txns = [
            { type: "debit" as const, amount: 5000, description: "Transfer to Joy", recipientName: "Joy Okafor", status: "completed" as const, hoursAgo: 2 },
            { type: "credit" as const, amount: 150000, description: "Salary Credit", status: "completed" as const, hoursAgo: 24 },
            { type: "debit" as const, amount: 2500, description: "Airtime - MTN", status: "completed" as const, hoursAgo: 48 },
            { type: "debit" as const, amount: 15000, description: "Electricity Bill", status: "completed" as const, hoursAgo: 72 },
            { type: "credit" as const, amount: 25000, description: "Refund from Jumia", status: "completed" as const, hoursAgo: 96 },
            { type: "debit" as const, amount: 8500, description: "Data - Airtel 10GB", status: "completed" as const, hoursAgo: 120 },
        ];

        for (const txn of txns) {
            await ctx.db.insert("transactions", {
                userId,
                type: txn.type,
                amount: txn.amount,
                currency: "NGN",
                description: txn.description,
                status: txn.status,
                recipientName: txn.recipientName,
                reference: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                createdAt: Date.now() - txn.hoursAgo * 3600000,
            });
        }

        // Seed beneficiaries
        const beneficiaries = [
            { name: "Joy Okafor", bankName: "GTBank", accountNumber: "0123456789", isFavorite: true },
            { name: "Mom", bankName: "First Bank", accountNumber: "3045678901", isFavorite: true },
            { name: "Chidi Emmanuel", bankName: "Access Bank", accountNumber: "0987654321", isFavorite: false },
            { name: "Landlord", bankName: "UBA", accountNumber: "2109876543", isFavorite: false },
        ];

        for (const b of beneficiaries) {
            await ctx.db.insert("beneficiaries", {
                userId,
                name: b.name,
                bankName: b.bankName,
                accountNumber: b.accountNumber,
                isFavorite: b.isFavorite,
                createdAt: Date.now(),
            });
        }

        // Seed a scheduled payment
        await ctx.db.insert("scheduledPayments", {
            userId,
            recipientName: "Landlord",
            amount: 150000,
            currency: "NGN",
            frequency: "monthly",
            nextPaymentDate: Date.now() + 5 * 86400000, // 5 days from now
            isActive: true,
            description: "Monthly Rent",
            createdAt: Date.now(),
        });

        return { userId, message: "Demo data seeded successfully!" };
    },
});
