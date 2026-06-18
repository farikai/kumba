"use client"

import { useState } from "react"
import { ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Filter, Download, Bot } from "lucide-react"

interface TransactionAnalyticsScreenProps {
  onBack: () => void
}

// Comprehensive transaction analytics data
const analyticsData = {
  summary: {
    totalInflow: 1250000,
    totalOutflow: 820000,
    netFlow: 430000,
    transactionCount: 156,
  },

  monthlyFlow: [
    { month: "Jan", inflow: 580000, outflow: 420000 },
    { month: "Feb", inflow: 620000, outflow: 480000 },
    { month: "Mar", inflow: 750000, outflow: 520000 },
    { month: "Apr", inflow: 650000, outflow: 420000 },
  ],

  topRecipients: [
    { name: "Jumia Nigeria", amount: 125000, count: 8, type: "shopping" },
    { name: "MTN Nigeria", amount: 45000, count: 12, type: "bills" },
    { name: "Mom", amount: 100000, count: 4, type: "transfer" },
    { name: "Uber", amount: 38500, count: 23, type: "transport" },
    { name: "Netflix", amount: 13500, count: 3, type: "subscription" },
  ],

  topSenders: [
    { name: "Salary - TechCorp", amount: 650000, count: 1, type: "salary" },
    { name: "Freelance Work", amount: 180000, count: 3, type: "income" },
    { name: "David Adeyemi", amount: 75000, count: 2, type: "transfer" },
    { name: "Refund - Amazon", amount: 25000, count: 1, type: "refund" },
  ],

  categories: [
    { name: "Shopping", amount: 185000, percentage: 23, trend: "up", trendValue: 12 },
    { name: "Bills & Utilities", amount: 142000, percentage: 17, trend: "down", trendValue: 5 },
    { name: "Transfers", amount: 250000, percentage: 30, trend: "up", trendValue: 8 },
    { name: "Transport", amount: 78000, percentage: 10, trend: "down", trendValue: 15 },
    { name: "Food & Dining", amount: 95000, percentage: 12, trend: "up", trendValue: 3 },
    { name: "Entertainment", amount: 70000, percentage: 8, trend: "same", trendValue: 0 },
  ],

  aiInsights: [
    "Your spending on shopping increased by 12% this month. Consider setting a stricter budget.",
    "You've saved 15% more than last month. Great job on reducing transport costs!",
    "Your subscription payments are consistent. No unusual charges detected.",
  ],
}

export default function TransactionAnalyticsScreen({ onBack }: TransactionAnalyticsScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "quarter" | "year">("month")
  const [activeTab, setActiveTab] = useState<"overview" | "inflow" | "outflow">("overview")

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
          <h1 className="text-white font-bold text-lg">Transaction Analytics</h1>
          <p className="text-white/40 text-xs">Complete financial overview</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <Download className="text-white/60" size={18} />
        </button>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <Filter className="text-white/60" size={18} />
        </button>
      </div>

      {/* Period Selector */}
      <div className="px-5 mb-4">
        <div className="flex gap-1 bg-white/5 rounded-2xl p-1">
          {(["week", "month", "quarter", "year"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedPeriod === period ? "bg-[#00FF41] text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-5 mb-5">
        <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight className="text-[#00FF41]" size={16} />
                <span className="text-white/50 text-xs">Total Inflow</span>
              </div>
              <p className="text-[#00FF41] font-bold text-xl">
                ₦{(analyticsData.summary.totalInflow / 1000).toFixed(0)}k
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="text-red-400" size={16} />
                <span className="text-white/50 text-xs">Total Outflow</span>
              </div>
              <p className="text-red-400 font-bold text-xl">
                ₦{(analyticsData.summary.totalOutflow / 1000).toFixed(0)}k
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <div>
              <span className="text-white/50 text-xs">Net Flow</span>
              <p className="text-white font-bold text-lg">₦{analyticsData.summary.netFlow.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-white/50 text-xs">Transactions</span>
              <p className="text-white font-bold text-lg">{analyticsData.summary.transactionCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Chart Visual */}
      <div className="px-5 mb-5">
        <h2 className="text-white font-bold text-sm mb-3">Monthly Cash Flow</h2>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex items-end justify-between h-32 gap-2">
            {analyticsData.monthlyFlow.map((month, index) => {
              const maxValue = Math.max(...analyticsData.monthlyFlow.map((m) => Math.max(m.inflow, m.outflow)))
              const inflowHeight = (month.inflow / maxValue) * 100
              const outflowHeight = (month.outflow / maxValue) * 100

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1 h-24">
                    <div
                      className="w-3 bg-[#00FF41] rounded-t transition-all duration-500"
                      style={{ height: `${inflowHeight}%` }}
                    />
                    <div
                      className="w-3 bg-red-400 rounded-t transition-all duration-500"
                      style={{ height: `${outflowHeight}%` }}
                    />
                  </div>
                  <span className="text-white/40 text-[10px]">{month.month}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00FF41] rounded" />
              <span className="text-white/50 text-xs">Inflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded" />
              <span className="text-white/50 text-xs">Outflow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          {[
            { id: "overview", label: "Categories" },
            { id: "inflow", label: "Top Senders" },
            { id: "outflow", label: "Top Recipients" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30"
                  : "bg-white/5 text-white/50 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      {activeTab === "overview" && (
        <div className="px-5 mb-5">
          <div className="space-y-2">
            {analyticsData.categories.map((category, index) => (
              <div key={index} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{category.name}</p>
                    <p className="text-white/40 text-xs">{category.percentage}% of spending</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">₦{category.amount.toLocaleString()}</p>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        category.trend === "up"
                          ? "text-red-400"
                          : category.trend === "down"
                            ? "text-[#00FF41]"
                            : "text-white/40"
                      }`}
                    >
                      {category.trend === "up" && <TrendingUp size={12} />}
                      {category.trend === "down" && <TrendingDown size={12} />}
                      {category.trendValue > 0 && `${category.trendValue}%`}
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00FF41] rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Senders Section */}
      {activeTab === "inflow" && (
        <div className="px-5 mb-5">
          <div className="space-y-2">
            {analyticsData.topSenders.map((sender, index) => (
              <div
                key={index}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00FF41]/20 flex items-center justify-center">
                    <ArrowDownRight className="text-[#00FF41]" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{sender.name}</p>
                    <p className="text-white/40 text-xs">
                      {sender.count} transaction{sender.count > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <p className="text-[#00FF41] font-bold text-sm">+₦{sender.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Recipients Section */}
      {activeTab === "outflow" && (
        <div className="px-5 mb-5">
          <div className="space-y-2">
            {analyticsData.topRecipients.map((recipient, index) => (
              <div
                key={index}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-400/20 flex items-center justify-center">
                    <ArrowUpRight className="text-red-400" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{recipient.name}</p>
                    <p className="text-white/40 text-xs">
                      {recipient.count} transaction{recipient.count > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <p className="text-red-400 font-bold text-sm">-₦{recipient.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="px-5">
        <div className="bg-gradient-to-r from-[#00FF41]/10 via-[#00FF41]/5 to-transparent border border-[#00FF41]/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="text-[#00FF41]" size={18} />
            <span className="text-[#00FF41] font-bold text-sm">Kumba AI Analysis</span>
          </div>
          <div className="space-y-2">
            {analyticsData.aiInsights.map((insight, index) => (
              <p key={index} className="text-white/70 text-xs leading-relaxed flex items-start gap-2">
                <span className="text-[#00FF41]">•</span>
                {insight}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
