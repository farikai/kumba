"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

interface KycScreenProps {
  onComplete: () => void
  onBack?: () => void
}

export default function KycScreen({ onComplete, onBack }: KycScreenProps) {
  const [verifyType, setVerifyType] = useState<"bvn" | "nin">("bvn")
  const [verifyNumber, setVerifyNumber] = useState("")

  const handleVerifyTypeChange = (type: "bvn" | "nin") => {
    setVerifyType(type)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setVerifyNumber(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (verifyNumber.length >= 11) {
      setTimeout(() => {
        onComplete()
      }, 300)
    }
  }

  const handleBackClick = () => {
    if (onBack) {
      onBack()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2818] via-[#0f3a24] to-[#0a2818] flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between">
        {onBack && (
          <button
            onClick={handleBackClick}
            type="button"
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors active:bg-white/15"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
        )}
        <div className="flex-1 text-center">
          <span className="text-white text-base font-semibold">Verify Identity</span>
        </div>
        <div className="text-[#00FF41] text-sm font-bold">2/3</div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8 max-w-md mx-auto w-full">
        <div className="space-y-2 mb-10">
          <h1 className="text-white text-3xl font-bold tracking-tight">Let's secure your account</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            To activate your Korapay wallet and start spending, we need to confirm it's really you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BVN/NIN Tabs */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleVerifyTypeChange("bvn")}
              className={`flex-1 h-12 rounded-xl font-semibold text-sm transition-all ${
                verifyType === "bvn" ? "bg-[#00FF41] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              BVN
            </button>
            <button
              type="button"
              onClick={() => handleVerifyTypeChange("nin")}
              className={`flex-1 h-12 rounded-xl font-semibold text-sm transition-all ${
                verifyType === "nin" ? "bg-[#00FF41] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              NIN
            </button>
          </div>

          {/* Input Field */}
          <div className="space-y-3">
            <label className="text-white text-sm font-medium">
              {verifyType === "bvn" ? "Bank Verification Number (BVN)" : "National Identification Number (NIN)"}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="1234 5678 901"
                value={verifyNumber}
                onChange={handleInputChange}
                maxLength={11}
                className="h-14 bg-black/20 border border-white/10 text-white placeholder:text-white/30 rounded-xl text-base pr-12"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect width="20" height="20" rx="4" fill="white" fillOpacity="0.05" />
                  <path
                    d="M10 6V8M10 11V14M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z"
                    stroke="white"
                    strokeOpacity="0.4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-white/40">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <span>
                Dial <span className="text-[#00FF41]">*565*0#</span> to check your BVN
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-[#00FF41]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info size={12} className="text-[#00FF41]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-white text-sm font-semibold">Why do we need this?</h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  We use your ID to verify your identity and protect you from fraud. We{" "}
                  <span className="text-white font-medium">cannot</span> access your bank accounts or funds.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={verifyNumber.length < 11}
            className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00FF41]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Verify & Continue
            <ArrowRight size={20} />
          </Button>
        </form>

        <p className="text-center text-white/30 text-[10px] mt-6">
          <svg className="inline-block mr-1" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0ZM5.25 3.75C5.25 3.33579 5.58579 3 6 3C6.41421 3 6.75 3.33579 6.75 3.75V6.75C6.75 7.16421 6.41421 7.5 6 7.5C5.58579 7.5 5.25 7.16421 5.25 6.75V3.75ZM6 9.75C5.58579 9.75 5.25 9.41421 5.25 9C5.25 8.58579 5.58579 8.25 6 8.25C6.41421 8.25 6.75 8.58579 6.75 9C6.75 9.41421 6.41421 9.75 6 9.75Z" />
          </svg>
          Your data is encrypted. Read our <span className="text-white/60">Privacy policy</span>
        </p>
      </div>
    </div>
  )
}
