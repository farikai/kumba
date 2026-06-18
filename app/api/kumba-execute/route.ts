import { executeToolCall } from "@/lib/ai"

export const maxDuration = 60
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { userId, toolCalls, pin } = await req.json()

    if (!userId || !toolCalls || !pin) {
      return new Response(JSON.stringify({ error: "userId, toolCalls, and pin required" }), { status: 400 })
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL
    if (!convexUrl) {
      return new Response(JSON.stringify({ error: "Convex not configured" }), { status: 500 })
    }

    const verifyRes = await fetch(`${convexUrl}/api/query/users:verifyPin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ args: { userId, pin } }),
    })
    if (!verifyRes.ok) {
      return new Response(JSON.stringify({ error: "PIN verification failed" }), { status: 500 })
    }
    const { value: pinValid } = await verifyRes.json()
    if (!pinValid) {
      return new Response(JSON.stringify({ error: "Incorrect PIN" }), { status: 403 })
    }

    const results = []
    for (const tc of toolCalls) {
      const result = await executeToolCall(
        {
          id: `exec-${Date.now()}`,
          type: "function",
          function: { name: tc.name, arguments: JSON.stringify(tc.args) },
        },
        {
          userId,
          fetchUserData: async () => ({
            balance: 0,
            transactions: [],
            beneficiaries: [],
            scheduledPayments: [],
            totalSpentThisMonth: 0,
            totalReceivedThisMonth: 0,
            spendingByCategory: {},
          }),
        },
      )
      results.push({ name: tc.name, args: tc.args, result: JSON.parse(result) })
    }

    const receipt = results.map((r) => {
      const isTransfer = ["send_money", "buy_airtime", "buy_data", "pay_electricity", "pay_tv"].includes(r.name)
      if (!isTransfer) return null
      const ref = `KUMBA-${Date.now().toString().slice(-8)}`
      return {
        type: r.name,
        amount: r.args.amount,
        ref,
        whatsappUrl: `https://wa.me/?text=Kumbapay%20Receipt%3A%20${r.name}%20of%20%E2%82%A6${r.args.amount.toLocaleString()}%20ref%3A%20${ref}`,
      }
    }).filter(Boolean)

    return new Response(
      JSON.stringify({
        success: true,
        results,
        receipt: receipt[0] ?? null,
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Kumba Execute] Error:", msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}
