"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OtpVerifyScreenProps {
  phoneNumber: string
  onVerify: () => void
  onBack?: () => void
}

export default function OtpVerifyScreen({ phoneNumber, onVerify, onBack }: OtpVerifyScreenProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleNumberClick = (num: string) => {
    const firstEmptyIndex = otp.findIndex((digit) => digit === "")
    if (firstEmptyIndex !== -1) {
      const newOtp = [...otp]
      newOtp[firstEmptyIndex] = num
      setOtp(newOtp)

      // Auto-verify when all digits entered
      if (firstEmptyIndex === 5) {
        setTimeout(() => {
          onVerify()
        }, 300)
      }
    }
  }

  const handleDelete = () => {
    const lastFilledIndex = otp.findLastIndex((digit) => digit !== "")
    if (lastFilledIndex !== -1) {
      const newOtp = [...otp]
      newOtp[lastFilledIndex] = ""
      setOtp(newOtp)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2818] via-[#0f3a24] to-[#0a2818] flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            type="button"
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-[#00FF41]/10 px-3 py-1.5 rounded-full border border-[#00FF41]/30">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 0L9.09 4.26L14 4.96L10.5 8.35L11.18 13.24L7 11.01L2.82 13.24L3.5 8.35L0 4.96L4.91 4.26L7 0Z"
              fill="#00FF41"
            />
          </svg>
          <span className="text-[#00FF41] text-xs font-bold tracking-wide">AI VERIFY</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-8">
        <div className="text-center space-y-3 mb-8 w-full max-w-sm">
          <h1 className="text-white text-3xl font-bold">Verify it's you</h1>
          <p className="text-white/60 text-sm">
            We sent a code to <span className="text-[#00FF41] font-semibold">{phoneNumber}</span>
            <button className="ml-2 text-[#00FF41] text-xs hover:underline">Edit</button>
          </p>
        </div>

        {/* OTP Boxes */}
        <div className="flex gap-2 mb-6">
          {otp.map((digit, index) => (
            <div
              key={index}
              className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border-2 transition-all ${
                digit
                  ? "bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41]"
                  : index === otp.findIndex((d) => d === "")
                    ? "bg-white/5 border-[#00FF41]/50"
                    : "bg-white/5 border-white/10 text-white"
              }`}
            >
              {digit || ""}
            </div>
          ))}
        </div>

        {/* Timer */}
        <p className="text-white/60 text-sm mb-8">
          Resend code in{" "}
          <span className="text-[#00FF41] font-mono font-bold">0:{timer.toString().padStart(2, "0")}</span>
        </p>

        {/* Number Pad */}
        <div className="w-full max-w-sm mb-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="h-16 flex items-center justify-center text-white text-2xl font-light hover:bg-white/5 rounded-2xl transition-colors"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleNumberClick("0")}
              className="h-16 flex items-center justify-center text-white text-2xl font-light hover:bg-white/5 rounded-2xl transition-colors"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-16 flex items-center justify-center text-white hover:bg-white/5 rounded-2xl transition-colors"
            >
              <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 4L2 12L8 20H24C25.1046 20 26 19.1046 26 18V6C26 4.89543 25.1046 4 24 4H8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M18 9L13 14M13 9L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Verify Button */}
        <Button
          onClick={onVerify}
          disabled={otp.some((digit) => digit === "")}
          className="w-full max-w-sm h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-xl shadow-lg shadow-[#00FF41]/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Verify ✓
        </Button>
      </div>
    </div>
  )
}
