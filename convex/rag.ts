import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { requireSession } from "./lib/auth"

export const store = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    chunks: v.array(
      v.object({
        content: v.string(),
        embedding: v.array(v.number()),
        source: v.string(),
        chunkType: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    if (args.chunks.length === 0) return { stored: 0 }
    if (args.chunks.length > 50) throw new Error("Too many chunks per batch (max 50)");
    const now = Date.now()
    for (const chunk of args.chunks) {
      if (chunk.embedding.length !== 1536)
        throw new Error(`Invalid embedding dimension: expected 1536, got ${chunk.embedding.length}`);
      if (!chunk.content.trim()) continue
      await ctx.db.insert("ragChunks", {
        userId: args.userId,
        content: chunk.content.slice(0, 2000),
        embedding: chunk.embedding,
        source: chunk.source,
        chunkType: chunk.chunkType,
        createdAt: now,
      })
    }
    return { stored: args.chunks.length }
  },
})

export const clearUserChunks = mutation({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const existing = await ctx.db
      .query("ragChunks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()
    for (const chunk of existing) {
      await ctx.db.delete(chunk._id)
    }
  },
})

export const getAllChunks = query({
  args: { userId: v.id("users"), sessionToken: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const chunks = await ctx.db
      .query("ragChunks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(Math.min(args.limit ?? 100, 200))
    return chunks.map((r) => ({
      content: r.content,
      embedding: r.embedding,
      source: r.source,
      chunkType: r.chunkType,
    }))
  },
})

export const count = query({
  args: { userId: v.id("users"), sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireSession(ctx, args.userId, args.sessionToken)
    const chunks = await ctx.db
      .query("ragChunks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()
    return chunks.length
  },
})
