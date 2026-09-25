import { clearUserRagChunks, ingestUserData } from "@/lib/rag-ingestion"
import { buildFinancialContext } from "@/lib/rag"

export async function POST(req: Request) {
  try {
    const { userId, sessionToken } = await req.json()
    if (!userId || !sessionToken) {
      return new Response(JSON.stringify({ error: "userId and sessionToken required" }), { status: 400 })
    }

    const ctx = await buildFinancialContext(userId, sessionToken)

    await clearUserRagChunks(userId, sessionToken)

    await ingestUserData(
      userId,
      sessionToken,
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
