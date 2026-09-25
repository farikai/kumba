"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

interface TransactionPinScreenProps {
  onComplete: (pin: string) => void
  onBack?: () => void
  title?: string
  subtitle?: string
  error?: string
}

export default function TransactionPinScreen({
  onComplete,
  onBack,
  title = "Create Transaction PIN",
  subtitle = "Enter a 4-digit PIN to secure your transactions and payments.",
  error,
}: TransactionPinScreenProps) {
  const [pin, setPin] = useState<string[]>(["", "", "", ""])
  const [activeIndex, setActiveIndex] = useState(0)

  const handleNumberClick = (num: number) => {
    if (activeIndex < 4) {
      const newPin = [...pin]
      newPin[activeIndex] = num.toString()
      setPin(newPin)
      setActiveIndex(activeIndex + 1)
      if (activeIndex === 3) setTimeout(() => onComplete(newPin.join("")), 400)
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
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            type="button"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </motion.button>
        )}
        <div className="flex-1 text-center">
          <span className="text-white text-base font-semibold">Security</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress Indicator */}
      <div className="px-6 flex justify-center gap-1.5 mb-10">
        <motion.div className="w-8 h-1 bg-[#00FF41] rounded-full" layoutId="tx-progress-1" />
        <div className="w-8 h-1 bg-white/20 rounded-full" />
        <div className="w-8 h-1 bg-white/20 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-white text-3xl font-bold mb-3">{title}</h1>
          <p className="text-white/60 text-sm">{subtitle}</p>
          {error && <p className="text-red-400 text-sm font-medium pt-2">{error}</p>}
        </motion.div>

        {/* PIN Dots */}
        <div className="flex gap-6 mb-16">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: pin[index] ? [1, 1.15, 1] : 1,
                backgroundColor: pin[index] ? '#00FF41' : activeIndex === index ? 'transparent' : 'transparent',
                borderColor: pin[index] ? '#00FF41' : activeIndex === index ? '#00FF41' : 'rgba(255,255,255,0.2)',
              }}
              transition={{ duration: 0.2 }}
              className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center"
            >
              {pin[index] && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 rounded-full bg-black" />}
            </motion.div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="w-full max-w-[280px] mb-8">
          <div className="grid grid-cols-3 gap-x-8 gap-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                whileTap={{ scale: 0.85, backgroundColor: 'rgba(255,255,255,0.1)' }}
                onClick={() => handleNumberClick(num)}
                className="w-16 h-16 mx-auto flex items-center justify-center text-white text-2xl font-medium hover:bg-white/5 rounded-2xl transition-colors active:bg-white/10"
              >
                {num}
              </motion.button>
            ))}
            <div className="w-16" />
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleNumberClick(0)}
              className="w-16 h-16 mx-auto flex items-center justify-center text-white text-2xl font-medium hover:bg-white/5 rounded-2xl transition-colors active:bg-white/10"
            >
              0
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleDelete}
              className="w-16 h-16 mx-auto flex items-center justify-center text-white hover:bg-white/5 rounded-2xl transition-colors active:bg-white/10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
