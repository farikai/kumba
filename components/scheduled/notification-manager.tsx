"use client"

import { useEffect, useState } from "react"
import { Bell, X, Check, AlertCircle } from "lucide-react"

interface ScheduledNotification {
  id: string
  type: "payment_due" | "insufficient_funds" | "payment_success"
  title: string
  message: string
  amount: number
  recipient: string
  timestamp: Date
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([])
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const checkScheduledPayments = () => {
      const now = new Date()
      const autoPayKeys = Object.keys(localStorage).filter((key) => key.startsWith("autopay_"))

      autoPayKeys.forEach((key) => {
        const autoPayData = JSON.parse(localStorage.getItem(key) || "{}")
        const scheduleDate = new Date(autoPayData.scheduleDate)

        // Check if payment is due (within 1 hour of scheduled time)
        const timeDiff = scheduleDate.getTime() - now.getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)

        if (hoursDiff <= 1 && hoursDiff >= 0) {
          // Check if user has sufficient funds (mock check)
          const userBalance = 842300 // Mock balance
          const hasSufficientFunds = userBalance >= autoPayData.amount

          if (autoPayData.enabled) {
            // Auto-pay enabled - attempt payment
            if (hasSufficientFunds) {
              addNotification({
                id: `payment_success_${Date.now()}`,
                type: "payment_success",
                title: "Payment Successful",
                message: `Auto-payment of ₦${autoPayData.amount.toLocaleString()} to ${autoPayData.recipient} completed.`,
                amount: autoPayData.amount,
                recipient: autoPayData.recipient,
                timestamp: new Date(),
              })
            } else {
              addNotification({
                id: `insufficient_funds_${Date.now()}`,
                type: "insufficient_funds",
                title: "Insufficient Funds",
                message: `Cannot complete auto-payment of ₦${autoPayData.amount.toLocaleString()} to ${autoPayData.recipient}.`,
                amount: autoPayData.amount,
                recipient: autoPayData.recipient,
                timestamp: new Date(),
              })
            }
          } else {
            // Auto-pay disabled - send notification to enter PIN
            addNotification({
              id: `payment_due_${Date.now()}`,
              type: "payment_due",
              title: "Payment Due",
              message: `Scheduled payment of ₦${autoPayData.amount.toLocaleString()} to ${autoPayData.recipient} is due. Tap to enter PIN and confirm.`,
              amount: autoPayData.amount,
              recipient: autoPayData.recipient,
              timestamp: new Date(),
            })
          }
        }
      })
    }

    // Check every minute
    const interval = setInterval(checkScheduledPayments, 60000)
    checkScheduledPayments() // Check immediately on mount

    return () => clearInterval(interval)
  }, [])

  const addNotification = (notification: ScheduledNotification) => {
    setNotifications((prev) => {
      // Prevent duplicate notifications
      if (prev.some((n) => n.id === notification.id)) return prev
      return [...prev, notification]
    })
    setShowNotification(true)

    // Auto-hide after 10 seconds
    setTimeout(() => {
      setShowNotification(false)
    }, 10000)
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (notifications.length <= 1) {
      setShowNotification(false)
    }
  }

  if (notifications.length === 0 || !showNotification) return null

  const latestNotification = notifications[notifications.length - 1]

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div
        className={`max-w-md mx-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-xl ${
          latestNotification.type === "payment_success"
            ? "bg-[#00FF41]/20 border-[#00FF41]/40"
            : latestNotification.type === "insufficient_funds"
              ? "bg-red-500/20 border-red-500/40"
              : "bg-orange-500/20 border-orange-500/40"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              latestNotification.type === "payment_success"
                ? "bg-[#00FF41]/20"
                : latestNotification.type === "insufficient_funds"
                  ? "bg-red-500/20"
                  : "bg-orange-500/20"
            }`}
          >
            {latestNotification.type === "payment_success" && <Check className="text-[#00FF41]" size={20} />}
            {latestNotification.type === "insufficient_funds" && <AlertCircle className="text-red-400" size={20} />}
            {latestNotification.type === "payment_due" && <Bell className="text-orange-400" size={20} />}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-bold text-sm mb-1 ${
                latestNotification.type === "payment_success"
                  ? "text-[#00FF41]"
                  : latestNotification.type === "insufficient_funds"
                    ? "text-red-400"
                    : "text-orange-400"
              }`}
            >
              {latestNotification.title}
            </h3>
            <p className="text-white text-xs leading-relaxed">{latestNotification.message}</p>

            {latestNotification.type === "insufficient_funds" && (
              <button className="mt-3 text-xs font-bold text-[#00FF41] hover:underline">Fund Wallet →</button>
            )}

            {latestNotification.type === "payment_due" && (
              <button className="mt-3 text-xs font-bold text-[#00FF41] hover:underline">Enter PIN Now →</button>
            )}
          </div>

          <button
            onClick={() => dismissNotification(latestNotification.id)}
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <X className="text-white/60" size={14} />
          </button>
        </div>

        {notifications.length > 1 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-white/60 text-xs text-center">+{notifications.length - 1} more notification(s)</p>
          </div>
        )}
      </div>
    </div>
  )
}
