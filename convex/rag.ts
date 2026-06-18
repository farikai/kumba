import { v } from "convex/values"
import { query, mutation } from "./_generated/server"

export const store = mutation({
  args: {
    userId: v.id("users"),
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
    const now = Date.now()
    for (const chunk of args.chunks) {
      await ctx.db.insert("ragChunks", {
        userId: args.userId,
        content: chunk.content,
        embedding: chunk.embedding,
        source: chunk.source,
        chunkType: chunk.chunkType,
        createdAt: now,
      })
    }
  },
})

export const clearUserChunks = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
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
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("ragChunks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()
    return chunks.map((r) => ({
      content: r.content,
      embedding: r.embedding,
      source: r.source,
      chunkType: r.chunkType,
    }))
  },
})

export const count = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("ragChunks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()
    return chunks.length
  },
})
