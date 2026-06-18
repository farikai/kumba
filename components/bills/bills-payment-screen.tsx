"use client"

import { useState } from "react"
import { ArrowLeft, Zap, Tv, Search } from "lucide-react"

interface BillsPaymentScreenProps {
  onBack: () => void
  onSelectService: (service: string) => void
}

export default function BillsPaymentScreen({ onBack, onSelectService }: BillsPaymentScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    {
      id: "electricity",
      title: "Electricity",
      subtitle: "IKEDC, EKEDC, AEDC & more",
      icon: Zap,
      color: "#FFD700",
    },
    {
      id: "tv",
      title: "TV Subscription",
      subtitle: "DSTV, GOTV, Startimes",
      icon: Tv,
      color: "#FF6B9D",
    },
  ]

  const filteredCategories = categories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2F1F] to-[#051810] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0A2F1F] to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between p-5">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white font-bold text-lg">Bills Payment</h1>
          <div className="w-10" />
        </div>

        {/* Search */}
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-white/40 focus:border-[#00FF41] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 space-y-3">
        {filteredCategories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => onSelectService(category.id)}
              className="w-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-2xl p-5 flex items-center gap-4 transition-all group"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${category.color}15` }}
              >
                <Icon size={24} style={{ color: category.color }} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-bold text-base mb-1">{category.title}</h3>
                <p className="text-white/60 text-sm">{category.subtitle}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00FF41]/20 transition-colors">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
              </div>
            </button>
          )
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-white/40 text-sm">No services found</p>
        </div>
      )}
    </div>
  )
}
