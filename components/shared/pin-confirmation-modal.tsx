"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Check, Bell, Clock } from "lucide-react"

interface PinConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  amount: number
  recipient: string
  type?: "payment" | "withdrawal" | "bill"
  isScheduled?: boolean
  scheduleDate?: string
  frequency?: "once" | "daily" | "weekly" | "monthly"
}

export default function PinConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  recipient,
  type = "payment",
  isScheduled = false,
  scheduleDate = "",
  frequency = "once",
}: PinConfirmationModalProps) {
  const [pin, setPin] = useState<string[]>(["", "", "", ""])
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [enableAutoPay, setEnableAutoPay] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""])
      setError("")
      setEnableAutoPay(false)
    }
  }, [isOpen])

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      nextInput?.focus()
    }

    if (newPin.every((digit) => digit !== "") && index === 3) {
      verifyPin(newPin.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      prevInput?.focus()
    }
  }

  const verifyPin = async (pinValue: string) => {
    setIsVerifying(true)
    setError("")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (pinValue === "1234") {
      if (isScheduled && enableAutoPay) {
        const autoPayData = {
          recipient,
          amount,
          scheduleDate,
          frequency,
          enabled: true,
        }
        localStorage.setItem(`autopay_${recipient}`, JSON.stringify(autoPayData))
        console.log("[v0] Auto-pay enabled for scheduled payment:", autoPayData)
      }
      onSuccess()
    } else {
      setError("Incorrect PIN. Try again.")
      setPin(["", "", "", ""])
      document.getElementById("pin-0")?.focus()
    }

    setIsVerifying(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-gradient-to-b from-[#0A2F1F] to-[#051810] rounded-3xl p-6 shadow-2xl border border-[#00FF41]/20">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 rounded-full bg-[#00FF41]/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
              <Check className="text-[#00FF41]" size={16} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="text-white/60" size={18} />
          </button>
        </div>

        <h2 className="text-white font-bold text-xl mb-2">Enter Transaction PIN</h2>
        <p className="text-white/60 text-sm mb-6">
          Authorize {type === "bill" ? "bill payment" : "transaction"} of{" "}
          <span className="text-[#00FF41] font-bold">₦{amount.toLocaleString()}</span> to {recipient}
        </p>

        {isScheduled && frequency !== "once" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="text-[#00FF41]" size={16} />
                <span className="text-white font-medium text-sm">Enable Auto-Pay</span>
              </div>
              <button
                onClick={() => setEnableAutoPay(!enableAutoPay)}
                className={`w-12 h-6 rounded-full transition-all ${enableAutoPay ? "bg-[#00FF41]" : "bg-white/20"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    enableAutoPay ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {enableAutoPay ? (
              <div className="bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-lg p-3 flex items-start gap-2">
                <Check className="text-[#00FF41] flex-shrink-0 mt-0.5" size={14} />
                <p className="text-[#00FF41] text-xs leading-relaxed">
                  Payment will be automatically debited {frequency} without PIN. You'll receive a confirmation
                  notification.
                </p>
              </div>
            ) : (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start gap-2">
                <Bell className="text-orange-400 flex-shrink-0 mt-0.5" size={14} />
                <p className="text-orange-400 text-xs leading-relaxed">
                  You'll receive a notification {frequency} to enter your PIN and authorize payment.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mb-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isVerifying}
              className="w-14 h-14 bg-white/5 border-2 border-white/10 rounded-xl text-white text-center text-xl font-bold focus:border-[#00FF41] focus:outline-none transition-all disabled:opacity-50"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && <p className="text-red-400 text-sm text-center mb-4 animate-pulse">{error}</p>}

        {isVerifying && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 bg-[#00FF41] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        <button className="text-[#00FF41] text-sm font-medium hover:underline w-full text-center mb-6">
          Forgot PIN?
        </button>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((num, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (num === "") return
                if (num === "⌫") {
                  const lastFilledIndex = pin.findLastIndex((d) => d !== "")
                  if (lastFilledIndex !== -1) {
                    const newPin = [...pin]
                    newPin[lastFilledIndex] = ""
                    setPin(newPin)
                    document.getElementById(`pin-${lastFilledIndex}`)?.focus()
                  }
                  return
                }
                const emptyIndex = pin.findIndex((d) => d === "")
                if (emptyIndex !== -1) {
                  handlePinChange(emptyIndex, num.toString())
                }
              }}
              disabled={isVerifying || num === ""}
              className={`h-14 rounded-xl font-bold text-lg transition-all ${
                num === ""
                  ? "invisible"
                  : num === "⌫"
                    ? "bg-white/5 text-white/60 hover:bg-white/10"
                    : "bg-white/5 text-white hover:bg-white/10 active:bg-[#00FF41]/20"
              } disabled:opacity-50`}
            >
              {num}
            </button>
          ))}
        </div>

        <p className="text-white/40 text-xs text-center mt-6">Your transaction is secure and encrypted</p>
      </div>
    </div>
  )
}
