"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useSession } from "@/components/session-provider"
import { Bell, Eye, EyeOff, ArrowDownToLine, Send, CalendarClock, ShoppingBag, Plus, PiggyBank, Mic, BarChart3, ChevronLeft, ChevronRight, Target, Wallet, TrendingUp, MessageCircle, Zap, Smartphone, Wifi, LayoutGrid, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import SendMoneyScreen from "@/components/payments/send-money-screen"
import QrScannerScreen from "@/components/payments/qr-scanner-screen"
import AiBudgetPlannerScreen from "@/components/features/ai-budget-planner-screen"
import ShopCompareScreen from "@/components/features/shop-compare-screen"
import BeneficiariesScreen from "@/components/features/beneficiaries-screen"
import FundWalletScreen from "@/components/features/fund-wallet-screen"
import ScheduledPaymentsScreen from "@/components/scheduled/scheduled-payments-screen"
import SettingsScreen from "@/components/features/settings-screen"
import OrderConfirmationScreen from "@/components/features/order-confirmation-screen"
import TransactionHistoryScreen from "@/components/features/transaction-history-screen"
import BudgetAnalyticsScreen from "@/components/analytics/budget-analytics-screen"
import TransactionAnalyticsScreen from "@/components/analytics/transaction-analytics-screen"
import KumbaVoiceModal from "@/components/features/kumba-voice-modal"
import KumbaChatScreen from "@/components/features/kumba-chat-screen"
import BillsPaymentScreen from "../bills/bills-payment-screen"
import AirtimePurchaseScreen from "../bills/airtime-purchase-screen"
import DataPurchaseScreen from "../bills/data-purchase-screen"
import ElectricityPaymentScreen from "../bills/electricity-payment-screen"
import TvSubscriptionScreen from "../bills/tv-subscription-screen"
import NotificationManager from "@/components/scheduled/notification-manager"
import AiTaxCalculatorScreen from "@/components/features/ai-tax-calculator-screen"
import FinancialStabilityAnalyzerScreen from "@/components/features/financial-stability-analyzer-screen"
import ManualBudgetCreatorScreen from "@/components/features/manual-budget-creator-screen"
import MoreFeaturesScreen from "@/components/features/more-features-screen"
import SellerDashboard from "@/components/features/seller-dashboard"
import { MoreFeaturesBottomSheet } from "@/components/features/more-features-bottom-sheet"

type ScreenType =
  | "dashboard"
  | "send"
  | "scan"
  | "budget"
  | "shop"
  | "beneficiaries"
  | "fund"
  | "scheduled"
  | "settings"
  | "orderConfirm"
  | "history"
  | "budgetAnalytics"
  | "transactionAnalytics"
  | "kumbaChat"
  | "bills"
  | "airtime"
  | "data"
  | "electricity"
  | "tv"
  | "taxCalculator"
  | "financialAnalyzer"
  | "budgetCreator"
  | "moreFeatures"
  | "seller"

export default function DashboardScreen({ userId: propUserId, onLogout }: { userId?: string | null; onLogout?: () => void }) {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [kumbaDefault, setKumbaDefault] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("dashboard")
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [showMoreFeatures, setShowMoreFeatures] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedBillService, setSelectedBillService] = useState<string>("")
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("home")
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0)

  // Use provided userId or fallback to seeded demo user
  const { session } = useSession()
  const userId = (session?.userId ?? propUserId ?? null) as Id<"users"> | null
  const sessionToken = session?.sessionToken ?? null
  const authed = userId && sessionToken ? { userId, sessionToken } : "skip"

  const walletBalance = useQuery(api.wallet.getBalance, authed)
  const recentTransactions = useQuery(api.wallet.getTransactions, authed === "skip" ? "skip" : { ...authed, limit: 10 })
  const scheduledPayments = useQuery(api.scheduled.list, authed)
  const budgetAnalytics = useQuery(api.budgets.getBudgetAnalytics, authed)

  const activeScheduled = (scheduledPayments ?? []).filter((p) => p.isActive)
  const totalUpcoming = activeScheduled.reduce((sum, p) => sum + p.amount, 0)
  const nextDue = [...activeScheduled].sort((a, b) => a.nextPaymentDate - b.nextPaymentDate)[0] ?? null
  const budgetUsedPct = budgetAnalytics && budgetAnalytics.totalBudget > 0
    ? Math.round((budgetAnalytics.totalSpent / budgetAnalytics.totalBudget) * 100)
    : null

  const insightCards = [
    {
      id: "scheduled",
      icon: CalendarClock,
      title: "Upcoming Payment",
      value: nextDue ? `NGN ${nextDue.amount.toLocaleString()}` : "None scheduled",
      subtitle: nextDue ? `${nextDue.recipientName} • ${new Date(nextDue.nextPaymentDate).toLocaleDateString("en-NG")}` : "No active scheduled payments",
      color: "#FF6B6B",
      action: "scheduled",
    },
    {
      id: "budget",
      icon: Target,
      title: "Budget Status",
      value: budgetUsedPct !== null ? `${budgetUsedPct}%` : "No budget",
      subtitle: budgetAnalytics
        ? `NGN ${budgetAnalytics.totalSpent.toLocaleString()} of NGN ${budgetAnalytics.totalBudget.toLocaleString()} used`
        : "Set a budget to track spending",
      color: "#00FF41",
      action: "budgetAnalytics",
    },
    {
      id: "upcoming-total",
      icon: PiggyBank,
      title: "Scheduled Total",
      value: `NGN ${totalUpcoming.toLocaleString()}`,
      subtitle: `${activeScheduled.length} active payment${activeScheduled.length === 1 ? "" : "s"}`,
      color: "#00D4FF",
      action: "scheduled",
    },
    {
      id: "spending",
      icon: TrendingUp,
      title: "Recent Activity",
      value: `${(recentTransactions ?? []).length} txns`,
      subtitle: "Latest wallet movements below",
      color: "#A855F7",
      action: "history",
    },
  ]

  useEffect(() => {
    if (kumbaDefault && currentScreen === "dashboard") {
      setCurrentScreen("kumbaChat")
    }
  }, [kumbaDefault])

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % insightCards.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const handleOrderConfirm = (product: any) => {
    setSelectedProduct(product)
    setCurrentScreen("orderConfirm")
  }

  const handleVoiceNavigate = (screen: string) => {
    setShowVoiceModal(false)
    switch (screen) {
      case "send":
        setCurrentScreen("send")
        break
      case "scheduled":
        setCurrentScreen("scheduled")
        break
      case "shop":
        setCurrentScreen("shop")
        break
      case "budget":
        setCurrentScreen("budget")
        break
      case "budgetAnalytics":
        setCurrentScreen("budgetAnalytics")
        break
      case "transactionAnalytics":
        setCurrentScreen("transactionAnalytics")
        break
      case "history":
        setCurrentScreen("history")
        break
      case "fund":
        setCurrentScreen("fund")
        break
      case "bills":
        setCurrentScreen("bills")
        break
      case "airtime":
        setCurrentScreen("airtime")
        break
      case "data":
        setCurrentScreen("data")
        break
      case "electricity":
        setCurrentScreen("electricity")
        break
      case "tv":
        setCurrentScreen("tv")
        break
    }
  }

  if (currentScreen === "send") {
    return <SendMoneyScreen onBack={() => setCurrentScreen("dashboard")} onScanQR={() => setCurrentScreen("scan")} userId={userId as any} />
  }

  if (currentScreen === "scan") {
    return <QrScannerScreen onBack={() => setCurrentScreen("dashboard")} />
  }

  if (currentScreen === "budget") {
    return <AiBudgetPlannerScreen onBack={() => setCurrentScreen("dashboard")} userId={userId as any} />
  }

  if (currentScreen === "shop") {
    return <ShopCompareScreen onBack={() => setCurrentScreen("dashboard")} onConfirmOrder={handleOrderConfirm} />
  }

  if (currentScreen === "beneficiaries") {
    return <BeneficiariesScreen onBack={() => setCurrentScreen("dashboard")} userId={userId as any} />
  }

  if (currentScreen === "fund") {
    return <FundWalletScreen onBack={() => setCurrentScreen("dashboard")} userId={userId as any} />
  }

  if (currentScreen === "scheduled") {
    return <ScheduledPaymentsScreen onBack={() => setCurrentScreen("dashboard")} userId={userId as any} />
  }

  if (currentScreen === "settings") {
    return <SettingsScreen onBack={() => setCurrentScreen("dashboard")} onLogout={onLogout} onKumbaDefaultChange={setKumbaDefault} kumbaDefault={kumbaDefault} />
  }

  if (currentScreen === "orderConfirm" && selectedProduct) {
    return (
      <OrderConfirmationScreen
        product={selectedProduct}
        onBack={() => setCurrentScreen("shop")}
        onComplete={() => setCurrentScreen("dashboard")}
      />
    )
  }

  if (currentScreen === "history") {
    return <TransactionHistoryScreen onBack={() => setCurrentScreen("dashboard")} userId={userId as any} />
  }

  if (currentScreen === "budgetAnalytics") {
    return <BudgetAnalyticsScreen onBack={() => setCurrentScreen("dashboard")} userId={userId as any} />
  }

  if (currentScreen === "transactionAnalytics") {
    return <TransactionAnalyticsScreen onBack={() => setCurrentScreen("dashboard")} userId={userId as any} />
  }

  if (currentScreen === "kumbaChat") {
    return <KumbaChatScreen onBack={() => setCurrentScreen("dashboard")} onNavigate={handleVoiceNavigate} userId={userId} />
  }

  if (currentScreen === "bills") {
    return (
      <BillsPaymentScreen
        onBack={() => setCurrentScreen("dashboard")}
        onSelectService={(service) => {
          setSelectedBillService(service)
          setCurrentScreen(service as ScreenType)
        }}
      />
    )
  }

  if (currentScreen === "airtime") {
    return (
      <AirtimePurchaseScreen
        onBack={() => setCurrentScreen("bills")}
        onComplete={() => setCurrentScreen("dashboard")}
      />
    )
  }

  if (currentScreen === "data") {
    return (
      <DataPurchaseScreen onBack={() => setCurrentScreen("bills")} onComplete={() => setCurrentScreen("dashboard")} />
    )
  }

  if (currentScreen === "electricity") {
    return (
      <ElectricityPaymentScreen
        onBack={() => setCurrentScreen("bills")}
        onComplete={() => setCurrentScreen("dashboard")}
      />
    )
  }

  if (currentScreen === "tv") {
    return (
      <TvSubscriptionScreen onBack={() => setCurrentScreen("bills")} onComplete={() => setCurrentScreen("dashboard")} />
    )
  }

  if (currentScreen === "taxCalculator") {
    return <AiTaxCalculatorScreen onBack={() => setCurrentScreen("moreFeatures")} />
  }

  if (currentScreen === "financialAnalyzer") {
    return <FinancialStabilityAnalyzerScreen onBack={() => setCurrentScreen("moreFeatures")} userId={userId as any} />
  }

  if (currentScreen === "seller") {
    return <SellerDashboard onBack={() => setCurrentScreen("dashboard")} userId={userId as any} />
  }

  if (currentScreen === "budgetCreator") {
    return <ManualBudgetCreatorScreen onBack={() => setCurrentScreen("moreFeatures")} />
  }

  if (currentScreen === "moreFeatures") {
    return (
      <MoreFeaturesScreen
        onBack={() => setCurrentScreen("dashboard")}
        onSelectFeature={(feature) => {
          if (feature === "taxCalculator") setCurrentScreen("taxCalculator")
          else if (feature === "financialAnalyzer") setCurrentScreen("financialAnalyzer")
          else if (feature === "budgetCreator") setCurrentScreen("budgetCreator")
          else if (feature === "scheduled") setCurrentScreen("scheduled")
          else if (feature === "seller") setCurrentScreen("seller")
        }}
      />
    )
  }

  const currentInsight = insightCards[currentInsightIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2F1F] via-[#0A2F1F] to-[#051810] pb-24">
      <NotificationManager />

      {/* Voice Modal */}
      <KumbaVoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onNavigate={handleVoiceNavigate}
        userId={userId}
      />

      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FF41]/3 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-5 pt-4 pb-3 flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#00FF41]/20 bg-gradient-to-br from-[#00FF41]/20 to-[#00FF41]/5 flex items-center justify-center"
          >
            <span className="text-[#00FF41] font-bold text-sm">AD</span>
          </motion.div>
          <div>
            <p className="text-white/50 text-[11px] font-medium">
              {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}
            </p>
            <p className="text-white font-semibold text-sm">{session?.name ?? "Welcome"}</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
        >
          <Bell className="text-white" size={18} />
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00FF41] rounded-full"
          />
        </motion.button>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="px-5 mb-5 relative z-10"
      >
        <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-[20px] p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF41]/5 blur-[60px] rounded-full" />
          <div className="flex items-center justify-between mb-1 relative">
            <span className="text-white/50 text-xs font-medium">Total Balance</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </motion.button>
          </div>
          <motion.h1
            key={balanceVisible ? 'visible' : 'hidden'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-[32px] font-bold mb-5 tracking-tight relative"
          >
            {balanceVisible ? `NGN ${(walletBalance ?? 0).toLocaleString()}` : "NGN ••••••"}
          </motion.h1>
          <motion.div whileTap={{ scale: 0.98 }} className="relative">
            <Button
              onClick={() => setCurrentScreen("fund")}
              className="w-full h-11 bg-[#00FF41] hover:bg-[#00FF41]/90 active:bg-[#00FF41]/80 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00FF41]/15 transition-all"
            >
              <Plus size={16} />
              Fund Wallet
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Insight Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="px-5 mb-5 relative z-10"
      >
        <div
          className="relative bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-[18px] p-4 overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <AnimatePresence mode="wait">
            <motion.button
              key={currentInsightIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onClick={() => setCurrentScreen(currentInsight.action as ScreenType)}
              className="w-full text-left"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${currentInsight.color}20` }}
                >
                  <currentInsight.icon size={20} style={{ color: currentInsight.color }} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-0.5">
                    {currentInsight.title}
                  </p>
                  <p className="text-white text-xl font-bold mb-0.5">{currentInsight.value}</p>
                  <p className="text-white/60 text-xs">{currentInsight.subtitle}</p>
                </div>
              </div>
            </motion.button>
          </AnimatePresence>

          {/* Navigation arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentInsightIndex((prev) => (prev - 1 + insightCards.length) % insightCards.length)
              }}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={14} className="text-white/60" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentInsightIndex((prev) => (prev + 1) % insightCards.length)
              }}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={14} className="text-white/60" />
            </button>
          </div>

          {/* Carousel indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {insightCards.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentInsightIndex(idx)
                }}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentInsightIndex ? "w-4 bg-[#00FF41]" : "w-1 bg-white/20 hover:bg-white/40"
                  }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="px-5 mb-5 relative z-10"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-base">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Send, label: "Send", screen: "send" },
            { icon: Smartphone, label: "Airtime", screen: "airtime" },
            { icon: Wifi, label: "Data", screen: "data" },
            { icon: Zap, label: "Bills", screen: "bills" },
            { icon: ImageIcon, label: "Extract to Pay", screen: "scan" },
            { icon: ShoppingBag, label: "Shop", screen: "shop" },
            { icon: Plus, label: "Beneficiaries", screen: "beneficiaries" },
            { icon: LayoutGrid, label: "More", screen: "more" },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => action.screen === "more" ? setShowMoreFeatures(true) : setCurrentScreen(action.screen as ScreenType)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
            >
              <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
                <action.icon className="text-[#00FF41]" size={18} />
              </div>
              <span className="text-white/90 text-[10px] font-medium text-center leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="px-5 relative z-10"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-base">Recent Activity</h2>
          <button onClick={() => setCurrentScreen("history")} className="text-[#00FF41] text-xs font-bold">
            View All
          </button>
        </div>
        <div className="space-y-2.5">
          {(recentTransactions ?? []).length === 0 && (
            <p className="text-white/40 text-sm text-center py-6">
              No transactions yet. Fund your wallet (demo top-up) to get started.
            </p>
          )}
          {(recentTransactions ?? []).slice(0, 3).map((tx) => {
            const isCredit = tx.type === "credit"
            return (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/[0.03] border border-white/5 rounded-[16px] p-3.5 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-[#00FF41]/10' : 'bg-white/5'}`}>
                  {isCredit ? (
                    <ArrowDownToLine className="text-[#00FF41]" size={16} />
                  ) : (
                    <ShoppingBag className="text-white/40" size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{tx.description}</p>
                  <p className="text-white/40 text-[11px]">
                    {new Date(tx.createdAt).toLocaleString("en-NG")} • {tx.status}
                  </p>
                </div>
                <span className={`font-bold text-sm flex-shrink-0 ${isCredit ? 'text-[#00FF41]' : 'text-white'}`}>
                  {isCredit ? "+" : "-"}NGN {tx.amount.toLocaleString()}
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-[#0a1a12]/95 backdrop-blur-xl border-t border-white/5 px-4 py-2 shadow-2xl z-20"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* Home Tab */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setActiveTab("home"); setCurrentScreen("dashboard") }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-300 ${activeTab === "home" ? "bg-[#00FF41]/10" : ""}`}
          >
            <Wallet size={22} className={activeTab === "home" ? "text-[#00FF41]" : "text-white/30"} />
            <span className={`text-[10px] ${activeTab === "home" ? "text-[#00FF41] font-bold" : "text-white/30 font-medium"}`}>
              Home
            </span>
          </motion.button>

          {/* Kumba Chat Tab */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setActiveTab("kumba"); setCurrentScreen("kumbaChat") }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-300 ${activeTab === "kumba" ? "bg-[#00FF41]/10" : ""}`}
          >
            <MessageCircle size={22} className={activeTab === "kumba" ? "text-[#00FF41]" : "text-white/30"} />
            <span className={`text-[10px] ${activeTab === "kumba" ? "text-[#00FF41] font-bold" : "text-white/30 font-medium"}`}>
              Kumba
            </span>
          </motion.button>

          {/* Center Mic Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowVoiceModal(true)}
            className="flex flex-col items-center -mt-6"
          >
            <div className="w-16 h-16 rounded-full bg-[#00FF41] flex items-center justify-center shadow-lg shadow-[#00FF41]/40 active:scale-95 transition-transform border-4 border-[#0a1a12] relative overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-white/20"
              />
              <Mic className="text-black relative z-10" size={28} strokeWidth={2.5} />
            </div>
          </motion.button>

          {/* Budget Tab */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setActiveTab("budget"); setCurrentScreen("budgetAnalytics") }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-300 ${activeTab === "budget" ? "bg-[#00FF41]/10" : ""}`}
          >
            <PiggyBank size={22} className={activeTab === "budget" ? "text-[#00FF41]" : "text-white/30"} />
            <span className={`text-[10px] ${activeTab === "budget" ? "text-[#00FF41] font-bold" : "text-white/30 font-medium"}`}>
              Budget
            </span>
          </motion.button>

          {/* Analytics Tab */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setActiveTab("analytics"); setCurrentScreen("transactionAnalytics") }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-300 ${activeTab === "analytics" ? "bg-[#00FF41]/10" : ""}`}
          >
            <BarChart3 size={22} className={activeTab === "analytics" ? "text-[#00FF41]" : "text-white/30"} />
            <span className={`text-[10px] ${activeTab === "analytics" ? "text-[#00FF41] font-bold" : "text-white/30 font-medium"}`}>
              Analytics
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* More Features Bottom Sheet */}
      <MoreFeaturesBottomSheet
        isOpen={showMoreFeatures}
        onClose={() => setShowMoreFeatures(false)}
        onSelectFeature={(feature) => {
          if (feature === "taxCalculator") setCurrentScreen("taxCalculator")
          else if (feature === "financialAnalyzer") setCurrentScreen("financialAnalyzer")
          else if (feature === "budgetCreator") setCurrentScreen("budgetCreator")
          else if (feature === "scheduled") setCurrentScreen("scheduled")
          else if (feature === "beneficiaries") setCurrentScreen("beneficiaries")
          else if (feature === "shop") setCurrentScreen("shop")
          else if (feature === "seller") setCurrentScreen("seller")
        }}
      />
    </div >
  )
}
