"use client"

import { useState } from "react"
import { ArrowLeft, Zap, Calendar, Repeat } from "lucide-react"
import PinConfirmationModal from "../shared/pin-confirmation-modal"

interface ElectricityPaymentScreenProps {
  onBack: () => void
  onComplete: () => void
}

export default function ElectricityPaymentScreen({ onBack, onComplete }: ElectricityPaymentScreenProps) {
  const [selectedProvider, setSelectedProvider] = useState("")
  const [meterNumber, setMeterNumber] = useState("")
  const [meterType, setMeterType] = useState<"prepaid" | "postpaid">("prepaid")
  const [amount, setAmount] = useState("")
  const [verifiedName, setVerifiedName] = useState("")
  const [showPinModal, setShowPinModal] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "monthly">("monthly")

  const providers = [
    { id: "ikedc", name: "IKEDC", fullName: "Ikeja Electric" },
    { id: "ekedc", name: "EKEDC", fullName: "Eko Electric" },
    { id: "aedc", name: "AEDC", fullName: "Abuja Electric" },
    { id: "phedc", name: "PHEDC", fullName: "Port Harcourt Electric" },
    { id: "ibedc", name: "IBEDC", fullName: "Ibadan Electric" },
    { id: "kedc", name: "KEDC", fullName: "Kaduna Electric" },
  ]

  const quickAmounts = [1000, 2000, 5000, 10000, 15000, 20000]

  const handleVerifyMeter = async () => {
    if (!selectedProvider || !meterNumber || meterNumber.length < 10) return

    // Simulate meter verification
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setVerifiedName("John Doe - Block 5, Flat 3")
  }

  const handleProceed = () => {
    if (!selectedProvider || !meterNumber || !amount || !verifiedName) return
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
          <h1 className="text-white font-bold text-lg">Electricity Bill</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Select Provider</label>
          <div className="grid grid-cols-3 gap-2">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id)
                  setVerifiedName("")
                }}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedProvider === provider.id
                    ? "border-[#00FF41] bg-[#00FF41]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFD700]/20 flex items-center justify-center mx-auto mb-2">
                  <Zap className="text-[#FFD700]" size={16} />
                </div>
                <p className="text-white text-xs font-bold">{provider.name}</p>
                <p className="text-white/40 text-[10px]">{provider.fullName.split(" ")[0]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Meter Type */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Meter Type</label>
          <div className="grid grid-cols-2 gap-3">
            {["prepaid", "postpaid"].map((type) => (
              <button
                key={type}
                onClick={() => setMeterType(type as "prepaid" | "postpaid")}
                className={`h-12 rounded-xl font-medium transition-all capitalize ${
                  meterType === type
                    ? "bg-[#00FF41] text-black"
                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Meter Number */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Meter Number</label>
          <input
            type="tel"
            value={meterNumber}
            onChange={(e) => {
              setMeterNumber(e.target.value.replace(/\D/g, "").slice(0, 13))
              setVerifiedName("")
            }}
            onBlur={handleVerifyMeter}
            placeholder="Enter meter number"
            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/40 focus:border-[#00FF41] focus:outline-none transition-colors"
          />
          {verifiedName && (
            <div className="mt-2 p-3 bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-lg">
              <p className="text-[#00FF41] text-sm font-medium">✓ {verifiedName}</p>
            </div>
          )}
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
                ₦{(quickAmount / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {selectedProvider && meterNumber && amount && verifiedName && (
          <div className="bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Provider</span>
              <span className="text-white font-bold">{providers.find((p) => p.id === selectedProvider)?.fullName}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Meter Type</span>
              <span className="text-white font-bold capitalize">{meterType}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Customer</span>
              <span className="text-white font-bold text-right text-xs">{verifiedName}</span>
            </div>
            <div className="border-t border-white/10 my-3 pt-3 flex items-center justify-between">
              <span className="text-white/80 font-medium">Total</span>
              <span className="text-[#00FF41] font-bold text-xl">₦{Number(amount).toLocaleString()}</span>
            </div>

            {/* Schedule Payment Section */}
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
        )}

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={!selectedProvider || !meterNumber || !amount || !verifiedName}
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
        recipient={`${providers.find((p) => p.id === selectedProvider)?.fullName} - ${meterNumber}`}
        type="bill"
      />
    </div>
  )
}
