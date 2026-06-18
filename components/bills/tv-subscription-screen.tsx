"use client"

import { useState } from "react"
import { ArrowLeft, Tv, Calendar, Repeat } from "lucide-react"
import PinConfirmationModal from "../shared/pin-confirmation-modal"

interface TvSubscriptionScreenProps {
  onBack: () => void
  onComplete: () => void
}

export default function TvSubscriptionScreen({ onBack, onComplete }: TvSubscriptionScreenProps) {
  const [selectedProvider, setSelectedProvider] = useState("")
  const [smartCardNumber, setSmartCardNumber] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [verifiedName, setVerifiedName] = useState("")
  const [showPinModal, setShowPinModal] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "monthly">("monthly")

  const providers = [
    { id: "dstv", name: "DSTV", logo: "📺", color: "#0033A0" },
    { id: "gotv", name: "GOtv", logo: "📻", color: "#EB1C23" },
    { id: "startimes", name: "Startimes", logo: "🎬", color: "#FF6600" },
  ]

  const packages: Record<string, any[]> = {
    dstv: [
      { id: "1", name: "Padi", price: 2500, duration: "Monthly" },
      { id: "2", name: "Yanga", price: 3500, duration: "Monthly" },
      { id: "3", name: "Confam", price: 6200, duration: "Monthly" },
      { id: "4", name: "Compact", price: 10500, duration: "Monthly" },
      { id: "5", name: "Compact Plus", price: 16600, duration: "Monthly" },
      { id: "6", name: "Premium", price: 24500, duration: "Monthly" },
    ],
    gotv: [
      { id: "1", name: "Smallie", price: 1575, duration: "Monthly" },
      { id: "2", name: "Jinja", price: 3300, duration: "Monthly" },
      { id: "3", name: "Jolli", price: 4850, duration: "Monthly" },
      { id: "4", name: "Max", price: 6400, duration: "Monthly" },
    ],
    startimes: [
      { id: "1", name: "Nova", price: 1200, duration: "Monthly" },
      { id: "2", name: "Basic", price: 2100, duration: "Monthly" },
      { id: "3", name: "Smart", price: 2800, duration: "Monthly" },
      { id: "4", name: "Classic", price: 3500, duration: "Monthly" },
    ],
  }

  const handleVerifyCard = async () => {
    if (!selectedProvider || !smartCardNumber || smartCardNumber.length < 10) return

    // Simulate card verification
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setVerifiedName("John Doe - Apartment 5B")
  }

  const handleProceed = () => {
    if (!selectedProvider || !smartCardNumber || !selectedPackage || !verifiedName) return
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
          <h1 className="text-white font-bold text-lg">TV Subscription</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Select Provider</label>
          <div className="grid grid-cols-3 gap-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id)
                  setSelectedPackage(null)
                  setVerifiedName("")
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedProvider === provider.id
                    ? "border-[#00FF41] bg-[#00FF41]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="text-3xl mb-2">{provider.logo}</div>
                <p className="text-white text-xs font-medium">{provider.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Smart Card Number */}
        <div>
          <label className="text-white/60 text-sm font-medium mb-3 block">Smart Card / IUC Number</label>
          <input
            type="tel"
            value={smartCardNumber}
            onChange={(e) => {
              setSmartCardNumber(e.target.value.replace(/\D/g, "").slice(0, 11))
              setVerifiedName("")
            }}
            onBlur={handleVerifyCard}
            placeholder="Enter card number"
            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/40 focus:border-[#00FF41] focus:outline-none transition-colors"
          />
          {verifiedName && (
            <div className="mt-2 p-3 bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-lg">
              <p className="text-[#00FF41] text-sm font-medium">✓ {verifiedName}</p>
            </div>
          )}
        </div>

        {/* Package Selection */}
        {selectedProvider && (
          <div>
            <label className="text-white/60 text-sm font-medium mb-3 block">Select Package</label>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {packages[selectedProvider]?.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedPackage?.id === pkg.id
                      ? "border-[#00FF41] bg-[#00FF41]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B9D]/20 flex items-center justify-center">
                      <Tv className="text-[#FF6B9D]" size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold">{pkg.name}</p>
                      <p className="text-white/60 text-xs">{pkg.duration}</p>
                    </div>
                  </div>
                  <p className="text-[#00FF41] font-bold">₦{pkg.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedProvider && smartCardNumber && selectedPackage && verifiedName && (
          <div className="bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Provider</span>
              <span className="text-white font-bold">{providers.find((p) => p.id === selectedProvider)?.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Customer</span>
              <span className="text-white font-bold text-right text-xs">{verifiedName}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Package</span>
              <span className="text-white font-bold">{selectedPackage.name}</span>
            </div>
            <div className="border-t border-white/10 my-3 pt-3 flex items-center justify-between">
              <span className="text-white/80 font-medium">Total</span>
              <span className="text-[#00FF41] font-bold text-xl">₦{selectedPackage.price.toLocaleString()}</span>
            </div>

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
          disabled={!selectedProvider || !smartCardNumber || !selectedPackage || !verifiedName}
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
        amount={selectedPackage?.price || 0}
        recipient={`${providers.find((p) => p.id === selectedProvider)?.name} - ${selectedPackage?.name}`}
        type="bill"
      />
    </div>
  )
}
