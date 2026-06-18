"use client"

import { useState } from "react"
import { ArrowLeft, Phone, Calendar, Repeat } from "lucide-react"
import PinConfirmationModal from "../shared/pin-confirmation-modal"

interface AirtimePurchaseScreenProps {
  onBack: () => void
  onComplete: () => void
}

export default function AirtimePurchaseScreen({ onBack, onComplete }: AirtimePurchaseScreenProps) {
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [showPinModal, setShowPinModal] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "monthly">("once")

  const networks = [
    { id: "mtn", name: "MTN", logo: "📱", color: "#FFCB05" },
    { id: "airtel", name: "Airtel", logo: "📶", color: "#FF0000" },
    { id: "glo", name: "Glo", logo: "📡", color: "#00A651" },
    { id: "9mobile", name: "9mobile", logo: "📞", color: "#00623B" },
  ]

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000]

  const handleProceed = () => {
    if (!selectedNetwork || !phoneNumber || !amount) return
    setShowPinModal(true)
  }

  const handleSuccess = () => {
    setShowPinModal(false)
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2F1F] to-[#051810] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0A2F1F] to-transparent backdrop-blur-sm p-5">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white font-bold text-lg">Buy Airtime</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Network Selection */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Select Network</label>
          <div className="grid grid-cols-4 gap-3">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => setSelectedNetwork(network.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedNetwork === network.id
                    ? "border-[#00FF41] bg-[#00FF41]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="text-3xl mb-2">{network.logo}</div>
                <p className="text-white text-xs font-medium">{network.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="08012345678"
              className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-white/40 focus:border-[#00FF41] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Amount</label>
          <div className="relative mb-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-bold">₦</span>
            <input
              type="tel"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-white text-lg font-bold placeholder:text-white/40 focus:border-[#00FF41] focus:outline-none transition-colors"
            />
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className={`h-10 rounded-lg font-medium text-sm transition-all ${
                  amount === quickAmount.toString()
                    ? "bg-[#00FF41] text-black"
                    : "bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                ₦{quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Payment Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-[#00FF41]" size={18} />
              <span className="text-white font-bold text-sm">Schedule Payment</span>
            </div>
            <button
              onClick={() => setIsScheduled(!isScheduled)}
              className={`w-12 h-6 rounded-full transition-all ${isScheduled ? "bg-[#00FF41]" : "bg-white/20"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  isScheduled ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {isScheduled && (
            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-xs font-medium mb-2 block">Start Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-[#00FF41] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium mb-2 block">Frequency</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "once", label: "Once", icon: Calendar },
                    { value: "daily", label: "Daily", icon: Repeat },
                    { value: "weekly", label: "Weekly", icon: Repeat },
                    { value: "monthly", label: "Monthly", icon: Repeat },
                  ].map((freq) => (
                    <button
                      key={freq.value}
                      onClick={() => setFrequency(freq.value as any)}
                      className={`h-10 rounded-lg text-xs font-medium transition-all ${
                        frequency === freq.value
                          ? "bg-[#00FF41] text-black"
                          : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-lg p-3">
                <p className="text-[#00FF41] text-xs">
                  💡 This payment will be {frequency === "once" ? "made" : "auto-debited " + frequency} based on your
                  budget availability
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {selectedNetwork && phoneNumber && amount && (
          <div className="bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Network</span>
              <span className="text-white font-bold">{networks.find((n) => n.id === selectedNetwork)?.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Phone Number</span>
              <span className="text-white font-bold">{phoneNumber}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Amount</span>
              <span className="text-white font-bold">₦{Number(amount).toLocaleString()}</span>
            </div>
            {isScheduled && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Start Date</span>
                <span className="text-white font-bold">{scheduleDate}</span>
              </div>
            )}
            {isScheduled && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Frequency</span>
                <span className="text-white font-bold">{frequency}</span>
              </div>
            )}
            <div className="border-t border-white/10 my-3 pt-3 flex items-center justify-between">
              <span className="text-white/80 font-medium">Total</span>
              <span className="text-[#00FF41] font-bold text-xl">₦{Number(amount).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={!selectedNetwork || !phoneNumber || !amount}
          className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 active:bg-[#00FF41]/80 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>

      {/* PIN Modal */}
      <PinConfirmationModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handleSuccess}
        amount={Number(amount)}
        recipient={`${networks.find((n) => n.id === selectedNetwork)?.name} - ${phoneNumber}`}
        type="bill"
        isScheduled={isScheduled}
        scheduleDate={scheduleDate}
        frequency={frequency}
      />
    </div>
  )
}
