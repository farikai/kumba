"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ShoppingBag, Zap, Car, Home, Coffee, ChevronRight } from "lucide-react"

const spendingData = [
  {
    category: "Food & Dining",
    amount: 45200,
    percentage: 28,
    icon: Coffee,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    category: "Transport",
    amount: 32500,
    percentage: 20,
    icon: Car,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    category: "Shopping",
    amount: 28000,
    percentage: 17,
    icon: ShoppingBag,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    category: "Bills & Utilities",
    amount: 25000,
    percentage: 15,
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    category: "Housing",
    amount: 20000,
    percentage: 12,
    icon: Home,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
]

const monthlyTrend = [
  { month: "Jan", spent: 120000, budget: 150000 },
  { month: "Feb", spent: 135000, budget: 150000 },
  { month: "Mar", spent: 142000, budget: 150000 },
  { month: "Apr", spent: 128000, budget: 150000 },
]

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month")

  const totalSpent = spendingData.reduce((sum, item) => sum + item.amount, 0)
  const budgetLimit = 200000
  const percentageOfBudget = (totalSpent / budgetLimit) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0f2818] to-[#0a1a12] pb-24">
      <div className="px-6 pt-8 pb-6">
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold mb-2">Analytics</h1>
          <p className="text-white/50 text-sm">Track your spending and insights</p>
        </div>

        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                selectedPeriod === period ? "bg-[#00FF41] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <TrendingDown size={18} />
              <p className="text-xs font-medium">Total Spent</p>
            </div>
            <h3 className="text-white text-2xl font-bold">₦{totalSpent.toLocaleString()}</h3>
            <p className="text-white/40 text-xs mt-1">This {selectedPeriod}</p>
          </div>

          <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#00FF41] mb-2">
              <TrendingUp size={18} />
              <p className="text-xs font-medium">Budget Left</p>
            </div>
            <h3 className="text-white text-2xl font-bold">₦{(budgetLimit - totalSpent).toLocaleString()}</h3>
            <p className="text-white/40 text-xs mt-1">{(100 - percentageOfBudget).toFixed(0)}% remaining</p>
          </div>
        </div>

        <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Budget Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">
                ₦{totalSpent.toLocaleString()} of ₦{budgetLimit.toLocaleString()}
              </span>
              <span
                className={percentageOfBudget > 80 ? "text-orange-400 font-semibold" : "text-[#00FF41] font-semibold"}
              >
                {percentageOfBudget.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  percentageOfBudget > 80
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : "bg-gradient-to-r from-[#00FF41] to-[#00CC33]"
                }`}
                style={{ width: `${Math.min(percentageOfBudget, 100)}%` }}
              />
            </div>
            {percentageOfBudget > 80 && (
              <p className="text-xs text-orange-400 font-medium">
                You're approaching your budget limit. Consider reducing spending.
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Spending by Category</h3>
          <div className="space-y-2">
            {spendingData.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.category} className="p-4 hover:bg-secondary/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={20} className={item.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{item.category}</p>
                        <p className="font-bold text-sm">₦{item.amount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color.replace("text-", "bg-")}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Monthly Trend</h3>
          <div className="space-y-3">
            {monthlyTrend.map((month) => {
              const percentageSpent = (month.spent / month.budget) * 100
              return (
                <div key={month.month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-white/60">
                      ₦{month.spent.toLocaleString()} / ₦{month.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-primary transition-all"
                      style={{ width: `${percentageSpent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-4 bg-accent/5 border-accent/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-accent" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">AI Insight</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your food spending is 15% higher than last month. Try meal prepping to save ₦10,000+ monthly. Would you
                like me to create a budget plan?
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
