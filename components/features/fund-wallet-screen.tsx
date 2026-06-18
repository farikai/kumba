"use client"

import { ArrowLeft, Copy, Building2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface FundWalletScreenProps {
  onBack: () => void
}

export default function FundWalletScreen({ onBack }: FundWalletScreenProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText("9023882100")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <h1 className="text-white text-lg font-bold">Fund Wallet</h1>
      </div>

      {/* Current Balance */}
      <div className="px-5 py-6 text-center">
        <p className="text-white/50 text-xs font-medium mb-1">Current Balance</p>
        <h2 className="text-white text-4xl font-bold tracking-tight">₦45,200.00</h2>
      </div>

      {/* AI Tip */}
      <div className="px-5 pb-5">
        <div className="bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-2xl p-3 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#00FF41]/15 flex items-center justify-center flex-shrink-0">
            <Shield className="text-[#00FF41]" size={14} />
          </div>
          <p className="text-[#00FF41] text-xs leading-relaxed">
            <span className="font-bold">Korapay AI Tip:</span> Need help? Just ask me to fund your wallet for you next
            time!
          </p>
        </div>
      </div>

      {/* Virtual Account Card */}
      <div className="px-5 pb-5">
        <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Your Virtual Account</p>
            <Building2 className="text-[#00FF41]" size={20} />
          </div>
          <h3 className="text-white text-lg font-bold mb-1">Wema Bank</h3>
          <p className="text-white/40 text-xs mb-4">KORAPAY • ZENDPOINT</p>
          <div className="text-[#00FF41] text-2xl font-mono font-bold tracking-wider">9023 8821 00</div>
        </div>

        <Button
          onClick={handleCopy}
          className="w-full h-12 mt-3 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-sm rounded-xl shadow-lg shadow-[#00FF41]/20"
        >
          <Copy size={16} className="mr-2" />
          {copied ? "Copied!" : "Copy Number"}
        </Button>
      </div>

      {/* Instructions */}
      <div className="px-5">
        <h3 className="text-white font-bold text-base mb-3">How to deposit</h3>
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "Open your bank app",
              desc: "Log in to your banking application or your bank website",
            },
            {
              step: "2",
              title: "Make a transfer",
              desc: 'Send money to the account number above. Select "Wema Bank" as the destination bank',
            },
            {
              step: "3",
              title: "Funds reflect instantly",
              desc: "Your Korapay wallet will be credited immediately after the payment is sent",
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center text-[#00FF41] font-bold text-sm flex-shrink-0">
                {item.step}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Button */}
      <div className="px-5 pt-6 pb-8">
        <button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
          </svg>
          Share Account Details
        </button>
        <p className="text-center text-white/30 text-xs mt-3 flex items-center justify-center gap-1">
          <Shield size={12} />
          Secured by Korapay • Security
        </p>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-24" />
    </div>
  )
}
