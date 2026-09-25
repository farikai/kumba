"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

interface PinCreateScreenProps {
  onComplete: (pin: string) => void
  onBack?: () => void
}

export default function PinCreateScreen({ onComplete, onBack }: PinCreateScreenProps) {
  const [pin, setPin] = useState<string[]>([])

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = [...pin, num]
      setPin(newPin)
      if (newPin.length === 4) setTimeout(() => onComplete(newPin.join("")), 400)
    }
  }

  const handleDelete = () => setPin(pin.slice(0, -1))

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

      {/* Progress dots */}
      <div className="flex justify-center gap-2 px-6 mb-8">
        <motion.div className="h-1 w-16 bg-[#00FF41] rounded-full" layoutId="pin-progress-1" />
        <div className="h-1 w-16 bg-white/10 rounded-full" />
        <div className="h-1 w-16 bg-white/10 rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-12"
        >
          <h1 className="text-white text-3xl font-bold">Create your PIN</h1>
          <p className="text-white/60 text-sm">Enter a 4-digit PIN to secure your Korapay wallet.</p>
        </motion.div>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-16">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: index < pin.length ? [1, 1.15, 1] : 1,
                borderColor: index < pin.length ? '#00FF41' : 'rgba(255,255,255,0.1)',
                backgroundColor: index < pin.length ? 'rgba(0,255,65,0.1)' : 'rgba(255,255,255,0.05)',
              }}
              transition={{ duration: 0.2 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center border-2"
            >
              {index < pin.length && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 bg-[#00FF41] rounded-full"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="w-full max-w-sm">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                whileTap={{ scale: 0.85, backgroundColor: 'rgba(255,255,255,0.1)' }}
                onClick={() => handleNumberClick(num.toString())}
                className="h-20 flex items-center justify-center text-white text-3xl font-light hover:bg-white/5 rounded-2xl transition-colors"
              >
                {num}
              </motion.button>
            ))}
            <div />
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleNumberClick("0")}
              className="h-20 flex items-center justify-center text-white text-3xl font-light hover:bg-white/5 rounded-2xl transition-colors"
            >
              0
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleDelete}
              className="h-20 flex items-center justify-center text-white hover:bg-white/5 rounded-2xl transition-colors"
            >
              <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4L2 12L8 20H24C25.1046 20 26 19.1046 26 18V6C26 4.89543 25.1046 4 24 4H8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 9L13 14M13 9L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
