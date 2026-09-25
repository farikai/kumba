"use node"
import { v } from "convex/values"
import { action } from "../_generated/server"
import { api } from "../_generated/api"
import { ninePsb, transferSchema, airtimeSchema, accountLookupSchema } from "../lib/9psb"

const sessionArgs = { userId: v.id("users"), sessionToken: v.string() };

async function requireActionSession(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userId: any,
  sessionToken: string,
) {
  // Actions cannot read the DB directly; validate through the query.
  await ctx.runQuery(api.users.validateSession, { userId, sessionToken });
}

/**
 * Debit the wallet AFTER a provider call succeeded. If the debit throws
 * (e.g. a concurrent spend won the balance race), we must NOT throw the
 * provider reference away: return a reconciliation-safe failure that
 * preserves it, so support can match provider vs ledger. Callers must
 * return this object instead of reporting success.
 *
 * LIVE-MODE NOTE: this ordering (provider-then-debit) still needs a real
 * hold → provider → commit saga with a pending ledger state before real
 * money moves. This guard only makes the failure visible and reconcilable.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function debitAfterProvider(ctx: any, debitArgs: any, providerRef: string) {
  try {
    await ctx.runMutation(api.wallet.sendMoney, debitArgs);
    return null;
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unknown error";
    return {
      success: false as const,
      error: {
        code: "DEBIT_FAILED_AFTER_PROVIDER",
        message: `Provider succeeded but the wallet debit failed (${reason}). Reference ${providerRef} — do NOT retry blindly; contact support for reconciliation.`,
      },
      providerReference: providerRef,
      needsReconciliation: true,
    };
  }
}

// ─── Account Lookup ──────────────────────────────────────────────
// Session-gated: anonymous callers must not be able to proxy (paid, in
// live mode) name-enquiry requests or enumerate account names.
export const lookupAccount = action({
  args: {
    ...sessionArgs,
    accountNumber: v.string(),
    bankCode: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActionSession(ctx, args.userId, args.sessionToken)
    const parsed = accountLookupSchema.safeParse(args)
    if (!parsed.success) {
      return { success: false, error: { code: "INVALID_ACCOUNT", message: "Account number must be 10 digits" } }
    }
    const result = await ninePsb.lookupAccount(args.accountNumber, args.bankCode)
    return result
  },
})

// ─── Transfer Money ──────────────────────────────────────────────
export const sendMoney = action({
  args: {
    ...sessionArgs,
    amount: v.number(),
    accountNumber: v.string(),
    bankCode: v.string(),
    accountName: v.string(),
    narration: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActionSession(ctx, args.userId, args.sessionToken)
    const parsed = transferSchema.safeParse({
      amount: args.amount,
      accountNumber: args.accountNumber,
      bankCode: args.bankCode,
      accountName: args.accountName,
      narration: args.narration ?? "",
    })
    if (!parsed.success) {
      return { success: false, error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid transfer details" } }
    }
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId, sessionToken: args.sessionToken })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const ref = args.idempotencyKey ?? `KPY${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const transferResult = await ninePsb.transfer({
      amount: args.amount,
      currency: "NGN",
      accountNumber: args.accountNumber,
      bankCode: args.bankCode,
      accountName: args.accountName,
      narration: args.narration ?? `Transfer to ${args.recipientName ?? args.accountName}`,
      reference: ref,
    })

    if (!transferResult.success) {
      return transferResult
    }

    const debitError = await debitAfterProvider(ctx, {
      userId: args.userId,
      sessionToken: args.sessionToken,
      amount: args.amount,
      recipientName: args.recipientName ?? args.accountName,
      description: args.narration ?? `Transfer to ${args.recipientName ?? args.accountName}`,
      category: "Transfers",
      idempotencyKey: args.idempotencyKey,
    }, ref)
    if (debitError) return { ...debitError, data: transferResult.data, reference: ref }

    return {
      success: true,
      data: transferResult.data,
      reference: ref,
    }
  },
})

// ─── Buy Airtime ─────────────────────────────────────────────────
export const buyAirtime = action({
  args: {
    ...sessionArgs,
    network: v.union(v.literal("mtn"), v.literal("airtel"), v.literal("glo"), v.literal("9mobile")),
    phoneNumber: v.string(),
    amount: v.number(),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActionSession(ctx, args.userId, args.sessionToken)
    const parsed = airtimeSchema.safeParse({ network: args.network, phoneNumber: args.phoneNumber, amount: args.amount })
    if (!parsed.success) {
      return { success: false, error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid airtime details" } }
    }
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId, sessionToken: args.sessionToken })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const result = await ninePsb.buyAirtime({
      network: args.network,
      phoneNumber: args.phoneNumber,
      amount: args.amount,
      reference: args.idempotencyKey ?? `KPY-ATM-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    })

    if (result.success) {
      const debitError = await debitAfterProvider(ctx, {
        userId: args.userId,
        sessionToken: args.sessionToken,
        amount: args.amount,
        recipientName: `${args.network.toUpperCase()} Airtime`,
        description: `Airtime purchase - ${args.phoneNumber}`,
        category: "Airtime",
        idempotencyKey: args.idempotencyKey,
      }, String((result as { reference?: unknown }).reference ?? args.idempotencyKey ?? "unknown"))
      if (debitError) return { ...debitError, data: result.data }
    }

    return result
  },
})

// ─── Buy Data ────────────────────────────────────────────────────
export const buyData = action({
  args: {
    ...sessionArgs,
    network: v.union(v.literal("mtn"), v.literal("airtel"), v.literal("glo"), v.literal("9mobile")),
    phoneNumber: v.string(),
    planId: v.string(),
    amount: v.number(),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActionSession(ctx, args.userId, args.sessionToken)
    if (!Number.isFinite(args.amount) || args.amount <= 0) {
      return { success: false, error: { code: "INVALID_AMOUNT", message: "Amount must be greater than zero" } }
    }
    if (!args.planId.trim()) {
      return { success: false, error: { code: "INVALID_PLAN", message: "Data plan is required" } }
    }
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId, sessionToken: args.sessionToken })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const result = await ninePsb.buyData({
      network: args.network,
      phoneNumber: args.phoneNumber,
      planId: args.planId,
      reference: args.idempotencyKey ?? `KPY-DAT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    })

    if (result.success) {
      const debitError = await debitAfterProvider(ctx, {
        userId: args.userId,
        sessionToken: args.sessionToken,
        amount: args.amount,
        recipientName: `${args.network.toUpperCase()} Data`,
        description: `Data bundle - ${args.phoneNumber}`,
        category: "Data & Internet",
        idempotencyKey: args.idempotencyKey,
      }, String((result as { reference?: unknown }).reference ?? args.idempotencyKey ?? "unknown"))
      if (debitError) return { ...debitError, data: result.data }
    }

    return result
  },
})

// ─── Electricity Payment ─────────────────────────────────────────
export const payElectricity = action({
  args: {
    ...sessionArgs,
    providerCode: v.string(),
    meterNumber: v.string(),
    amount: v.number(),
    meterType: v.union(v.literal("prepaid"), v.literal("postpaid")),
    phoneNumber: v.string(),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActionSession(ctx, args.userId, args.sessionToken)
    if (!Number.isFinite(args.amount) || args.amount <= 0) {
      return { success: false, error: { code: "INVALID_AMOUNT", message: "Amount must be greater than zero" } }
    }
    if (!args.providerCode.trim() || args.meterNumber.trim().length < 6) {
      return { success: false, error: { code: "INVALID_INPUT", message: "Invalid meter details" } }
    }
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId, sessionToken: args.sessionToken })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const result = await ninePsb.payElectricity({
      providerCode: args.providerCode,
      meterNumber: args.meterNumber,
      amount: args.amount,
      meterType: args.meterType,
      phoneNumber: args.phoneNumber,
      reference: args.idempotencyKey ?? `KPY-ELE-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    })

    if (result.success) {
      const debitError = await debitAfterProvider(ctx, {
        userId: args.userId,
        sessionToken: args.sessionToken,
        amount: args.amount,
        recipientName: `Electricity - ${args.providerCode.toUpperCase()}`,
        description: `Electricity bill - meter ${args.meterNumber}`,
        category: "Electricity",
        idempotencyKey: args.idempotencyKey,
      }, String((result as { reference?: unknown }).reference ?? args.idempotencyKey ?? "unknown"))
      if (debitError) return { ...debitError, data: result.data }
    }

    return result
  },
})

// ─── TV Subscription ─────────────────────────────────────────────
export const payTv = action({
  args: {
    ...sessionArgs,
    providerCode: v.string(),
    smartCardNumber: v.string(),
    packageId: v.string(),
    phoneNumber: v.string(),
    amount: v.number(),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActionSession(ctx, args.userId, args.sessionToken)
    if (!Number.isFinite(args.amount) || args.amount <= 0) {
      return { success: false, error: { code: "INVALID_AMOUNT", message: "Amount must be greater than zero" } }
    }
    if (!args.smartCardNumber.trim() || !args.packageId.trim()) {
      return { success: false, error: { code: "INVALID_INPUT", message: "Smart-card number and package are required" } }
    }
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId, sessionToken: args.sessionToken })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const result = await ninePsb.payTv({
      providerCode: args.providerCode,
      smartCardNumber: args.smartCardNumber,
      packageId: args.packageId,
      phoneNumber: args.phoneNumber,
      reference: args.idempotencyKey ?? `KPY-TV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    })

    if (result.success) {
      const debitError = await debitAfterProvider(ctx, {
        userId: args.userId,
        sessionToken: args.sessionToken,
        amount: args.amount,
        recipientName: `TV - ${args.providerCode.toUpperCase()}`,
        description: `TV subscription - ${args.smartCardNumber}`,
        category: "TV & Entertainment",
        idempotencyKey: args.idempotencyKey,
      }, String((result as { reference?: unknown }).reference ?? args.idempotencyKey ?? "unknown"))
      if (debitError) return { ...debitError, data: result.data }
    }

    return result
  },
})
