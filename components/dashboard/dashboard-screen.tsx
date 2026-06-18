"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Bell, Eye, EyeOff, ArrowDownToLine, Send, Scan as ScanQr, CalendarClock, ShoppingBag, Plus, PiggyBank, Mic, BarChart3, ChevronLeft, ChevronRight, Flame, Target, Wallet, TrendingUp, MessageCircle, Zap, Smartphone, Wifi, LayoutGrid, Image as ImageIcon } from "lucide-react"
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

const insightCards = [
  {
    id: "scheduled",
    icon: CalendarClock,
    title: "Upcoming Payment",
    value: "NGN 150,000",
    subtitle: "Rent due in 5 days",
    color: "#FF6B6B",
    action: "scheduled",
  },
  {
    id: "budget",
    icon: Target,
    title: "Budget Status",
    value: "62%",
    subtitle: "NGN 186,000 of NGN 300,000 used",
    color: "#00FF41",
    action: "budgetAnalytics",
  },
  {
    id: "streak",
    icon: Flame,
    title: "Savings Streak",
    value: "12 Days",
    subtitle: "Keep it up! Best: 18 days",
    color: "#FFB800",
    action: "budgetAnalytics",
  },
  {
    id: "savings",
    icon: PiggyBank,
    title: "Total Savings",
    value: "NGN 245,000",
    subtitle: "+NGN 25,000 this month",
    color: "#00D4FF",
    action: "budgetAnalytics",
  },
  {
    id: "spending",
    icon: TrendingUp,
    title: "Weekly Spending",
    value: "NGN 45,000",
    subtitle: "18% below average",
    color: "#A855F7",
    action: "transactionAnalytics",
  },
]

export default function DashboardScreen({ userId: propUserId }: { userId?: string | null }) {
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
  const userId = propUserId ?? null

  const walletBalance = useQuery(api.wallet.getBalance, userId ? { userId: userId as any } : "skip")
  const recentTransactions = useQuery(api.wallet.getTransactions, userId ? { userId: userId as any, limit: 10 } : "skip")

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
    return <SendMoneyScreen onBack={() => setCurrentScreen("dashboard")} onScanQR={() => setCurrentScreen("scan")} userId={userId} />
  }

  if (currentScreen === "scan") {
    return <QrScannerScreen onBack={() => setCurrentScreen("dashboard")} />
  }

  if (currentScreen === "budget") {
    return <AiBudgetPlannerScreen onBack={() => setCurrentScreen("dashboard")} userId={userId} />
  }

  if (currentScreen === "shop") {
    return <ShopCompareScreen onBack={() => setCurrentScreen("dashboard")} onConfirmOrder={handleOrderConfirm} />
  }

  if (currentScreen === "beneficiaries") {
    return <BeneficiariesScreen onBack={() => setCurrentScreen("dashboard")} />
  }

  if (currentScreen === "fund") {
    return <FundWalletScreen onBack={() => setCurrentScreen("dashboard")} />
  }

  if (currentScreen === "scheduled") {
    return <ScheduledPaymentsScreen onBack={() => setCurrentScreen("dashboard")} userId={userId} />
  }

  if (currentScreen === "settings") {
    return <SettingsScreen onBack={() => setCurrentScreen("dashboard")} onKumbaDefaultChange={setKumbaDefault} kumbaDefault={kumbaDefault} />
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
    return <TransactionHistoryScreen onBack={() => setCurrentScreen("dashboard")} />
  }

  if (currentScreen === "budgetAnalytics") {
    return <BudgetAnalyticsScreen onBack={() => setCurrentScreen("dashboard")} />
  }

  if (currentScreen === "transactionAnalytics") {
    return <TransactionAnalyticsScreen onBack={() => setCurrentScreen("dashboard")} />
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
    return <FinancialStabilityAnalyzerScreen onBack={() => setCurrentScreen("moreFeatures")} userId={userId} />
  }

  if (currentScreen === "seller") {
    return <SellerDashboard onBack={() => setCurrentScreen("dashboard")} userId={userId} />
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

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#00FF41]/20 bg-gradient-to-br from-[#00FF41]/20 to-[#00FF41]/5 flex items-center justify-center">
            <span className="text-[#00FF41] font-bold text-sm">AD</span>
          </div>
          <div>
            <p className="text-white/50 text-[11px] font-medium">Good evening</p>
            <p className="text-white font-semibold text-sm">Ada</p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors relative">
          <Bell className="text-white" size={18} />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00FF41] rounded-full" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="px-5 mb-5">
        <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-[20px] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/50 text-xs font-medium">Total Balance</span>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <h1 className="text-white text-[32px] font-bold mb-5 tracking-tight">
            {balanceVisible ? `NGN ${(walletBalance ?? 842300.5).toLocaleString()}` : "NGN ••••••"}
          </h1>
          <Button
            onClick={() => setCurrentScreen("fund")}
            className="w-full h-11 bg-[#00FF41] hover:bg-[#00FF41]/90 active:bg-[#00FF41]/80 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00FF41]/15 transition-all"
          >
            <Plus size={16} />
            Fund Wallet
          </Button>
        </div>
      </div>

      <div className="px-5 mb-5">
        <div
          className="relative bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-[18px] p-4 overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Carousel content */}
          <button onClick={() => setCurrentScreen(currentInsight.action as ScreenType)} className="w-full text-left">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${currentInsight.color}20` }}
              >
                <currentInsight.icon size={20} style={{ color: currentInsight.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-0.5">
                  {currentInsight.title}
                </p>
                <p className="text-white text-xl font-bold mb-0.5">{currentInsight.value}</p>
                <p className="text-white/60 text-xs">{currentInsight.subtitle}</p>
              </div>
            </div>
          </button>

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
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-base">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => setCurrentScreen("send")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
          >
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
              <Send className="text-[#00FF41]" size={18} />
            </div>
            <span className="text-white/90 text-[10px] font-medium text-center leading-tight">Send</span>
          </button>
          <button
            onClick={() => setCurrentScreen("airtime")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
          >
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
              <Smartphone className="text-[#00FF41]" size={18} />
            </div>
            <span className="text-white/90 text-[10px] font-medium text-center leading-tight">Airtime</span>
          </button>
          <button
            onClick={() => setCurrentScreen("data")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
          >
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
              <Wifi className="text-[#00FF41]" size={18} />
            </div>
            <span className="text-white/90 text-[10px] font-medium text-center leading-tight">Data</span>
          </button>
          <button
            onClick={() => setCurrentScreen("bills")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
          >
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
              <Zap className="text-[#00FF41]" size={18} />
            </div>
            <span className="text-white/90 text-[10px] font-medium text-center leading-tight">Bills</span>
          </button>
          <button
            onClick={() => setCurrentScreen("scan")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
          >
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
              <ImageIcon className="text-[#00FF41]" size={18} />
            </div>
            <span className="text-white/90 text-[10px] font-medium text-center leading-tight">Extract to Pay</span>
          </button>
          <button
            onClick={() => setCurrentScreen("shop")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
          >
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
              <ShoppingBag className="text-[#00FF41]" size={18} />
            </div>
            <span className="text-white/90 text-[10px] font-medium text-center leading-tight">Shop</span>
          </button>
          <button
            onClick={() => setCurrentScreen("beneficiaries")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
          >
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
              <Plus className="text-[#00FF41]" size={18} />
            </div>
            <span className="text-white/90 text-[10px] font-medium text-center leading-tight">Beneficiaries</span>
          </button>
          <button
            onClick={() => setShowMoreFeatures(true)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
          >
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
              <LayoutGrid className="text-[#00FF41]" size={18} />
            </div>
            <span className="text-white/90 text-[10px] font-medium text-center leading-tight">More</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold text-base">Recent Activity</h2>
          <button onClick={() => setCurrentScreen("history")} className="text-[#00FF41] text-xs font-bold">
            View All
          </button>
        </div>
        <div className="space-y-2.5">
          <div className="bg-white/[0.03] border border-white/5 rounded-[16px] p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="text-white/40">
                <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Uber Ride</p>
              <p className="text-white/40 text-[11px]">Today, 8:42 PM</p>
            </div>
            <span className="text-white font-bold text-sm flex-shrink-0">-NGN 2,500</span>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-[16px] p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00FF41]/10 flex items-center justify-center flex-shrink-0">
              <ArrowDownToLine className="text-[#00FF41]" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Jade Adeleye</p>
              <p className="text-white/40 text-[11px]">Yesterday, 6:20 PM</p>
            </div>
            <span className="text-[#00FF41] font-bold text-sm flex-shrink-0">+NGN 50,000</span>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-[16px] p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="text-white/40" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Jumia Order</p>
              <p className="text-white/40 text-[11px]">Yesterday, 2:15 PM</p>
            </div>
            <span className="text-white font-bold text-sm flex-shrink-0">-NGN 18,300</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a1a12]/95 backdrop-blur-xl border-t border-white/5 px-4 py-2 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* Home Tab */}
          <button
            onClick={() => {
              setActiveTab("home")
              setCurrentScreen("dashboard")
            }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-300 ${activeTab === "home" ? "bg-[#00FF41]/10" : ""
              }`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Wallet size={22} className={activeTab === "home" ? "text-[#00FF41]" : "text-white/30"} />
            </div>
            <span
              className={`text-[10px] ${activeTab === "home" ? "text-[#00FF41] font-bold" : "text-white/30 font-medium"}`}
            >
              Home
            </span>
          </button>

          {/* Kumba Chat Tab - goes to chat interface */}
          <button
            onClick={() => {
              setActiveTab("kumba")
              setCurrentScreen("kumbaChat")
            }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-300 ${activeTab === "kumba" ? "bg-[#00FF41]/10" : ""
              }`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <MessageCircle size={22} className={activeTab === "kumba" ? "text-[#00FF41]" : "text-white/30"} />
            </div>
            <span
              className={`text-[10px] ${activeTab === "kumba" ? "text-[#00FF41] font-bold" : "text-white/30 font-medium"}`}
            >
              Kumba
            </span>
          </button>

          {/* Center Mic Button - opens voice modal */}
          <button onClick={() => setShowVoiceModal(true)} className="flex flex-col items-center -mt-6">
            <div className="w-16 h-16 rounded-full bg-[#00FF41] flex items-center justify-center shadow-lg shadow-[#00FF41]/40 active:scale-95 transition-transform border-4 border-[#0a1a12] relative overflow-hidden">
              {/* Animated pulse rings */}
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-30" />
              <Mic className="text-black relative z-10" size={28} strokeWidth={2.5} />
            </div>
          </button>

          {/* Budget Tab - shows budget analytics */}
          <button
            onClick={() => {
              setActiveTab("budget")
              setCurrentScreen("budgetAnalytics")
            }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-300 ${activeTab === "budget" ? "bg-[#00FF41]/10" : ""
              }`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <PiggyBank size={22} className={activeTab === "budget" ? "text-[#00FF41]" : "text-white/30"} />
            </div>
            <span
              className={`text-[10px] ${activeTab === "budget" ? "text-[#00FF41] font-bold" : "text-white/30 font-medium"}`}
            >
              Budget
            </span>
          </button>

          {/* Analytics Tab - shows transaction analytics */}
          <button
            onClick={() => {
              setActiveTab("analytics")
              setCurrentScreen("transactionAnalytics")
            }}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-300 ${activeTab === "analytics" ? "bg-[#00FF41]/10" : ""
              }`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <BarChart3 size={22} className={activeTab === "analytics" ? "text-[#00FF41]" : "text-white/30"} />
            </div>
            <span
              className={`text-[10px] ${activeTab === "analytics" ? "text-[#00FF41] font-bold" : "text-white/30 font-medium"}`}
            >
              Analytics
            </span>
          </button>
        </div>
      </div>

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
