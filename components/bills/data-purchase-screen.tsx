"use client"

import { useState } from "react"
import { ArrowLeft, Phone, Wifi, Calendar, Repeat } from "lucide-react"
import PinConfirmationModal from "../shared/pin-confirmation-modal"

interface DataPurchaseScreenProps {
  onBack: () => void
  onComplete: () => void
}

export default function DataPurchaseScreen({ onBack, onComplete }: DataPurchaseScreenProps) {
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
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

  const dataPlans: Record<string, any[]> = {
    mtn: [
      { id: "1", size: "1GB", validity: "1 Day", price: 350 },
      { id: "2", size: "2GB", validity: "2 Days", price: 700 },
      { id: "3", size: "1GB", validity: "7 Days", price: 500 },
      { id: "4", size: "3GB", validity: "30 Days", price: 1500 },
      { id: "5", size: "5GB", validity: "30 Days", price: 2500 },
      { id: "6", size: "10GB", validity: "30 Days", price: 5000 },
    ],
    airtel: [
      { id: "1", size: "750MB", validity: "7 Days", price: 500 },
      { id: "2", size: "1.5GB", validity: "30 Days", price: 1200 },
      { id: "3", size: "4GB", validity: "30 Days", price: 2000 },
      { id: "4", size: "10GB", validity: "30 Days", price: 5000 },
    ],
    glo: [
      { id: "1", size: "1.6GB", validity: "30 Days", price: 1000 },
      { id: "2", size: "3.5GB", validity: "30 Days", price: 2000 },
      { id: "3", size: "8GB", validity: "30 Days", price: 5000 },
    ],
    "9mobile": [
      { id: "1", size: "1GB", validity: "30 Days", price: 1000 },
      { id: "2", size: "2.5GB", validity: "30 Days", price: 2000 },
      { id: "3", size: "11GB", validity: "30 Days", price: 5000 },
    ],
  }

  const handleProceed = () => {
    if (!selectedNetwork || !phoneNumber || !selectedPlan) return
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
          <h1 className="text-white font-bold text-lg">Buy Data</h1>
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
                onClick={() => {
                  setSelectedNetwork(network.id)
                  setSelectedPlan(null)
                }}
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

        {/* Data Plans */}
        {selectedNetwork && (
          <div>
            <label className="text-white/60 text-sm font-medium mb-3 block">Select Data Plan</label>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {dataPlans[selectedNetwork]?.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    selectedPlan?.id === plan.id
                      ? "border-[#00FF41] bg-[#00FF41]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00D9FF]/20 flex items-center justify-center">
                      <Wifi className="text-[#00D9FF]" size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold">{plan.size}</p>
                      <p className="text-white/60 text-xs">{plan.validity}</p>
                    </div>
                  </div>
                  <p className="text-[#00FF41] font-bold">₦{plan.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedNetwork && phoneNumber && selectedPlan && (
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
              <span className="text-white/60 text-sm">Data Plan</span>
              <span className="text-white font-bold">
                {selectedPlan.size} - {selectedPlan.validity}
              </span>
            </div>
            <div className="border-t border-white/10 my-3 pt-3 flex items-center justify-between">
              <span className="text-white/80 font-medium">Total</span>
              <span className="text-[#00FF41] font-bold text-xl">₦{selectedPlan.price.toLocaleString()}</span>
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
                      💡 This payment will be {frequency === "once" ? "made" : "auto-debited " + frequency} based on
                      your budget availability
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={!selectedNetwork || !phoneNumber || !selectedPlan}
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
        amount={selectedPlan?.price || 0}
        recipient={`${networks.find((n) => n.id === selectedNetwork)?.name} Data - ${phoneNumber}`}
        type="bill"
      />
    </div>
  )
}
