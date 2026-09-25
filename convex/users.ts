import { query, mutation, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import {
    generateSalt,
    generateSessionToken,
    hashPin,
    verifyPinHash,
    PIN_HASH_VERSION,
    requireSession,
    validatePhone,
    validatePinFormat,
} from "./lib/auth";

const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCK_MS = 5 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function publicUser(user: any) {
    return {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        tag: user.tag,
        kycStatus: user.kycStatus ?? "none",
    };
}

async function issueSession(ctx: MutationCtx, userId: Id<"users">) {
    // Convex mutations run transactionally; token rotation here is atomic.
    const sessionToken = await generateSessionToken();
    await ctx.db.patch(userId, {
        sessionToken,
        sessionCreatedAt: Date.now(),
        pinFailCount: 0,
        pinLockedUntil: undefined,
    });
    return sessionToken;
}

/** Register a NEW account. Fails if the phone already has a credential. */
export const register = mutation({
    args: {
        phone: v.string(),
        name: v.string(),
        pin: v.string(),
    },
    handler: async (ctx, args) => {
        const phone = validatePhone(args.phone);
        const name = args.name.trim();
        if (!name) throw new Error("Name is required");
        validatePinFormat(args.pin);

        const existing = await ctx.db
            .query("users")
            .withIndex("by_phone", (q) => q.eq("phone", phone))
            .first();

        // No claiming: if the phone is taken, the caller must log in.
        // (A previous build allowed anyone who knew a credential-less
        // phone to claim the account — removed as a takeover primitive.)
        if (existing) {
            throw new Error("Account already exists. Log in instead.");
        }

        const salt = await generateSalt();
        const pinHash = await hashPin(args.pin, salt);

        const userId: Id<"users"> = await ctx.db.insert("users", {
            name,
            phone,
            tag: `@${name.toLowerCase().replace(/\s+/g, "")}`,
            pinHash,
            pinSalt: salt,
            pinHashV: PIN_HASH_VERSION,
            kycStatus: "none",
            createdAt: Date.now(),
        });

        await ctx.db.insert("wallets", {
            userId,
            balance: 0,
            currency: "NGN",
            updatedAt: Date.now(),
        });

        const sessionToken = await issueSession(ctx, userId);
        const user = await ctx.db.get(userId);
        return { userId, sessionToken, user: publicUser(user!) };
    },
});

/** Log in with phone + PIN. Rotates the session token. */
export const login = mutation({
    args: { phone: v.string(), pin: v.string() },
    handler: async (ctx, args) => {
        const phone = validatePhone(args.phone);
        const user = await ctx.db
            .query("users")
            .withIndex("by_phone", (q) => q.eq("phone", phone))
            .first();
        // Generic message: do not reveal whether the phone exists.
        if (!user) throw new Error("Invalid phone number or PIN");

        if (user.pinLockedUntil && user.pinLockedUntil > Date.now()) {
            throw new Error("Too many attempts. Try again in a few minutes.");
        }

        let ok = false;
        if (user.pinHash && user.pinSalt) {
            ok = await verifyPinHash(args.pin, user.pinSalt, user.pinHash, user.pinHashV);
            // Transparent upgrade: v1 hashes become v2 on successful login.
            if (ok && user.pinHashV !== PIN_HASH_VERSION) {
                const salt = await generateSalt();
                await ctx.db.patch(user._id, {
                    pinHash: await hashPin(args.pin, salt),
                    pinSalt: salt,
                    pinHashV: PIN_HASH_VERSION,
                    transactionPin: undefined,
                });
            }
        } else if (user.transactionPin) {
            // One-time migration of pre-auth plaintext PINs.
            ok = user.transactionPin === args.pin;
            if (ok) {
                const salt = await generateSalt();
                await ctx.db.patch(user._id, {
                    pinHash: await hashPin(args.pin, salt),
                    pinSalt: salt,
                    pinHashV: PIN_HASH_VERSION,
                    transactionPin: undefined,
                });
            }
        }

        if (!ok) {
            const fails = (user.pinFailCount ?? 0) + 1;
            await ctx.db.patch(user._id, {
                pinFailCount: fails,
                pinLockedUntil: fails >= MAX_PIN_ATTEMPTS ? Date.now() + PIN_LOCK_MS : undefined,
            });
            throw new Error("Invalid phone number or PIN");
        }

        const sessionToken = await issueSession(ctx, user._id);
        const fresh = await ctx.db.get(user._id);
        return { userId: user._id, sessionToken, user: publicUser(fresh!) };
    },
});

/** Log out: invalidate the session token. */
export const logout = mutation({
    args: { userId: v.id("users"), sessionToken: v.string() },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        await ctx.db.patch(args.userId, {
            sessionToken: undefined,
            sessionCreatedAt: undefined,
        });
        return { success: true };
    },
});

/** Validate a session (used by the client on app start and by actions). */
export const validateSession = query({
    args: { userId: v.id("users"), sessionToken: v.string() },
    handler: async (ctx, args) => {
        const user = await requireSession(ctx, args.userId, args.sessionToken);
        return { valid: true, user: publicUser(user) };
    },
});

/** Change the account PIN. Requires the current PIN when one is set. */
export const setPin = mutation({
    args: {
        userId: v.id("users"),
        sessionToken: v.string(),
        newPin: v.string(),
        currentPin: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await requireSession(ctx, args.userId, args.sessionToken);
        validatePinFormat(args.newPin);
        if (user.pinHash) {
            if (!args.currentPin) throw new Error("Current PIN is required");
            if (!(await verifyPinHash(args.currentPin, user.pinSalt!, user.pinHash, user.pinHashV)))
                throw new Error("Current PIN is incorrect");
        }
        const salt = await generateSalt();
        await ctx.db.patch(args.userId, {
            pinHash: await hashPin(args.newPin, salt),
            pinSalt: salt,
            pinHashV: PIN_HASH_VERSION,
            transactionPin: undefined,
            pinFailCount: 0,
            pinLockedUntil: undefined,
        });
        // Rotate the session so a changed PIN invalidates other devices.
        const sessionToken = await issueSession(ctx, args.userId);
        return { success: true, sessionToken };
    },
});

/**
 * Verify the transaction PIN. Session-bound and attempt-limited so it
 * cannot be used as an oracle against arbitrary user IDs.
 */
export const verifyPin = query({
    args: { userId: v.id("users"), sessionToken: v.string(), pin: v.string() },
    handler: async (ctx, args) => {
        // NOTE: queries cannot mutate, so lockout counting lives in
        // verifyPinStrict (mutation) below. This stays read-only.
        const user = await requireSession(ctx, args.userId, args.sessionToken);
        if (user.pinLockedUntil && user.pinLockedUntil > Date.now()) return false;
        if (!user.pinHash || !user.pinSalt) return false;
        return await verifyPinHash(args.pin, user.pinSalt, user.pinHash, user.pinHashV);
    },
});

/** Mutation variant that records failed attempts (use for money flows). */
export const verifyPinStrict = mutation({
    args: { userId: v.id("users"), sessionToken: v.string(), pin: v.string() },
    handler: async (ctx, args) => {
        const user = await requireSession(ctx, args.userId, args.sessionToken);
        if (user.pinLockedUntil && user.pinLockedUntil > Date.now())
            throw new Error("Too many attempts. Try again in a few minutes.");
        if (!user.pinHash || !user.pinSalt) throw new Error("No PIN set on this account");
        const ok = await verifyPinHash(args.pin, user.pinSalt, user.pinHash, user.pinHashV);
        if (!ok) {
            const fails = (user.pinFailCount ?? 0) + 1;
            await ctx.db.patch(args.userId, {
                pinFailCount: fails,
                pinLockedUntil: fails >= MAX_PIN_ATTEMPTS ? Date.now() + PIN_LOCK_MS : undefined,
            });
            throw new Error("Incorrect PIN");
        }
        await ctx.db.patch(args.userId, { pinFailCount: 0, pinLockedUntil: undefined });
        return { valid: true };
    },
});

/** Self profile read: session-gated, self-only. Never exposes hashes or tokens. */
export const getById = query({
    args: { userId: v.id("users"), sessionToken: v.string() },
    handler: async (ctx, args) => {
        const user = await requireSession(ctx, args.userId, args.sessionToken);
        if (user._id !== args.userId) return null;
        return publicUser(user);
    },
});

/**
 * Phone lookup. Session-gated so anonymous callers cannot enumerate
 * which numbers have accounts. Returns existence only — never the record.
 */
export const getByPhone = query({
    args: { phone: v.string(), userId: v.id("users"), sessionToken: v.string() },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        const user = await ctx.db
            .query("users")
            .withIndex("by_phone", (q) => q.eq("phone", validatePhone(args.phone)))
            .first();
        return { exists: !!user };
    },
});

/** Update display name. */
export const updateProfile = mutation({
    args: { userId: v.id("users"), sessionToken: v.string(), name: v.string() },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        const name = args.name.trim();
        if (!name) throw new Error("Name is required");
        await ctx.db.patch(args.userId, {
            name,
            tag: `@${name.toLowerCase().replace(/\s+/g, "")}`,
        });
        return { success: true };
    },
});

/**
 * Record self-attested KYC details. Stores the ID type + last 4 digits
 * ONLY — full BVN/NIN values must never be persisted (no verification
 * provider is wired, so this is explicitly NOT verification).
 */
export const setKyc = mutation({
    args: {
        userId: v.id("users"),
        sessionToken: v.string(),
        idType: v.union(v.literal("bvn"), v.literal("nin")),
        idNumber: v.string(),
    },
    handler: async (ctx, args) => {
        await requireSession(ctx, args.userId, args.sessionToken);
        const digits = args.idNumber.replace(/\D/g, "");
        if (digits.length !== 11) throw new Error("ID number must be 11 digits");
        await ctx.db.patch(args.userId, {
            kycStatus: "self_attested",
            kycIdType: args.idType,
            kycLast4: digits.slice(-4),
        });
        return { success: true, status: "self_attested" as const };
    },
});

/**
 * DEPRECATED: pre-auth account creation without a credential.
 * Kept (guarded) so old clients fail loudly instead of silently
 * creating unprotected accounts. Do not use in new code.
 */
export const getOrCreate = mutation({
    args: { phone: v.string(), name: v.string() },
    handler: async () => {
        throw new Error("Deprecated: use users:register or users:login");
    },
});
