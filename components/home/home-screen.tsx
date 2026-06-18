"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, MessageSquare, Eye, EyeOff, Plus, ArrowUpRight } from "lucide-react"
import WalletHeader from "./wallet-header"
import QuickActions from "./quick-actions"
import TransactionList from "./transaction-list"
import SendMoneyScreen from "../payments/send-money-screen"
import QrScannerScreen from "../payments/qr-scanner-screen"
import VoiceCommandScreen from "../payments/voice-command-screen"
import AiChatScreen from "../ai/ai-chat-screen"
import AnalyticsScreen from "../analytics/analytics-screen"
import ScheduledPaymentsScreen from "../scheduled/scheduled-payments-screen"

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<"wallet" | "analytics" | "chat">("wallet")
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [currentScreen, setCurrentScreen] = useState<"home" | "send" | "qr" | "voice" | "scheduled">("home")

  const handleQuickAction = (action: string) => {
    console.log("[v0] Quick action clicked:", action)
    if (action === "Send Money") setCurrentScreen("send")
    else if (action === "Scan QR") setCurrentScreen("qr")
    else if (action === "AI Command") setCurrentScreen("voice")
    else if (action === "Scheduled Pay") setCurrentScreen("scheduled")
  }

  if (currentScreen === "send") {
    return <SendMoneyScreen onBack={() => setCurrentScreen("home")} onSendComplete={() => setCurrentScreen("home")} />
  }

  if (currentScreen === "qr") {
    return <QrScannerScreen onBack={() => setCurrentScreen("home")} onScanComplete={() => setCurrentScreen("home")} />
  }

  if (currentScreen === "voice") {
    return (
      <VoiceCommandScreen onBack={() => setCurrentScreen("home")} onCommandComplete={() => setCurrentScreen("home")} />
    )
  }

  if (currentScreen === "scheduled") {
    return <ScheduledPaymentsScreen onBack={() => setCurrentScreen("home")} />
  }

  if (activeTab === "analytics") {
    return <AnalyticsScreen />
  }

  if (activeTab === "chat") {
    return <AiChatScreen />
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="scanpay-gradient-mesh">
        <WalletHeader />
      </div>

      <div className="p-5 space-y-6 animate-fade-in">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-accent border-0 shadow-2xl shadow-primary/20 rounded-3xl">
          <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <div className="relative z-10 p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium mb-1">Available Balance</p>
                <h1 className="text-5xl font-bold text-primary-foreground tracking-tight">
                  {balanceVisible ? "₦250,000.00" : "₦••••••"}
                </h1>
              </div>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-white/25 transition-all border border-white/10"
              >
                {balanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
              <Button
                size="lg"
                className="flex-1 h-12 bg-white/20 text-white border border-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all shadow-lg"
              >
                <Plus className="mr-2" size={18} />
                Add Money
              </Button>
              <Button
                size="lg"
                className="flex-1 h-12 bg-white/20 text-white border border-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all shadow-lg"
              >
                <ArrowUpRight className="mr-2" size={18} />
                Withdraw
              </Button>
            </div>
          </div>
        </Card>

        <QuickActions onActionClick={handleQuickAction} />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
            View All
          </Button>
        </div>
        <TransactionList />
      </div>

      <div className="fixed bottom-0 left-0 right-0 scanpay-glassmorphism p-4 safe-area-inset-bottom rounded-t-3xl">
        <div className="flex gap-2 justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex flex-col items-center gap-2 px-8 py-3 rounded-2xl transition-all duration-300 ${
              activeTab === "wallet"
                ? "text-accent font-bold bg-accent/15 shadow-lg shadow-accent/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <Wallet size={24} strokeWidth={activeTab === "wallet" ? 2.5 : 2} />
            <span className="text-xs tracking-wide">Wallet</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex flex-col items-center gap-2 px-8 py-3 rounded-2xl transition-all duration-300 ${
              activeTab === "analytics"
                ? "text-accent font-bold bg-accent/15 shadow-lg shadow-accent/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <TrendingUp size={24} strokeWidth={activeTab === "analytics" ? 2.5 : 2} />
            <span className="text-xs tracking-wide">Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center gap-2 px-8 py-3 rounded-2xl transition-all duration-300 ${
              activeTab === "chat"
                ? "text-accent font-bold bg-accent/15 shadow-lg shadow-accent/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <MessageSquare size={24} strokeWidth={activeTab === "chat" ? 2.5 : 2} />
            <span className="text-xs tracking-wide">AI Chat</span>
          </button>
        </div>
      </div>
    </div>
  )
}
