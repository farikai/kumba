import { clearUserRagChunks, ingestUserData } from "@/lib/rag-ingestion"
import { buildFinancialContext } from "@/lib/rag"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), { status: 400 })
    }

    const ctx = await buildFinancialContext(userId)

    await clearUserRagChunks(userId)

    await ingestUserData(
      userId,
      ctx.recentTransactions as any[],
      ctx.beneficiaries as any[],
      ctx.scheduledPayments as any[],
      ctx.balance,
    )

    return new Response(JSON.stringify({ success: true, chunkCount: ctx.recentTransactions.length + ctx.beneficiaries.length + ctx.scheduledPayments.length + 13 }))
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Kumba Ingest] Error:", msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}
