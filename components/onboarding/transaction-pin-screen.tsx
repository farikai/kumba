"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"

interface TransactionPinScreenProps {
  onComplete: (pin: string) => void
  onBack?: () => void
}

export default function TransactionPinScreen({ onComplete, onBack }: TransactionPinScreenProps) {
  const [pin, setPin] = useState<string[]>(["", "", "", ""])
  const [activeIndex, setActiveIndex] = useState(0)

  const handleNumberClick = (num: number) => {
    if (activeIndex < 4) {
      const newPin = [...pin]
      newPin[activeIndex] = num.toString()
      setPin(newPin)
      setActiveIndex(activeIndex + 1)

      if (activeIndex === 3) {
        setTimeout(() => {
          onComplete(newPin.join(""))
        }, 300)
      }
    }
  }

  const handleDelete = () => {
    if (activeIndex > 0) {
      const newPin = [...pin]
      newPin[activeIndex - 1] = ""
      setPin(newPin)
      setActiveIndex(activeIndex - 1)
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
        <div className="flex-1 text-center">
          <span className="text-white text-base font-semibold">Security</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress Indicator */}
      <div className="px-6 flex justify-center gap-1.5 mb-10">
        <div className="w-8 h-1 bg-[#00FF41] rounded-full" />
        <div className="w-8 h-1 bg-white/20 rounded-full" />
        <div className="w-8 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 max-w-md mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-white text-3xl font-bold mb-3">Create Transaction PIN</h1>
          <p className="text-white/60 text-sm">Enter a 4-digit PIN to secure your transactions and payments.</p>
        </div>

        {/* PIN Dots */}
        <div className="flex gap-6 mb-16">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                pin[index]
                  ? "bg-[#00FF41] border-[#00FF41]"
                  : activeIndex === index
                    ? "border-[#00FF41]"
                    : "border-white/20"
              }`}
            >
              {pin[index] && <div className="w-3 h-3 rounded-full bg-black" />}
            </div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="w-full max-w-[280px] mb-8">
          <div className="grid grid-cols-3 gap-x-8 gap-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="w-16 h-16 mx-auto flex items-center justify-center text-white text-2xl font-medium hover:bg-white/5 rounded-2xl transition-colors active:bg-white/10"
              >
                {num}
              </button>
            ))}
            <div className="w-16" />
            <button
              onClick={() => handleNumberClick(0)}
              className="w-16 h-16 mx-auto flex items-center justify-center text-white text-2xl font-medium hover:bg-white/5 rounded-2xl transition-colors active:bg-white/10"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="w-16 h-16 mx-auto flex items-center justify-center text-white hover:bg-white/5 rounded-2xl transition-colors active:bg-white/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
