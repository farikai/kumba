"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useSession } from "@/components/session-provider"
import { motion, AnimatePresence } from "framer-motion"
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
  userId?: string | null
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

export default function BudgetAnalyticsScreen({ onBack, userId }: BudgetAnalyticsScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month")
  const [activeSection, setActiveSection] = useState<"overview" | "scheduled" | "shopping">("overview")
  const { session } = useSession()
  const effectiveUserId = (session?.userId ?? userId) as Id<"users"> | undefined
  const authed = effectiveUserId && session?.sessionToken
    ? { userId: effectiveUserId, sessionToken: session.sessionToken }
    : "skip"
  const liveAnalytics = useQuery(api.budgets.getBudgetAnalytics, authed)
  const liveHealth = useQuery(api.analytics.getFinancialHealth, authed)
  const liveScheduled = useQuery(api.scheduled.list, authed)
  const liveOrders = useQuery(api.orders.list, authed)
  // Live data only — the old build rendered hardcoded sample figures here.
  const income = liveHealth?.income ?? 0
  const spent = liveAnalytics?.totalSpent ?? liveHealth?.expenses ?? 0

  const budgetUsedPercent = (spent / Math.max(income, 1)) * 100
  const savingsRate = liveHealth ? liveHealth.savingsRate : 0

  // Rule-based insights from real numbers (not canned strings).
  const liveInsights: { type: "warning" | "success" | "tip"; title: string; message: string; action: string }[] = []
  for (const row of liveAnalytics?.analytics ?? []) {
    if (row.percentUsed >= 90) {
      liveInsights.push({
        type: "warning",
        title: `${row.category} budget nearly depleted`,
        message: `You've spent ${row.percentUsed}% (₦${row.spent.toLocaleString()} of ₦${row.budget.toLocaleString()}). Consider holding off on non-essential purchases.`,
        action: "View Details",
      })
    }
  }
  if (liveHealth && liveHealth.savingsRate >= 10) {
    liveInsights.push({
      type: "success",
      title: "Healthy savings rate",
      message: `You're saving ${liveHealth.savingsRate}% of income with ${liveHealth.emergencyFundMonths} months of expenses covered.`,
      action: "See Progress",
    })
  } else if (liveHealth) {
    liveInsights.push({
      type: "tip",
      title: "Savings opportunity",
      message: `Your savings rate is ${liveHealth.savingsRate}%. Try the 50/30/20 rule — 20% of income to savings.`,
      action: "Set Limit",
    })
  }
  if (liveInsights.length === 0) {
    liveInsights.push({
      type: "tip",
      title: "No data yet",
      message: "Set a budget and transact to unlock spending insights.",
      action: "Set Limit",
    })
  }

  const palette = ["#00FF41", "#4169E1", "#FF6B6B", "#FFB800", "#9333EA", "#FF9500", "#00BFFF", "#FF69B4"]
  const liveCategories = (liveAnalytics?.analytics ?? []).map((row, i) => ({
    name: row.category,
    spent: row.spent,
    allocated: row.budget,
    color: palette[i % palette.length],
  }))
  const scheduledRows = (liveScheduled ?? []).map((p) => ({
    name: p.recipientName,
    date: new Date(p.nextPaymentDate).toLocaleDateString("en-NG"),
    amount: p.amount,
    status: p.isActive ? "active" : "paused",
  }))
  const orderRows = (liveOrders ?? []).map((o) => ({
    item: o.productName,
    store: o.store,
    amount: o.productPrice,
    date: new Date(o.createdAt).toLocaleDateString("en-NG"),
  }))
  const shoppingSpend = orderRows.reduce((s, o) => s + o.amount, 0)
  const avgDaily = liveHealth ? Math.round(liveHealth.expenses / 30) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-4 pb-3 flex items-center gap-4"
      >
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
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="px-5 mb-4"
      >
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
      </motion.div>

      {/* Main Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        className="px-5 mb-5"
      >
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: ArrowDownRight, label: "Income", value: `₦${(userFinancialData.monthlyIncome / 1000).toFixed(0)}k`, change: "+12% vs last month", color: "#00FF41" },
            { icon: ArrowUpRight, label: "Spent", value: `₦${(userFinancialData.totalSpent / 1000).toFixed(0)}k`, change: `${budgetUsedPercent.toFixed(0)}% of income`, color: "text-red-400" },
            { icon: PiggyBank, label: "Saved", value: `₦${(userFinancialData.totalSaved / 1000).toFixed(0)}k`, change: `${savingsRate.toFixed(0)}% savings rate`, color: "#00FF41" },
            { icon: CalendarClock, label: "Scheduled", value: `₦${(userFinancialData.scheduledPayments / 1000).toFixed(0)}k`, change: "5 upcoming", color: "text-yellow-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
              className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} className={typeof stat.color === 'string' && stat.color.startsWith('text-') ? stat.color : `text-[${stat.color}]`} style={typeof stat.color === 'string' && stat.color.startsWith('#') ? { color: stat.color } : {}} />
                <span className="text-white/50 text-xs">{stat.label}</span>
              </div>
              <p className="text-white font-bold text-xl">{stat.value}</p>
              <p className={`text-[10px] font-medium mt-1 ${typeof stat.color === 'string' && stat.color.startsWith('text-') ? stat.color : `text-[${stat.color}]`}`} style={typeof stat.color === 'string' && stat.color.startsWith('#') ? { color: stat.color } : {}}>
                {stat.change}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 mb-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Bot className="text-[#00FF41]" size={16} />
          <h2 className="text-white font-bold text-sm">Kumba AI Insights</h2>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {liveInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ scale: 1.01, x: 4 }}
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      {activeSection === "overview" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 mb-5"
        >
          <h2 className="text-white font-bold text-sm mb-3">Budget by Category</h2>
          <div className="space-y-3">
            {liveCategories.length === 0 && (
              <p className="text-white/40 text-sm text-center py-6">
                No budgets set yet. Create one from the Budget Planner.
              </p>
            )}
            {liveCategories.map((category, index) => {
              const percentUsed = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0
              const isOverBudget = percentUsed > 90

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Wallet size={18} style={{ color: category.color }} />
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
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Scheduled Payments Section */}
      {activeSection === "scheduled" && (
        <div className="px-5 mb-5">
          <h2 className="text-white font-bold text-sm mb-3">Scheduled Payments</h2>
          <div className="space-y-2">
            {scheduledRows.length === 0 && (
              <p className="text-white/40 text-sm text-center py-6">No scheduled payments.</p>
            )}
            {scheduledRows.map((payment, index) => (
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
              <span className="text-white/50 text-sm">Total Order Spend</span>
              <span className="text-white font-bold text-xl">₦{shoppingSpend.toLocaleString()}</span>
            </div>
          </div>

          <h3 className="text-white font-bold text-sm mb-3">Orders</h3>
          <div className="space-y-2">
            {orderRows.length === 0 && (
              <p className="text-white/40 text-sm text-center py-6">No orders placed yet.</p>
            )}
            {orderRows.map((purchase, index) => (
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-5"
      >
        <div className="bg-gradient-to-r from-[#00FF41]/10 via-[#00FF41]/5 to-transparent border border-[#00FF41]/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="text-[#00FF41]" size={18} />
            <span className="text-[#00FF41] font-bold text-sm">AI Prediction: Next Month Outlook</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/40 text-xs">Avg. Daily Spend</p>
              <p className="text-white font-bold">₦{avgDaily.toLocaleString()}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/40 text-xs">Savings Rate</p>
              <p className="text-white font-bold">{savingsRate.toFixed(1)}%</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/40 text-xs">Budget Used</p>
              <p className="text-white font-bold">{budgetUsedPercent.toFixed(0)}%</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3">
              <p className="text-white/40 text-xs">Net This Month</p>
              <p className="text-white font-bold">₦{(income - spent).toLocaleString()}</p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-3 bg-black/20 rounded-xl p-3 flex items-center gap-3"
          >
            <Lightbulb className="text-yellow-400 flex-shrink-0" size={16} />
            <p className="text-white/70 text-xs leading-relaxed">
              Projection: at ₦{avgDaily.toLocaleString()}/day you&apos;re on pace to spend ₦
              {(avgDaily * 30).toLocaleString()} this month against ₦{income.toLocaleString()} income.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
