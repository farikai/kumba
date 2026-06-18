"use node"
import { v } from "convex/values"
import { action } from "../_generated/server"
import { api } from "../_generated/api"
import { ninePsb } from "../lib/9psb"

// ─── Account Lookup ──────────────────────────────────────────────
export const lookupAccount = action({
  args: {
    accountNumber: v.string(),
    bankCode: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ninePsb.lookupAccount(args.accountNumber, args.bankCode)
    return result
  },
})

// ─── Transfer Money ──────────────────────────────────────────────
export const sendMoney = action({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    accountNumber: v.string(),
    bankCode: v.string(),
    accountName: v.string(),
    narration: v.optional(v.string()),
    recipientName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const ref = `KPY${Date.now()}`

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

    await ctx.runMutation(api.wallet.sendMoney, {
      userId: args.userId,
      amount: args.amount,
      recipientName: args.recipientName ?? args.accountName,
      description: args.narration ?? `Transfer to ${args.recipientName ?? args.accountName}`,
    })

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
    userId: v.id("users"),
    network: v.union(v.literal("mtn"), v.literal("airtel"), v.literal("glo"), v.literal("9mobile")),
    phoneNumber: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const result = await ninePsb.buyAirtime({
      network: args.network,
      phoneNumber: args.phoneNumber,
      amount: args.amount,
      reference: `KPY-ATM-${Date.now()}`,
    })

    if (result.success) {
      await ctx.runMutation(api.wallet.sendMoney, {
        userId: args.userId,
        amount: args.amount,
        recipientName: `${args.network.toUpperCase()} Airtime`,
        description: `Airtime purchase - ${args.phoneNumber}`,
      })
    }

    return result
  },
})

// ─── Buy Data ────────────────────────────────────────────────────
export const buyData = action({
  args: {
    userId: v.id("users"),
    network: v.union(v.literal("mtn"), v.literal("airtel"), v.literal("glo"), v.literal("9mobile")),
    phoneNumber: v.string(),
    planId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const result = await ninePsb.buyData({
      network: args.network,
      phoneNumber: args.phoneNumber,
      planId: args.planId,
      reference: `KPY-DAT-${Date.now()}`,
    })

    if (result.success) {
      await ctx.runMutation(api.wallet.sendMoney, {
        userId: args.userId,
        amount: args.amount,
        recipientName: `${args.network.toUpperCase()} Data`,
        description: `Data bundle - ${args.phoneNumber}`,
      })
    }

    return result
  },
})

// ─── Electricity Payment ─────────────────────────────────────────
export const payElectricity = action({
  args: {
    userId: v.id("users"),
    providerCode: v.string(),
    meterNumber: v.string(),
    amount: v.number(),
    meterType: v.union(v.literal("prepaid"), v.literal("postpaid")),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const result = await ninePsb.payElectricity({
      providerCode: args.providerCode,
      meterNumber: args.meterNumber,
      amount: args.amount,
      meterType: args.meterType,
      phoneNumber: args.phoneNumber,
      reference: `KPY-ELE-${Date.now()}`,
    })

    if (result.success) {
      await ctx.runMutation(api.wallet.sendMoney, {
        userId: args.userId,
        amount: args.amount,
        recipientName: `Electricity - ${args.providerCode.toUpperCase()}`,
        description: `Electricity bill - meter ${args.meterNumber}`,
      })
    }

    return result
  },
})

// ─── TV Subscription ─────────────────────────────────────────────
export const payTv = action({
  args: {
    userId: v.id("users"),
    providerCode: v.string(),
    smartCardNumber: v.string(),
    packageId: v.string(),
    phoneNumber: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.runQuery(api.wallet.getBalance, { userId: args.userId })
    if (wallet < args.amount) {
      return { success: false, error: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance" } }
    }

    const result = await ninePsb.payTv({
      providerCode: args.providerCode,
      smartCardNumber: args.smartCardNumber,
      packageId: args.packageId,
      phoneNumber: args.phoneNumber,
      reference: `KPY-TV-${Date.now()}`,
    })

    if (result.success) {
      await ctx.runMutation(api.wallet.sendMoney, {
        userId: args.userId,
        amount: args.amount,
        recipientName: `TV - ${args.providerCode.toUpperCase()}`,
        description: `TV subscription - ${args.smartCardNumber}`,
      })
    }

    return result
  },
})
