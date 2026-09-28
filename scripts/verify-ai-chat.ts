/**
 * Verification for the AI chat / money-execution P0 fixes.
 *
 * Run:  npm run verify:ai   (equivalently: npx tsx scripts/verify-ai-chat.ts)
 *
 * Covers:
 *  1. A read-tool turn feeds tool results back with role "tool" + matching
 *     tool_call_id (the fixed bug).
 *  2. Money-movement tools are no longer executed inside lib/ai.ts, so there
 *     is a single money path (the Convex 9PSB actions).
 *  3. Read tools still execute correctly.
 */
import assert from "node:assert/strict"
import {
  buildToolFollowUpMessages,
  executeToolCall,
  type Message,
  type ToolCall,
} from "../lib/ai"

const ctx = {
  userId: "user_1",
  fetchUserData: async () => ({
    balance: 5000,
    transactions: [],
    beneficiaries: [],
    scheduledPayments: [],
    budgets: [],
    totalSpentThisMonth: 0,
    totalReceivedThisMonth: 0,
    spendingByCategory: {},
  }),
}

async function main() {
  // --- 1. Read-tool turn: tool results must use role "tool" ----------------
  // Mirrors a real turn: user asks for their balance, the assistant calls
  // check_balance, and the result is fed back to the model.
  const apiMessages: Message[] = [
    { role: "system", content: "You are Kumba." },
    { role: "user", content: "What is my balance?" },
  ]
  const toolCalls: ToolCall[] = [
    { id: "call_abc123", type: "function", function: { name: "check_balance", arguments: "{}" } },
  ]
  const readResults = [JSON.stringify({ balance: 842300, currency: "NGN" })]

  const followUp = buildToolFollowUpMessages(apiMessages, "", toolCalls, readResults)

  assert.equal(followUp.length, 4)
  assert.equal(followUp[2].role, "assistant")
  assert.equal(followUp[2].tool_calls?.[0]?.id, "call_abc123")

  const toolMsg = followUp[3]
  assert.equal(toolMsg.role, "tool", 'tool results must use role "tool" (the fixed bug)')
  assert.equal(toolMsg.tool_call_id, "call_abc123")
  assert.equal(toolMsg.content, readResults[0])
  console.log('✓ read-tool turn: tool result uses role "tool" with matching tool_call_id')

  // --- 2. Money tools no longer execute inside lib/ai.ts -------------------
  const moneyTools = ["send_money", "buy_airtime", "buy_data", "pay_electricity", "pay_tv"]
  for (const name of moneyTools) {
    const out = await executeToolCall(
      { id: `c_${name}`, type: "function", function: { name, arguments: JSON.stringify({ amount: 100 }) } },
      ctx,
    )
    assert.match(out, /Unknown tool/, `${name} must NOT be executed by lib/ai.ts anymore`)
  }
  console.log("✓ money tools are no longer executed in lib/ai.ts (single Convex action path)")

  // --- 3. Read tools still work -------------------------------------------
  const balance = await executeToolCall(
    { id: "c_bal", type: "function", function: { name: "check_balance", arguments: "{}" } },
    ctx,
  )
  assert.deepEqual(JSON.parse(balance), { balance: 5000, currency: "NGN" })
  console.log("✓ read tools still execute correctly")

  console.log("\nAll AI chat / money-path checks passed.")
}

main().catch((err) => {
  console.error("✗ verification failed:", err)
  process.exit(1)
})
