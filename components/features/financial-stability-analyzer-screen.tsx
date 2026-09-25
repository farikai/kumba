"use client"
import { motion } from "framer-motion"
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Zap, Target } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useSession } from "@/components/session-provider"

interface FinancialStabilityAnalyzerScreenProps {
  onBack: () => void
  userId: Id<"users">
}

export default function FinancialStabilityAnalyzerScreen({ onBack, userId }: FinancialStabilityAnalyzerScreenProps) {
  const { session } = useSession()
  const health = useQuery(
    api.analytics.getFinancialHealth,
    session ? { userId, sessionToken: session.sessionToken } : "skip"
  )

  if (!health) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-card to-background text-foreground flex items-center justify-center"
      >
        <p className="text-muted-foreground text-sm">Loading financial analysis...</p>
      </motion.div>
    )
  }

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "#00FF41", bg: "#00FF41/10" }
    if (score >= 60) return { label: "Good", color: "#FFB800", bg: "#FFB800/10" }
    if (score >= 40) return { label: "Fair", color: "#FF9500", bg: "#FF9500/10" }
    return { label: "Needs Improvement", color: "#FF6B6B", bg: "#FF6B6B/10" }
  }

  const status = getHealthStatus(health.score)

  const insights = []
  if (health.savingsRate >= 15) {
    insights.push({ icon: CheckCircle, title: "Strong Savings Habit", description: `You're saving ${health.savingsRate}% of your income monthly. Great!`, positive: true })
  } else if (health.savingsRate >= 5) {
    insights.push({ icon: TrendingUp, title: "Building Savings", description: `Saving ${health.savingsRate}% — try to reach 15-20% for optimal growth.`, positive: true })
  } else {
    insights.push({ icon: AlertCircle, title: "Low Savings Rate", description: `${health.savingsRate}% savings rate — aim for at least 15% of income.`, positive: false })
  }

  if (health.emergencyFundMonths >= 6) {
    insights.push({ icon: CheckCircle, title: "Strong Emergency Fund", description: `${health.emergencyFundMonths} months covered — you're well protected!`, positive: true })
  } else if (health.emergencyFundMonths >= 3) {
    insights.push({ icon: CheckCircle, title: "Adequate Emergency Fund", description: `${health.emergencyFundMonths} months covered. 6 months is the ideal target.`, positive: true })
  } else {
    insights.push({ icon: AlertCircle, title: "Emergency Fund Alert", description: `${health.emergencyFundMonths} months covered. Target 6 months for full security.`, positive: false })
  }

  if (health.spendingGrowth <= 0) {
    insights.push({ icon: TrendingDown, title: "Spending Decreasing", description: `Spending down ${Math.abs(health.spendingGrowth)}% — great control!`, positive: true })
  } else if (health.spendingGrowth <= 10) {
    insights.push({ icon: TrendingUp, title: "Spending Growth", description: `Spending up ${health.spendingGrowth}% — within a healthy range.`, positive: true })
  } else {
    insights.push({ icon: AlertCircle, title: "Spending Spike", description: `Spending up ${health.spendingGrowth}% — review your expenses.`, positive: false })
  }

  if (health.income > health.expenses) {
    insights.push({ icon: CheckCircle, title: "Positive Cash Flow", description: `Income exceeds expenses by ₦${(health.income - health.expenses).toLocaleString()} — sustainable!`, positive: true })
  } else {
    insights.push({ icon: AlertCircle, title: "Negative Cash Flow", description: `Expenses exceed income by ₦${(health.expenses - health.income).toLocaleString()} — review spending.`, positive: false })
  }

  const recommendations: { title: string; description: string }[] = []
  if (health.emergencyFundMonths < 6) {
    const target = Math.max(6 * health.expenses - health.balance, 0)
    recommendations.push({ title: "Boost Emergency Fund", description: `Save ₦${target.toLocaleString()} to reach your 6-month goal.` })
  }
  if (health.savingsRate < 15) {
    recommendations.push({ title: "Increase Savings Rate", description: `Try to save 15-20% of your ₦${health.income.toLocaleString()} monthly income.` })
  }
  if (health.spendingGrowth > 10) {
    recommendations.push({ title: "Review Spending", description: `Your spending grew ${health.spendingGrowth}% — look for areas to cut back.` })
  }
  if (recommendations.length === 0) {
    recommendations.push({ title: "Keep It Up!", description: "Your finances look great. Consider investing or increasing savings." })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-card to-background text-foreground pb-32">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/40 px-5 py-4"
      >
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-card rounded-lg transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-xl">Financial Stability</h1>
            <p className="text-xs text-muted-foreground">AI-powered analysis from your data</p>
          </div>
        </div>
      </motion.div>

      <div className="px-5 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="border rounded-2xl p-6 space-y-4" style={{ background: status.bg, borderColor: status.color }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Financial Health Score</p>
              <p className="text-4xl font-bold" style={{ color: status.color }}>{health.score}/100</p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: status.color + "20", borderWidth: "3px", borderColor: status.color }}
            >
              <span className="text-2xl font-bold" style={{ color: status.color }}>{health.score}%</span>
            </motion.div>
          </div>
          <p className="text-sm font-semibold" style={{ color: status.color }}>{status.label} Financial Position</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { label: "Savings Rate", value: `${health.savingsRate}%`, icon: Target },
            { label: "Emergency Fund", value: `${health.emergencyFundMonths}mo`, icon: AlertCircle },
            { label: "Balance", value: `₦${health.balance.toLocaleString()}`, icon: TrendingUp },
            { label: "Spending Trend", value: `${health.spendingGrowth >= 0 ? "+" : ""}${health.spendingGrowth}%`, icon: Zap },
          ].map((metric, i) => {
            const Icon = metric.icon
            const isPositive = i === 3 ? health.spendingGrowth <= 0 : true
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className="bg-card border border-border/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <Icon size={16} className={isPositive ? "text-[#00FF41]" : "text-red-500"} />
                </div>
                <p className="font-bold text-lg">{metric.value}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <h3 className="font-bold text-sm">Kumba AI Insights</h3>
          {insights.map((insight, i) => {
            const Icon = insight.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ x: 4 }}
                className={`p-4 rounded-xl border ${insight.positive ? "border-[#00FF41]/30 bg-[#00FF41]/5" : "border-[#FFB800]/30 bg-[#FFB800]/5"}`}
              >
                <div className="flex gap-3">
                  <Icon size={20} className={insight.positive ? "text-[#00FF41]" : "text-[#FFB800]"} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border/50 rounded-2xl p-5 space-y-4"
        >
          <h3 className="font-bold text-sm">Next Steps</h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                className="w-full p-3 text-left border border-border/50 rounded-lg hover:border-[#00FF41]/50 transition text-sm"
              >
                <p className="font-semibold">{rec.title}</p>
                <p className="text-xs text-muted-foreground">{rec.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
