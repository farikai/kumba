"use client"

import { useState } from "react"
import { ArrowLeft, Search, ArrowDownToLine, ArrowUpFromLine, ShoppingBag, Filter } from "lucide-react"

interface TransactionHistoryScreenProps {
  onBack: () => void
}

export default function TransactionHistoryScreen({ onBack }: TransactionHistoryScreenProps) {
  const [filterTab, setFilterTab] = useState<"all" | "sent" | "received">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const transactions = [
    {
      id: 1,
      type: "received",
      title: "Jade Adeleye",
      description: "Bank Transfer • Korapay",
      amount: 50000,
      date: "Yesterday, 6:20 PM",
      icon: "received",
    },
    {
      id: 2,
      type: "sent",
      title: "Jumia Order",
      description: "Online Shopping",
      amount: -18300,
      date: "Yesterday, 2:15 PM",
      icon: "shopping",
    },
    {
      id: 3,
      type: "sent",
      title: "Uber Ride",
      description: "Transportation",
      amount: -2500,
      date: "Today, 8:42 PM",
      icon: "sent",
    },
    {
      id: 4,
      type: "received",
      title: "David Okonkwo",
      description: "Bank Transfer",
      amount: 15000,
      date: "2 days ago, 4:30 PM",
      icon: "received",
    },
    {
      id: 5,
      type: "sent",
      title: "Netflix Premium",
      description: "Subscription",
      amount: -6500,
      date: "3 days ago, 9:00 AM",
      icon: "sent",
    },
    {
      id: 6,
      type: "sent",
      title: "Weekly Data Plan",
      description: "Airtel • Data Bundle",
      amount: -5000,
      date: "4 days ago, 11:20 AM",
      icon: "sent",
    },
    {
      id: 7,
      type: "received",
      title: "Salary Payment",
      description: "Korapay Technologies",
      amount: 450000,
      date: "5 days ago, 12:00 PM",
      icon: "received",
    },
    {
      id: 8,
      type: "sent",
      title: "Monthly Rent",
      description: "Scheduled Payment",
      amount: -620000,
      date: "6 days ago, 8:00 AM",
      icon: "sent",
    },
  ]

  const filteredTransactions = transactions.filter((transaction) => {
    if (filterTab === "sent" && transaction.type !== "sent") return false
    if (filterTab === "received" && transaction.type !== "received") return false
    if (searchQuery && !transaction.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "received":
        return <ArrowDownToLine className="text-[#00FF41]" size={16} />
      case "shopping":
        return <ShoppingBag className="text-white/40" size={16} />
      default:
        return <ArrowUpFromLine className="text-white/40" size={16} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0a1a12] to-transparent backdrop-blur-xl">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-lg font-bold">Transaction History</h1>
          <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <Filter className="text-white" size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00FF41]/50 transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterTab === "all"
                  ? "bg-[#00FF41] text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab("sent")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterTab === "sent"
                  ? "bg-[#00FF41] text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilterTab("received")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterTab === "received"
                  ? "bg-[#00FF41] text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              Received
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-5 pb-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map((transaction) => (
              <button
                key={transaction.id}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-[16px] p-3.5 flex items-center gap-3 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    transaction.icon === "received" ? "bg-[#00FF41]/10" : "bg-white/5"
                  }`}
                >
                  {getIcon(transaction.icon)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white font-semibold text-sm truncate">{transaction.title}</p>
                  <p className="text-white/40 text-[11px] truncate">{transaction.description}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{transaction.date}</p>
                </div>
                <span
                  className={`font-bold text-sm flex-shrink-0 ${
                    transaction.amount > 0 ? "text-[#00FF41]" : "text-white"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  NGN {Math.abs(transaction.amount).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
