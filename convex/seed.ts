import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { generateSalt, hashPin, requireSession, PIN_HASH_VERSION } from "./lib/auth";

// Seed demo data for development.
// DEV ONLY: creates a shared account with a known PIN. Requires an
// authenticated session so anonymous callers cannot mint it in
// deployed environments, and never run this against production data.
export const seedDemoData = mutation({
    args: { userId: v.id("users"), sessionToken: v.string() },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        // Check if demo user already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_phone", (q) => q.eq("phone", "+2348012345678"))
            .first();

        if (existing) return { userId: existing._id, message: "Demo data already exists" };

        // Create demo user (dev PIN "0000", stored as salted hash)
        const salt = await generateSalt();
        const userId = await ctx.db.insert("users", {
            name: "Adewale Johnson",
            phone: "+2348012345678",
            tag: "@adewalejohnson",
            pinHash: await hashPin("0000", salt),
            pinSalt: salt,
            pinHashV: PIN_HASH_VERSION,
            kycStatus: "none",
            createdAt: Date.now(),
        });

        // Create wallet with starter balance (whole naira — balances are
        // stored as numbers; keep kobo out of seeds to avoid float dust)
        await ctx.db.insert("wallets", {
            userId,
            balance: 842300,
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
