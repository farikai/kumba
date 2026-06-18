"use client"

import { useState } from "react"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ShoppingBag,
  CalendarClock,
  Lightbulb,
  Bot,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react"

interface BudgetAnalyticsScreenProps {
  onBack: () => void
}

// Simulated user transaction data that Kumba AI learns from
const userFinancialData = {
  monthlyIncome: 650000,
  totalSpent: 420000,
  totalSaved: 85000,
  scheduledPayments: 145000,
  shoppingSpend: 78500,

  // AI-learned patterns
  spendingPatterns: {
    averageDaily: 14000,
    highestDay: "Friday",
    lowestDay: "Tuesday",
    impulseSpending: 23,
  },

  categories: [
    { name: "Essentials", allocated: 250000, spent: 198000, icon: "home", color: "#00FF41" },
    { name: "Shopping", allocated: 80000, spent: 78500, icon: "shopping", color: "#FF6B6B" },
    { name: "Transport", allocated: 50000, spent: 42000, icon: "car", color: "#4ECDC4" },
    { name: "Entertainment", allocated: 40000, spent: 35000, icon: "entertainment", color: "#FFE66D" },
    { name: "Savings", allocated: 100000, spent: 85000, icon: "savings", color: "#95E1D3" },
  ],

  scheduledBreakdown: [
    { name: "Rent", amount: 80000, date: "1st", status: "upcoming" },
    { name: "Data Plan", amount: 5000, date: "Weekly", status: "active" },
    { name: "Netflix", amount: 4500, date: "15th", status: "active" },
    { name: "Gym", amount: 15000, date: "1st", status: "paused" },
    { name: "Electricity", amount: 12000, date: "20th", status: "upcoming" },
  ],

  recentPurchases: [
    { item: "Mama Gold Rice 50kg", store: "Jumia", amount: 45000, date: "Today" },
    { item: "Nike Air Max", store: "Jumia", amount: 25000, date: "Yesterday" },
    { item: "Groceries", store: "Shoprite", amount: 8500, date: "2 days ago" },
  ],

  aiInsights: [
    {
      type: "warning",
      title: "Shopping budget nearly depleted",
      message: "You've spent 98% of your shopping budget. Consider holding off on non-essential purchases.",
      action: "View Details",
    },
    {
      type: "success",
      title: "Great saving streak!",
      message: "You've saved consistently for 3 months. At this rate, you'll hit your ₦500k goal by December.",
      action: "See Progress",
    },
    {
      type: "tip",
      title: "Friday spending pattern",
      message: "You tend to spend 40% more on Fridays. Setting a Friday budget of ₦10k could save you ₦15k/month.",
      action: "Set Limit",
    },
  ],
}

export default function BudgetAnalyticsScreen({ onBack }: BudgetAnalyticsScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month")
  const [activeSection, setActiveSection] = useState<"overview" | "scheduled" | "shopping">("overview")

  const budgetUsedPercent = (userFinancialData.totalSpent / userFinancialData.monthlyIncome) * 100
  const savingsRate = (userFinancialData.totalSaved / userFinancialData.monthlyIncome) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] pb-24">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg">Budget Analytics</h1>
          <p className="text-white/40 text-xs">Powered by Kumba AI</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <MoreHorizontal className="text-white/60" size={20} />
        </button>
      </div>

      {/* Period Selector */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 bg-white/5 rounded-2xl p-1">
          {(["week", "month", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPeriod === period ? "bg-[#00FF41] text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          {/* Income */}
          <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="text-[#00FF41]" size={16} />
              <span className="text-white/50 text-xs">Income</span>
            </div>
            <p className="text-white font-bold text-xl">₦{(userFinancialData.monthlyIncome / 1000).toFixed(0)}k</p>
            <p className="text-[#00FF41] text-[10px] font-medium mt-1">+12% vs last month</p>
          </div>

          {/* Spent */}
          <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="text-red-400" size={16} />
              <span className="text-white/50 text-xs">Spent</span>
            </div>
            <p className="text-white font-bold text-xl">₦{(userFinancialData.totalSpent / 1000).toFixed(0)}k</p>
            <p className="text-red-400 text-[10px] font-medium mt-1">{budgetUsedPercent.toFixed(0)}% of income</p>
          </div>

          {/* Saved */}
          <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="text-[#00FF41]" size={16} />
              <span className="text-white/50 text-xs">Saved</span>
            </div>
            <p className="text-white font-bold text-xl">₦{(userFinancialData.totalSaved / 1000).toFixed(0)}k</p>
            <p className="text-[#00FF41] text-[10px] font-medium mt-1">{savingsRate.toFixed(0)}% savings rate</p>
          </div>

          {/* Scheduled */}
          <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="text-yellow-400" size={16} />
              <span className="text-white/50 text-xs">Scheduled</span>
            </div>
            <p className="text-white font-bold text-xl">₦{(userFinancialData.scheduledPayments / 1000).toFixed(0)}k</p>
            <p className="text-yellow-400 text-[10px] font-medium mt-1">5 upcoming</p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          {[
            { id: "overview", label: "Overview", icon: Wallet },
            { id: "scheduled", label: "Scheduled", icon: CalendarClock },
            { id: "shopping", label: "Shopping", icon: ShoppingBag },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeSection === tab.id
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30"
                  : "bg-white/5 text-white/50 border border-transparent"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="text-[#00FF41]" size={16} />
          <h2 className="text-white font-bold text-sm">Kumba AI Insights</h2>
        </div>
        <div className="space-y-2">
          {userFinancialData.aiInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl border ${
                insight.type === "warning"
                  ? "bg-orange-500/10 border-orange-500/20"
                  : insight.type === "success"
                    ? "bg-[#00FF41]/10 border-[#00FF41]/20"
                    : "bg-blue-500/10 border-blue-500/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    insight.type === "warning"
                      ? "bg-orange-500/20"
                      : insight.type === "success"
                        ? "bg-[#00FF41]/20"
                        : "bg-blue-500/20"
                  }`}
                >
                  <Lightbulb
                    size={16}
                    className={
                      insight.type === "warning"
                        ? "text-orange-400"
                        : insight.type === "success"
                          ? "text-[#00FF41]"
                          : "text-blue-400"
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm mb-1">{insight.title}</p>
                  <p className="text-white/60 text-xs leading-relaxed mb-2">{insight.message}</p>
                  <button
                    className={`text-xs font-semibold ${
                      insight.type === "warning"
                        ? "text-orange-400"
                        : insight.type === "success"
                          ? "text-[#00FF41]"
                          : "text-blue-400"
                    }`}
                  >
                    {insight.action} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      {activeSection === "overview" && (
        <div className="px-5 mb-5">
          <h2 className="text-white font-bold text-sm mb-3">Budget by Category</h2>
          <div className="space-y-3">
            {userFinancialData.categories.map((category, index) => {
              const percentUsed = (category.spent / category.allocated) * 100
              const isOverBudget = percentUsed > 90

              return (
                <div key={index} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon === "home" && <Wallet size={18} style={{ color: category.color }} />}
                        {category.icon === "shopping" && <ShoppingBag size={18} style={{ color: category.color }} />}
                        {category.icon === "car" && <TrendingUp size={18} style={{ color: category.color }} />}
                        {category.icon === "entertainment" && (
                          <TrendingDown size={18} style={{ color: category.color }} />
                        )}
                        {category.icon === "savings" && <PiggyBank size={18} style={{ color: category.color }} />}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{category.name}</p>
                        <p className="text-white/40 text-xs">
                          ₦{category.spent.toLocaleString()} / ₦{category.allocated.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isOverBudget ? "text-red-400" : "text-[#00FF41]"}`}>
                      {percentUsed.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentUsed, 100)}%`,
                        backgroundColor: isOverBudget ? "#FF6B6B" : category.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Scheduled Payments Section */}
      {activeSection === "scheduled" && (
        <div className="px-5 mb-5">
          <h2 className="text-white font-bold text-sm mb-3">Scheduled Payments</h2>
          <div className="space-y-2">
            {userFinancialData.scheduledBreakdown.map((payment, index) => (
              <div
                key={index}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      payment.status === "active"
                        ? "bg-[#00FF41]/20"
                        : payment.status === "paused"
                          ? "bg-yellow-500/20"
                          : "bg-white/10"
                    }`}
                  >
                    <CalendarClock
                      size={18}
                      className={
                        payment.status === "active"
                          ? "text-[#00FF41]"
                          : payment.status === "paused"
                            ? "text-yellow-400"
                            : "text-white/40"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{payment.name}</p>
                    <p className="text-white/40 text-xs">{payment.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">₦{payment.amount.toLocaleString()}</p>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      payment.status === "active"
                        ? "bg-[#00FF41]/20 text-[#00FF41]"
                        : payment.status === "paused"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-white/10 text-white/40"
                    }`}
                  >
                    {payment.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shopping Analytics Section */}
      {activeSection === "shopping" && (
        <div className="px-5 mb-5">
          <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-sm">Total Shopping Spend</span>
              <span className="text-white font-bold text-xl">₦{userFinancialData.shoppingSpend.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] rounded-full"
                style={{ width: "98%" }}
              />
            </div>
            <p className="text-red-400 text-xs mt-2">98% of shopping budget used</p>
          </div>

          <h3 className="text-white font-bold text-sm mb-3">Recent Purchases</h3>
          <div className="space-y-2">
            {userFinancialData.recentPurchases.map((purchase, index) => (
              <div
                key={index}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <ShoppingBag size={18} className="text-white/40" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{purchase.item}</p>
                    <p className="text-white/40 text-xs">
                      {purchase.store} • {purchase.date}
                    </p>
                  </div>
                </div>
                <p className="text-white font-bold text-sm">₦{purchase.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending Patterns AI Card */}
      <div className="px-5">
        <div className="bg-gradient-to-r from-[#00FF41]/10 via-[#00FF41]/5 to-transparent border border-[#00FF41]/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="text-[#00FF41]" size={18} />
            <span className="text-[#00FF41] font-bold text-sm">AI Spending Patterns</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/40 text-xs">Avg. Daily Spend</p>
              <p className="text-white font-bold">
                ₦{userFinancialData.spendingPatterns.averageDaily.toLocaleString()}
              </p>
            </div>
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/40 text-xs">Highest Spend Day</p>
              <p className="text-white font-bold">{userFinancialData.spendingPatterns.highestDay}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/40 text-xs">Lowest Spend Day</p>
              <p className="text-white font-bold">{userFinancialData.spendingPatterns.lowestDay}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/40 text-xs">Impulse Rate</p>
              <p className="text-white font-bold">{userFinancialData.spendingPatterns.impulseSpending}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
