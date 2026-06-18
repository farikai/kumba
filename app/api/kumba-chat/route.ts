import { type Message, KUMBA_TOOLS, READ_TOOLS, NAV_TOOLS, WRITE_TOOLS, executeToolCall, chatCompletion } from "@/lib/ai"
import { buildFinancialContext, formatFinancialContext } from "@/lib/rag"

export const maxDuration = 60
export const runtime = "nodejs"

const SYSTEM_PROMPT = `You are Kumba, the AI financial assistant built into Kumbapay — a Nigerian digital wallet.

YOUR IDENTITY:
- You are an AI agent that LIVES inside the user's wallet
- You are friendly, warm, and conversational — like a trusted financial advisor
- You speak Nigerian English naturally
- You are proactive and helpful

FEATURES YOU CAN USE (use navigate_screen to open any):

💰 BALANCE & TRANSACTIONS — check_balance, get_transactions, get_spending_breakdown
💸 SEND MONEY — send_money to any Nigerian bank via 9PSB (uses saved beneficiaries)
📱 AIRTIME & DATA — buy_airtime (MTN, Airtel, Glo, 9mobile), buy_data
💡 ELECTRICITY — pay_electricity (IKEDC, EKEDC, AEDC, PHEDC, IBEDC, KEDC)
📺 TV — pay_tv (DSTV, GOtv, StarTimes)
📅 SCHEDULING — schedule_payment (once/daily/weekly/monthly)
🛒 SHOPPING — search_products (compare prices across Jumia, Konga)
📤 SHARE — share_receipt_whatsapp
🔍 LOOKUP — lookup_account (verify bank account names)

ALL APP SCREENS (use navigate_screen to go to any):
- send → Send money screen
- airtime → Buy airtime
- data → Buy data bundles
- electricity → Pay electricity
- tv → Pay TV subscription
- bills → All bills
- budget → AI Budget Planner (create budget plans)
- budgetCreator → Manual budget creator
- budgetAnalytics → Budget vs actual spending reports
- transactionAnalytics → Transaction insights & charts
- taxCalculator → AI tax calculator (estimate PAYE tax)
- financialAnalyzer → Financial health score & analysis
- shop → Product search & price comparison
- beneficiaries → Manage saved beneficiaries
- scheduled → View scheduled payments
- fund → Fund wallet / add money
- scan → QR code scanner
- history → Full transaction history
- settings → App settings
- moreFeatures → All features list

RULES:
1. When user says "send X to [beneficiary name]", look up the beneficiary in SAVED BENEFICIARIES and auto-fill their bank details.
2. Always ask for confirmation before executing financial operations (send money, buy airtime, etc.).
3. When asked about finances, use tools to get REAL data from the financial context — do not make up numbers.
4. For analysis (budget, tax, financial health), use the dedicated tools — they analyze real transaction data.
5. If user wants to explore features, use navigate_screen to open the relevant screen.
6. Be concise and helpful. Use Nigerian context (₦, local references).
7. After a successful transaction, offer to share the receipt via WhatsApp.

SHOPPING & BUDGET RULES:
8. When user wants to buy something, FIRST call search_products to find real products and compare prices across stores.
9. BEFORE recommending a purchase, call get_budget_analysis to check the user's budget for that category. Only recommend products that fit within their remaining budget.
10. Show the user the best value option (lowest price + highest rating) with price comparison across stores.
11. Ask for confirmation before placing the order. Use place_order only after user confirms.
12. After a successful order, tell the user their new balance and offer to share the receipt.`

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json()
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), { status: 400 })
    }

    const financialCtx = await buildFinancialContext(userId)
    const ragContext = formatFinancialContext(financialCtx)

    // Lazy-trigger ingestion if no semantic chunks exist yet
    if (financialCtx.semanticChunks.length === 0) {
      fetch(`${process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? ""}/api/query/rag:count`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ args: { userId } }),
      })
        .then(async (r) => {
          if (r.ok) {
            const { value: count } = await r.json()
            if (count === 0) {
              fetch(`${req.headers.get("origin") ?? "http://localhost:3000"}/api/kumba-ingest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              }).catch(() => {})
            }
          }
        })
        .catch(() => {})
    }

    const contextMsg: Message = {
      role: "system",
      content: `${SYSTEM_PROMPT}

${ragContext}

When the user asks about their finances, use this data. For operations, use the available tools.`,
    }

    const apiMessages: Message[] = [
      contextMsg,
      ...messages.map((m: any) => ({
        role: m.role as Message["role"],
        content: m.content,
      })),
    ]

    const response = await chatCompletion({
      messages: apiMessages,
      tools: KUMBA_TOOLS,
    })

    const choice = response.choices?.[0]
    if (!choice) throw new Error("No response from AI")

    const responseMsg = choice.message

    if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
      const readResults: string[] = []
      const writeCalls: any[] = []
      let navigateAction: string | null = null

      const ctx = {
        userId,
        fetchUserData: async () => ({
          balance: financialCtx.balance,
          transactions: financialCtx.recentTransactions,
          beneficiaries: financialCtx.beneficiaries,
          scheduledPayments: financialCtx.scheduledPayments,
          totalSpentThisMonth: financialCtx.totalSpentThisMonth,
          totalReceivedThisMonth: financialCtx.totalReceivedThisMonth,
          spendingByCategory: financialCtx.spendingByCategory,
        }),
      }

      for (const tc of responseMsg.tool_calls) {
        if (READ_TOOLS.has(tc.function.name)) {
          const result = await executeToolCall(tc, ctx)
          readResults.push(result)
        } else if (NAV_TOOLS.has(tc.function.name)) {
          const result = await executeToolCall(tc, ctx)
          const parsed = JSON.parse(result)
          if (parsed.navigateTo) navigateAction = parsed.navigateTo
          readResults.push(result)
        } else if (WRITE_TOOLS.has(tc.function.name)) {
          writeCalls.push({ name: tc.function.name, args: JSON.parse(tc.function.arguments) })
        }
      }

      if (writeCalls.length > 0) {
        return new Response(
          JSON.stringify({
            content: responseMsg.content ?? "",
            pendingAction: {
              toolCalls: writeCalls,
              balance: financialCtx.balance,
            },
          }),
          { headers: { "Content-Type": "application/json" } },
        )
      }

      if (navigateAction) {
        const content = responseMsg.content ?? ""
        return new Response(
          JSON.stringify({
            content,
            navigateAction,
            balance: financialCtx.balance,
          }),
          { headers: { "Content-Type": "application/json" } },
        )
      }

      const followUpMessages: Message[] = [
        ...apiMessages,
        {
          role: "assistant",
          content: responseMsg.content ?? "",
          tool_calls: responseMsg.tool_calls,
        },
        ...responseMsg.tool_calls.map((tc, i) => ({
          role: "assistant" as const,
          content: readResults[i] ?? "",
          tool_call_id: tc.id,
        })),
      ]

      const finalResponse = await chatCompletion({ messages: followUpMessages })
      const finalContent = finalResponse.choices?.[0]?.message?.content ?? ""

      return new Response(
        JSON.stringify({
          content: finalContent,
          balance: financialCtx.balance,
        }),
        { headers: { "Content-Type": "application/json" } },
      )
    }

    return new Response(
      JSON.stringify({
        content: responseMsg.content ?? "",
        balance: financialCtx.balance,
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Kumba Chat] Error:", msg)
    return new Response(
      JSON.stringify({ content: `I'm having trouble connecting right now. (${msg})\nPlease try again or use the menu below.` }),
      { headers: { "Content-Type": "application/json" } },
    )
  }
}
