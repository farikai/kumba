"use client"
import { useState } from "react"
import { ArrowLeft, MoreVertical, Mic, Send, Info, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface AiBudgetPlannerScreenProps {
  onBack: () => void
  userId: Id<"users">
}

const categories = [
  "Food & Groceries", "Transport", "Rent", "Utilities", "Entertainment",
  "Shopping", "Healthcare", "Education", "Savings", "Other",
]

const categoryColors: Record<string, string> = {
  "Food & Groceries": "#00FF41",
  Transport: "#4169E1",
  Rent: "#FF6B6B",
  Utilities: "#FFB800",
  Entertainment: "#9333EA",
  Shopping: "#FF9500",
  Healthcare: "#00BFFF",
  Education: "#FF69B4",
  Savings: "#00CC33",
  Other: "#888888",
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000

export default function AiBudgetPlannerScreen({ onBack, userId }: AiBudgetPlannerScreenProps) {
  const budgetData = useQuery(api.budgets.list, { userId })
  const setBudget = useMutation(api.budgets.setBudget)
  const removeBudget = useMutation(api.budgets.remove)

  const now = Date.now()
  const monthStart = now - MONTH_MS

  const transactions = useQuery(api.wallet.getTransactions, { userId, limit: 200 }) ?? []
  const recentTx = transactions.filter((t) => t.createdAt >= monthStart && t.type === "debit")
  const income = transactions.filter((t) => t.createdAt >= monthStart && t.type === "credit" && t.status === "completed")
    .reduce((s, t) => s + t.amount, 0)
  const totalSpent = recentTx.filter((t) => t.status === "completed").reduce((s, t) => s + t.amount, 0)

  const spendingByCategory: Record<string, number> = {}
  for (const t of recentTx) {
    if (t.status === "completed") {
      const cat = t.category ?? "Other"
      spendingByCategory[cat] = (spendingByCategory[cat] ?? 0) + t.amount
    }
  }

  const budgets = budgetData ?? []
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)

  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState("")

  const handleSetBudget = (cat: string) => {
    const amount = Number.parseFloat(editAmount)
    if (!amount || amount <= 0) return
    const period = amount >= 1000000 ? "monthly" : "monthly"
    setBudget({ userId, category: cat, amount, period })
    setEditingCategory(null)
    setEditAmount("")
  }

  const handleDeleteBudget = (id: string) => {
    removeBudget({ id: id as unknown as Id<"budgets"> })
  }

  const chartData = budgets.map((b) => {
    const spent = spendingByCategory[b.category] ?? 0
    const pct = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0
    return { category: b.category, budget: b.amount, spent, remaining: b.amount - spent, pct, color: categoryColors[b.category] ?? "#888" }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="text-white" size={20} />
        </button>
        <h1 className="text-white text-lg font-bold">AI Budget Planner</h1>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <MoreVertical className="text-white" size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {budgets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/50 text-sm">No budgets set yet. Add a budget category below to get started.</p>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-[#00FF41]/20 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#00FF41]/10 px-2 py-1 rounded-lg">
                <span className="text-[#00FF41] text-[10px] font-bold">AI</span>
              </div>
              <span className="text-[#00FF41] text-xs font-bold">BUDGET OVERVIEW</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-white/60 text-xs">Monthly Budget</span>
                <button className="text-white/40 hover:text-white/60"><Info size={12} /></button>
              </div>
              <h2 className="text-white text-3xl font-bold">
                ₦{totalBudget.toLocaleString()}<span className="text-lg text-white/40">/mo</span>
              </h2>
              <p className="text-white/50 text-xs">Income: ₦{income.toLocaleString()} • Spent: ₦{totalSpent.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {chartData.map((d, i) => {
                    const total = chartData.reduce((s, c) => s + c.budget, 0) || 1
                    const pct = (d.budget / total) * 100
                    const circumference = 251.2
                    const dashArray = (pct / 100) * circumference
                    let offset = 0
                    for (let j = 0; j < i; j++) {
                      const prevPct = (chartData[j].budget / total) * 100
                      offset -= (prevPct / 100) * circumference
                    }
                    return (
                      <circle key={d.category} cx="50" cy="50" r="40" fill="none"
                        stroke={d.color} strokeWidth="12"
                        strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                        strokeDashoffset={offset} strokeLinecap="round"
                      />
                    )
                  })}
                  <text x="50" y="52" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                    {chartData.length}
                  </text>
                  <text x="50" y="62" textAnchor="middle" fill="white" fontSize="6" fillOpacity="0.6">cats</text>
                </svg>
              </div>
              <div className="flex-1 space-y-1.5">
                {chartData.slice(0, 4).map((d) => (
                  <div key={d.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-white/80 text-xs">{d.category}</span>
                    </div>
                    <span className="text-white font-bold text-sm">₦{d.budget.toLocaleString()}</span>
                  </div>
                ))}
                {chartData.length > 4 && <p className="text-white/40 text-[10px]">+{chartData.length - 4} more categories</p>}
              </div>
            </div>
          </div>
        )}

        {budgets.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">Budget vs Actual</h3>
            {chartData.map((d) => (
              <div key={d.category} className="bg-[#0d2419]/30 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-white text-sm font-semibold">{d.category}</span>
                  </div>
                  <button onClick={() => handleDeleteBudget(d.category)} className="text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-white font-bold text-lg">₦{d.spent.toLocaleString()}</span>
                    <span className="text-white/40 text-xs ml-1">of ₦{d.budget.toLocaleString()}</span>
                  </div>
                  <span className={`text-xs font-bold ${d.remaining >= 0 ? "text-[#00FF41]" : "text-red-500"}`}>
                    {d.remaining >= 0 ? `₦${d.remaining.toLocaleString()} left` : `₦${Math.abs(d.remaining).toLocaleString()} over`}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, d.pct)}%`, backgroundColor: d.pct > 100 ? "#FF6B6B" : d.color }}
                  />
                </div>
                <p className="text-white/40 text-[10px] mt-1">{d.pct}% used</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-5 space-y-4">
          <h3 className="text-white text-xs font-bold uppercase tracking-wider">Set Budget</h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const existing = budgets.find((b) => b.category === cat)
              return (
                <div key={cat}>
                  {editingCategory === cat ? (
                    <div className="flex gap-1">
                      <Input value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="Amount" type="number"
                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-xs rounded-xl"
                      />
                      <button onClick={() => handleSetBudget(cat)} className="px-2 h-9 bg-[#00FF41] text-black text-xs font-bold rounded-xl hover:bg-[#00FF41]/90">
                        Set
                      </button>
                      <button onClick={() => setEditingCategory(null)} className="px-2 h-9 bg-white/5 text-white/60 text-xs rounded-xl hover:bg-white/10">
                        X
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingCategory(cat); setEditAmount(existing?.amount.toString() ?? "") }}
                      className={`w-full p-3 rounded-xl text-left transition-all ${existing ? "bg-[#00FF41]/10 border border-[#00FF41]/20" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
                    >
                      <p className="text-white text-xs font-semibold truncate">{cat}</p>
                      <p className="text-white/40 text-[10px]">{existing ? `₦${existing.amount.toLocaleString()}` : "Tap to set"}</p>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-white/5 bg-[#0a1a12]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Input placeholder="Ask Kumba to adjust your budget..." className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          <button className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Mic className="text-[#00FF41]" size={20} />
          </button>
          <button className="w-12 h-12 rounded-xl bg-[#00FF41] flex items-center justify-center hover:bg-[#00FF41]/90 transition-colors">
            <Send className="text-black" size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
