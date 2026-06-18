import { ninePsb } from "../convex/lib/9psb"

// ─── Config ─────────────────────────────────────────────────────
const OPENROUTER_BASE = "https://openrouter.ai/api/v1"
const MODEL = process.env.AI_MODEL ?? "google/gemini-2.5-flash-preview-04-17"
const API_KEY = process.env.AI_API_KEY ?? ""

// ─── Types ───────────────────────────────────────────────────────
export interface Message {
  role: "system" | "user" | "assistant"
  content: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

export interface ToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

export interface ToolDefinition {
  type: "function"
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface ChatRequest {
  messages: Message[]
  tools?: ToolDefinition[]
  stream?: boolean
}

export interface ChatResponse {
  choices: {
    message: {
      content: string | null
      tool_calls?: ToolCall[]
    }
    finish_reason: string
  }[]
}

// ─── Tool categories ────────────────────────────────────────────
export const READ_TOOLS = new Set([
  "check_balance", "get_transactions", "get_spending_breakdown",
  "lookup_account", "search_products", "get_budget_analysis",
  "get_tax_estimate", "analyze_financial_health", "get_savings_goals",
])

export const NAV_TOOLS = new Set([
  "navigate_screen", "scan_qr_code",
])

export const WRITE_TOOLS = new Set([
  "send_money", "buy_airtime", "buy_data",
  "pay_electricity", "pay_tv", "schedule_payment",
  "create_budget_plan", "manage_beneficiaries", "fund_wallet", "place_order",
])

// ─── Tool definitions the AI can call ──────────────────────────
export const KUMBA_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "check_balance",
      description: "Get the user's current wallet balance",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_transactions",
      description: "Get recent transactions. Optionally filter by type or category.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of transactions to return (default 10)" },
          type: { type: "string", enum: ["credit", "debit", "all"], description: "Filter by transaction type" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_spending_breakdown",
      description: "Analyze spending by category for a given period",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["week", "month", "year"], description: "Time period to analyze" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_money",
      description: "Send money to a Nigerian bank account via 9PSB",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "Amount in Naira" },
          accountNumber: { type: "string", description: "10-digit NUBAN account number" },
          bankCode: { type: "string", description: "Bank code (e.g. 044 for Access Bank)" },
          accountName: { type: "string", description: "Beneficiary account name" },
          narration: { type: "string", description: "Transfer description" },
        },
        required: ["amount", "accountNumber", "bankCode", "accountName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "buy_airtime",
      description: "Buy mobile airtime for any Nigerian network",
      parameters: {
        type: "object",
        properties: {
          network: { type: "string", enum: ["mtn", "airtel", "glo", "9mobile"] },
          phoneNumber: { type: "string", description: "Phone number to recharge" },
          amount: { type: "number", description: "Airtime amount in Naira" },
        },
        required: ["network", "phoneNumber", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "buy_data",
      description: "Buy mobile data bundle for any Nigerian network",
      parameters: {
        type: "object",
        properties: {
          network: { type: "string", enum: ["mtn", "airtel", "glo", "9mobile"] },
          phoneNumber: { type: "string", description: "Phone number" },
          planId: { type: "string", description: "Data plan ID" },
          amount: { type: "number", description: "Amount in Naira" },
        },
        required: ["network", "phoneNumber", "planId", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pay_electricity",
      description: "Pay electricity bill for any Nigerian DISCO",
      parameters: {
        type: "object",
        properties: {
          providerCode: { type: "string" },
          meterNumber: { type: "string" },
          amount: { type: "number" },
          meterType: { type: "string", enum: ["prepaid", "postpaid"] },
          phoneNumber: { type: "string" },
        },
        required: ["providerCode", "meterNumber", "amount", "meterType", "phoneNumber"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pay_tv",
      description: "Pay TV subscription (DSTV, GOtv, StarTimes)",
      parameters: {
        type: "object",
        properties: {
          providerCode: { type: "string", enum: ["dstv", "gotv", "startimes"] },
          smartCardNumber: { type: "string" },
          packageId: { type: "string" },
          phoneNumber: { type: "string" },
          amount: { type: "number" },
        },
        required: ["providerCode", "smartCardNumber", "packageId", "phoneNumber", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "schedule_payment",
      description: "Schedule a recurring or one-time future payment",
      parameters: {
        type: "object",
        properties: {
          recipientName: { type: "string" },
          amount: { type: "number" },
          frequency: { type: "string", enum: ["once", "daily", "weekly", "monthly"] },
          description: { type: "string" },
        },
        required: ["recipientName", "amount", "frequency"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search for real products across stores and compare prices. Use get_budget_analysis first to check if the user has room in their budget for this purchase.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Product to search for" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "place_order",
      description: "Place an order for a product after checking the user's budget. Only call this after user confirms the purchase.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "Full product name" },
          productPrice: { type: "number", description: "Product price in Naira" },
          store: { type: "string", description: "Store name (Jumia, Konga, Jiji)" },
          category: { type: "string", description: "Product category" },
          deliveryAddress: { type: "string", description: "Optional delivery address" },
        },
        required: ["productName", "productPrice", "store", "category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "share_receipt_whatsapp",
      description: "Share a transaction receipt via WhatsApp",
      parameters: {
        type: "object",
        properties: {
          transactionRef: { type: "string", description: "Transaction reference" },
          recipientPhone: { type: "string", description: "Phone number to send receipt to" },
        },
        required: ["transactionRef"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_account",
      description: "Look up a bank account name for verification",
      parameters: {
        type: "object",
        properties: {
          accountNumber: { type: "string", description: "10-digit account number" },
          bankCode: { type: "string", description: "Bank code" },
        },
        required: ["accountNumber", "bankCode"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate_screen",
      description: "Navigate the user to any feature screen in the app",
      parameters: {
        type: "object",
        properties: {
          screen: { type: "string", enum: ["send", "budget", "shop", "beneficiaries", "fund", "scheduled", "settings", "history", "budgetAnalytics", "transactionAnalytics", "bills", "airtime", "data", "electricity", "tv", "taxCalculator", "financialAnalyzer", "budgetCreator", "scan"] },
        },
        required: ["screen"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_budget_analysis",
      description: "Analyze the user's budget vs actual spending",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_tax_estimate",
      description: "Estimate tax liability based on income and spending",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_financial_health",
      description: "Run a full financial health analysis: savings rate, spending patterns, budget adherence, and recommendations",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_savings_goals",
      description: "Show the user's savings goals and progress",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_budget_plan",
      description: "Create or update a budget plan with category limits",
      parameters: {
        type: "object",
        properties: {
          categoryLimits: { type: "object", description: "Budget limits by category e.g. {Food: 100000, Transport: 50000}" },
        },
        required: ["categoryLimits"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "manage_beneficiaries",
      description: "Add or update a saved beneficiary",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["add", "update"] },
          name: { type: "string" },
          bankName: { type: "string" },
          accountNumber: { type: "string" },
          isFavorite: { type: "boolean" },
        },
        required: ["action", "name", "bankName", "accountNumber"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fund_wallet",
      description: "Show the user how to add money to their wallet",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "scan_qr_code",
      description: "Open the QR code scanner to pay a merchant or person",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
]

// ─── Tool executors (map tool name → handler) ──────────────────
export type ToolContext = {
  userId: string
  fetchUserData: () => Promise<{
    balance: number
    transactions: any[]
    beneficiaries: any[]
    scheduledPayments: any[]
    totalSpentThisMonth: number
    totalReceivedThisMonth: number
    spendingByCategory: Record<string, number>
  }>
}

export async function executeToolCall(
  toolCall: ToolCall,
  ctx: ToolContext,
): Promise<string> {
  const args = JSON.parse(toolCall.function.arguments)
  const { userId } = ctx

  switch (toolCall.function.name) {
    case "check_balance": {
      const data = await ctx.fetchUserData()
      return JSON.stringify({ balance: data.balance, currency: "NGN" })
    }

    case "get_transactions": {
      const data = await ctx.fetchUserData()
      const txs = data.transactions.slice(0, args.limit ?? 10)
      return JSON.stringify(txs)
    }

    case "get_spending_breakdown": {
      const data = await ctx.fetchUserData()
      const txs = data.transactions.filter((t: any) => t.type === "debit")
      const total = txs.reduce((s: number, t: any) => s + t.amount, 0)
      const byCategory: Record<string, number> = {}
      for (const t of txs) {
        const cat = t.category ?? t.description ?? "Other"
        byCategory[cat] = (byCategory[cat] ?? 0) + t.amount
      }
      return JSON.stringify({ totalSpent: total, byCategory, transactionCount: txs.length })
    }

    case "send_money": {
      const result = await ninePsb.transfer({
        amount: args.amount,
        currency: "NGN",
        accountNumber: args.accountNumber,
        bankCode: args.bankCode,
        accountName: args.accountName,
        narration: args.narration ?? "Transfer via Kumba",
        reference: `KUMBA-${Date.now()}`,
      })
      return JSON.stringify(result)
    }

    case "buy_airtime": {
      const result = await ninePsb.buyAirtime({
        network: args.network,
        phoneNumber: args.phoneNumber,
        amount: args.amount,
        reference: `KUMBA-ATM-${Date.now()}`,
      })
      return JSON.stringify(result)
    }

    case "buy_data": {
      const result = await ninePsb.buyData({
        network: args.network,
        phoneNumber: args.phoneNumber,
        planId: args.planId,
        reference: `KUMBA-DAT-${Date.now()}`,
      })
      return JSON.stringify(result)
    }

    case "pay_electricity":
      return JSON.stringify(await ninePsb.payElectricity({ ...args, reference: `KUMBA-ELE-${Date.now()}` }))

    case "pay_tv":
      return JSON.stringify(await ninePsb.payTv({ ...args, reference: `KUMBA-TV-${Date.now()}` }))

    case "schedule_payment":
      return JSON.stringify({ status: "scheduled", ...args })

    case "search_products": {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL
        if (siteUrl) {
          const res = await fetch(`${siteUrl}/api/query/products:search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ args: { query: args.query } }),
          })
          if (res.ok) {
            const { value: products } = await res.json()
            if (products && products.length > 0) {
              return JSON.stringify({ products, query: args.query, storeCount: [...new Set(products.map((p: any) => p.store))].length })
            }
          }
        }
      } catch {}
      return JSON.stringify({ products: [], query: args.query, note: "Product catalog not available" })
    }

    case "place_order": {
      const data = await ctx.fetchUserData()
      if (data.balance < args.productPrice) {
        return JSON.stringify({
          success: false,
          error: "Insufficient balance",
          balance: data.balance,
          needed: args.productPrice,
          shortfall: args.productPrice - data.balance,
        })
      }
      const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL
      if (siteUrl) {
        try {
          const res = await fetch(`${siteUrl}/api/mutation/orders:placeOrder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              args: {
                userId: ctx.userId,
                productName: args.productName,
                productPrice: args.productPrice,
                store: args.store,
                category: args.category,
                deliveryAddress: args.deliveryAddress,
              },
            }),
          })
          if (res.ok) {
            const { value: result } = await res.json()
            return JSON.stringify(result)
          }
        } catch {}
      }
      return JSON.stringify({ success: false, error: "Order processing failed" })
    }

    case "share_receipt_whatsapp": {
      const phone = args.recipientPhone?.replace(/\D/g, "") ?? "234"
      const ref = args.transactionRef
      const url = `https://wa.me/${phone}?text=Here is your Kumbapay receipt for transaction ${ref}. Thank you for using Kumbapay!`
      return JSON.stringify({ whatsappUrl: url, message: "Receipt ready to share" })
    }

    case "lookup_account": {
      return JSON.stringify(await ninePsb.lookupAccount(args.accountNumber, args.bankCode))
    }

    case "navigate_screen":
      return JSON.stringify({ navigateTo: args.screen })

    case "get_budget_analysis": {
      const data = await ctx.fetchUserData()
      const budget = 300000
      const used = data.totalSpentThisMonth
      const remaining = budget - used
      return JSON.stringify({
        monthlyBudget: budget,
        totalSpent: used,
        remaining: Math.max(0, remaining),
        overspent: remaining < 0 ? Math.abs(remaining) : 0,
        usagePercent: Math.round((used / budget) * 100),
        byCategory: data.spendingByCategory,
        currency: "NGN",
      })
    }

    case "get_tax_estimate": {
      const data = await ctx.fetchUserData()
      const income = data.totalReceivedThisMonth
      const annualized = income * 12
      let tax = 0
      if (annualized > 300000) tax += (Math.min(annualized, 300000) - 0) * 0.01
      if (annualized > 300000) tax += (Math.min(annualized, 600000) - 300000) * 0.05
      if (annualized > 600000) tax += (Math.min(annualized, 1100000) - 600000) * 0.1
      if (annualized > 1100000) tax += (Math.min(annualized, 1600000) - 1100000) * 0.15
      if (annualized > 1600000) tax += (Math.min(annualized, 3200000) - 1600000) * 0.2
      if (annualized > 3200000) tax += (annualized - 3200000) * 0.24
      return JSON.stringify({
        monthlyIncome: income,
        annualizedIncome: annualized,
        estimatedAnnualTax: Math.round(tax),
        estimatedMonthlyTax: Math.round(tax / 12),
        currency: "NGN",
        note: "Based on Nigerian PAYE tax brackets (estimate only)",
      })
    }

    case "analyze_financial_health": {
      const data = await ctx.fetchUserData()
      const income = data.totalReceivedThisMonth
      const spent = data.totalSpentThisMonth
      const savingsRate = income > 0 ? Math.round(((income - spent) / income) * 100) : 0
      const categories = Object.keys(data.spendingByCategory).length
      const hasEmergency = income * 3 <= data.balance
      let score = 0
      if (savingsRate >= 20) score += 30
      else if (savingsRate >= 10) score += 20
      else if (savingsRate >= 0) score += 10
      if (data.balance >= 100000) score += 25
      else if (data.balance >= 50000) score += 15
      else score += 5
      if (income > spent) score += 25
      else score += 5
      if (hasEmergency) score += 20
      const rating = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Improvement"
      return JSON.stringify({
        score,
        rating,
        savingsRate: `${savingsRate}%`,
        totalBalance: data.balance,
        monthlyIncome: income,
        monthlySpending: spent,
        hasEmergencyFund: hasEmergency,
        categoriesTracked: categories,
        suggestion: score < 60 ? "Try increasing your savings rate to 20% of income" : "Keep up the good financial habits!",
      })
    }

    case "get_savings_goals": {
      const data = await ctx.fetchUserData()
      const income = data.totalReceivedThisMonth
      const spent = data.totalSpentThisMonth
      const totalSaved = data.balance
      const monthlySavings = Math.max(0, income - spent)
      return JSON.stringify({
        currentBalance: totalSaved,
        monthlySavings: monthlySavings,
        savingsRate: income > 0 ? Math.round(((income - spent) / income) * 100) : 0,
        currency: "NGN",
        goalSuggestions: [
          { name: "Emergency Fund (3 months expenses)", target: Math.round(spent * 3), progress: Math.round((totalSaved / (spent * 3)) * 100) },
          { name: "Yearly Savings Target", target: Math.round(spent * 12), progress: Math.round((totalSaved / (spent * 12)) * 100) },
        ],
      })
    }

    case "create_budget_plan":
      return JSON.stringify({ status: "budget_created", categoryLimits: args.categoryLimits })

    case "manage_beneficiaries": {
      const beneficiaries = (await ctx.fetchUserData()).beneficiaries
      return JSON.stringify({
        status: `${args.action}_beneficiary`,
        name: args.name,
        bankName: args.bankName,
        accountNumber: args.accountNumber,
        currentBeneficiaries: beneficiaries,
      })
    }

    case "fund_wallet":
      return JSON.stringify({ navigateTo: "fund", message: "Opening fund wallet screen" })

    case "scan_qr_code":
      return JSON.stringify({ navigateTo: "scan", message: "Opening QR scanner" })

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolCall.function.name}` })
  }
}

// ─── OpenRouter Chat Completion ──────────────────────────────────
export async function chatCompletion(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "HTTP-Referer": "https://korapay.app",
      "X-Title": "Kumbapay",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: req.messages,
      tools: req.tools,
      stream: false,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  return res.json()
}

// ─── Streaming chat (for frontend consumption) ──────────────────
export async function* streamChat(req: ChatRequest): AsyncGenerator<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "HTTP-Referer": "https://korapay.app",
      "X-Title": "Kumbapay",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: req.messages,
      tools: req.tools,
      stream: true,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter stream error ${res.status}: ${err}`)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error("No response body")

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith("data: ")) continue
      const payload = trimmed.slice(6)
      if (payload === "[DONE]") return
      try {
        const parsed = JSON.parse(payload)
        const delta = parsed.choices?.[0]?.delta
        if (delta?.content) yield delta.content
        if (delta?.tool_calls) yield JSON.stringify({ tool_calls: delta.tool_calls })
      } catch { /* skip malformed */ }
    }
  }
}
