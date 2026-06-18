"use client"

import { useState, useCallback } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  ArrowLeft,
  Search,
  Mic,
  QrCode,
  ImageIcon,
  Building2,
  Sparkles,
  X,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"

// Runtime refs for new Convex actions — will resolve after `npx convex dev`
const apiAny = api as any

interface SendMoneyScreenProps {
  onBack: () => void
  onScanQR?: () => void
  userId?: string | null
}

type FlowStep = "select" | "manual" | "amount" | "confirm" | "pin" | "success"

interface Contact {
  id: number
  name: string
  phone: string
  bank?: string
  accountNumber?: string
  avatar: string
  color: string
}

const banks = [
  { id: 1, name: "Access Bank", code: "044" },
  { id: 2, name: "GTBank", code: "058" },
  { id: 3, name: "Zenith Bank", code: "057" },
  { id: 4, name: "First Bank", code: "011" },
  { id: 5, name: "UBA", code: "033" },
  { id: 6, name: "Fidelity Bank", code: "070" },
  { id: 7, name: "Union Bank", code: "032" },
  { id: 8, name: "Stanbic IBTC", code: "221" },
  { id: 9, name: "Sterling Bank", code: "232" },
  { id: 10, name: "Wema Bank", code: "035" },
  { id: 11, name: "Kuda Bank", code: "090267" },
  { id: 12, name: "Opay", code: "100004" },
  { id: 13, name: "Palmpay", code: "100033" },
  { id: 14, name: "Moniepoint", code: "100022" },
]

const suggestedContacts: Contact[] = [
  {
    id: 1,
    name: "Mom",
    phone: "+234 901 234 5678",
    bank: "Access Bank",
    accountNumber: "0123456789",
    avatar: "👩",
    color: "#00FF41",
  },
  {
    id: 2,
    name: "David",
    phone: "+234 812 345 6789",
    bank: "GTBank",
    accountNumber: "1234567890",
    avatar: "👨",
    color: "#4169E1",
  },
  {
    id: 3,
    name: "Amina",
    phone: "+234 703 456 7890",
    bank: "Zenith Bank",
    accountNumber: "2345678901",
    avatar: "👩",
    color: "#FF69B4",
  },
  {
    id: 4,
    name: "John",
    phone: "+234 815 678 9012",
    bank: "First Bank",
    accountNumber: "3456789012",
    avatar: "👨",
    color: "#FFA500",
  },
]

const recentTransactions = [
  { id: 1, name: "MTN Data Bundle", time: "Today, 10:23 AM", amount: -2500, icon: "📱", initials: "MT" },
  { id: 2, name: "Duke Kitchen", time: "Yesterday", amount: -15000, icon: "🍽️", initials: "DK" },
]

export default function SendMoneyScreen({ onBack, onScanQR, userId }: SendMoneyScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentStep, setCurrentStep] = useState<FlowStep>("select")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [pin, setPin] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const [showBankList, setShowBankList] = useState(false)
  const [selectedBank, setSelectedBank] = useState<(typeof banks)[0] | null>(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const lookupAccount = useAction(apiAny.actions["9psb"].lookupAccount)

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact)
    setCurrentStep("amount")
  }

  const handleManualEntry = () => {
    setCurrentStep("manual")
    setSelectedBank(null)
    setAccountNumber("")
    setAccountName("")
    setIsVerified(false)
  }

  const handleVerifyAccount = useCallback(async () => {
    if (accountNumber.length === 10 && selectedBank) {
      setIsVerifying(true)
      const result = await lookupAccount({ accountNumber, bankCode: selectedBank.code })
      setIsVerifying(false)
      if (result.success && result.data) {
        setAccountName(result.data.accountName)
        setIsVerified(true)
      }
    }
  }, [accountNumber, selectedBank, lookupAccount])

  const handleManualContinue = () => {
    if (isVerified && selectedBank && accountNumber) {
      setSelectedContact({
        id: Date.now(),
        name: accountName,
        phone: "",
        bank: selectedBank.name,
        accountNumber: accountNumber,
        avatar: "👤",
        color: "#00FF41",
      })
      setCurrentStep("amount")
    }
  }

  const handleAmountContinue = () => {
    if (amount && Number.parseFloat(amount) > 0) {
      setCurrentStep("confirm")
    }
  }

  const handleConfirmPayment = () => {
    setCurrentStep("pin")
  }

  const sendMoney = useAction(apiAny.actions["9psb"].sendMoney)

  const handlePinInput = async (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length === 4 && selectedContact && userId) {
        setIsProcessing(true)
        const result = await sendMoney({
          userId: userId as any,
          amount: Number.parseFloat(amount),
          accountNumber: selectedContact.accountNumber ?? "",
          bankCode: selectedContact.bank ?? "",
          accountName: selectedContact.name,
          narration: note || `Transfer to ${selectedContact.name}`,
          recipientName: selectedContact.name,
        })
        setIsProcessing(false)
        if (result.success) {
          setCurrentStep("success")
        }
      }
    }
  }

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const handleNewTransfer = () => {
    setCurrentStep("select")
    setSelectedContact(null)
    setAmount("")
    setNote("")
    setPin("")
    setSelectedBank(null)
    setAccountNumber("")
    setAccountName("")
    setIsVerified(false)
  }

  const formatAmount = (value: string) => {
    const num = Number.parseFloat(value.replace(/,/g, ""))
    if (isNaN(num)) return ""
    return num.toLocaleString()
  }

  if (currentStep === "manual") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep("select")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-xl font-bold">Account Details</h1>
          <div className="w-10" />
        </div>

        <div className="px-5 mt-4 space-y-4">
          {/* Bank Selection */}
          <div>
            <label className="text-white/60 text-sm font-medium mb-2 block">Select Bank</label>
            <button
              onClick={() => setShowBankList(!showBankList)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
            >
              <span className={selectedBank ? "text-white" : "text-white/40"}>
                {selectedBank ? selectedBank.name : "Choose a bank"}
              </span>
              <ChevronDown
                className={`text-white/40 transition-transform ${showBankList ? "rotate-180" : ""}`}
                size={20}
              />
            </button>

            {/* Bank List Dropdown */}
            {showBankList && (
              <div className="mt-2 bg-[#0d1f16] border border-white/10 rounded-xl max-h-64 overflow-y-auto">
                {banks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => {
                      setSelectedBank(bank)
                      setShowBankList(false)
                      setIsVerified(false)
                      setAccountName("")
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Building2 className="text-[#00FF41]" size={18} />
                    </div>
                    <span className="text-white text-sm">{bank.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="text-white/60 text-sm font-medium mb-2 block">Account Number</label>
            <div className="relative">
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10-digit account number"
                value={accountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                  setAccountNumber(value)
                  setIsVerified(false)
                  setAccountName("")
                  if (value.length === 10 && selectedBank) {
                    handleVerifyAccount()
                  }
                }}
                className="h-14 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40 text-lg tracking-wider pr-12"
              />
              {isVerifying && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="text-[#00FF41] animate-spin" size={20} />
                </div>
              )}
              {isVerified && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="text-[#00FF41]" size={20} />
                </div>
              )}
            </div>
          </div>

          {/* Account Name (Verified) */}
          {accountName && (
            <div className="bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-xl p-4">
              <p className="text-white/60 text-xs mb-1">Account Name</p>
              <p className="text-white font-bold text-lg">{accountName}</p>
              <p className="text-[#00FF41] text-xs mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Account verified successfully
              </p>
            </div>
          )}

          {/* Save as Beneficiary */}
          {isVerified && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#00FF41] focus:ring-[#00FF41]"
                defaultChecked
              />
              <span className="text-white/70 text-sm">Save as beneficiary for future transfers</span>
            </label>
          )}
        </div>

        {/* Continue Button */}
        <div className="fixed bottom-6 left-0 right-0 px-5">
          <button
            onClick={handleManualContinue}
            disabled={!isVerified}
            className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 disabled:bg-white/10 disabled:text-white/30 text-black font-bold text-base rounded-2xl transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // Select Contact Screen
  if (currentStep === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] pb-24">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-xl font-bold">Send Money</h1>
          <div className="w-10" />
        </div>

        {/* Search Bar */}
        <div className="px-5 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <Input
              placeholder="Name, @tag, or phone number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-12 h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00FF41] hover:text-[#00FF41]/80">
              <Mic size={18} />
            </button>
          </div>
        </div>

        {/* Suggested by AI */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-[#00FF41]" size={14} />
              <span className="text-[#00FF41] text-xs font-bold">Suggested by AI</span>
            </div>
            <button className="text-[#00FF41] text-xs font-semibold">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            <button onClick={handleManualEntry} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white text-2xl">
                +
              </div>
              <span className="text-white/60 text-[10px] font-medium">New</span>
            </button>
            {suggestedContacts.map((contact) => (
              <button
                key={contact.id}
                className="flex flex-col items-center gap-2 flex-shrink-0"
                onClick={() => handleSelectContact(contact)}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 relative"
                  style={{ borderColor: contact.color, background: `${contact.color}15` }}
                >
                  {contact.avatar}
                  {contact.id === 1 && (
                    <div className="absolute -top-1 -right-1 bg-[#00FF41] text-black text-[8px] font-bold px-1 rounded">
                      TOP
                    </div>
                  )}
                </div>
                <span className="text-white text-[10px] font-medium">{contact.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Methods */}
        <div className="px-5 mb-6">
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">METHODS</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onScanQR}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#00FF41]/10 flex items-center justify-center">
                <QrCode className="text-[#00FF41]" size={24} />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">Scan QR</p>
                <p className="text-white/40 text-[10px]">Pay via code</p>
              </div>
            </button>
            <button className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors relative">
              <div className="absolute top-2 right-2">
                <span className="bg-[#00FF41] text-black text-[8px] font-bold px-1.5 py-0.5 rounded">NEW</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#00FF41]/10 flex items-center justify-center">
                <ImageIcon className="text-[#00FF41]" size={24} />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">Snap to Pay</p>
                <p className="text-white/40 text-[10px]">Extract details</p>
              </div>
            </button>
          </div>
        </div>

        <div className="px-5 mb-6">
          <button
            onClick={handleManualEntry}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <Building2 className="text-white/60" size={24} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-semibold text-sm">Enter Account Details</p>
              <p className="text-white/40 text-[11px]">Bank transfer or mobile money</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white/40 flex-shrink-0">
              <path
                d="M7 4L13 10L7 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Recent */}
        <div className="px-5">
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">RECENT</h3>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <button
                key={tx.id}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF41]/10 to-[#00FF41]/5 flex items-center justify-center">
                  <span className="text-white/80 text-xs font-bold">{tx.initials}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{tx.name}</p>
                  <p className="text-white/40 text-[11px]">{tx.time}</p>
                </div>
                <span className="text-white font-bold text-sm flex-shrink-0">
                  ₦{Math.abs(tx.amount).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Voice Command Button */}
        <div className="fixed bottom-6 left-0 right-0 px-5">
          <button className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 active:bg-[#00FF41]/80 text-black font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#00FF41]/20 transition-all">
            <Mic size={20} strokeWidth={2.5} />
            <span>AI VOICE</span>
            <span className="font-normal">"Send 5k to David"</span>
          </button>
        </div>
      </div>
    )
  }

  // Amount Entry Screen
  if (currentStep === "amount") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep("select")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-xl font-bold">Enter Amount</h1>
          <div className="w-10" />
        </div>

        {/* Recipient Info */}
        <div className="px-5 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2"
              style={{ borderColor: selectedContact?.color, background: `${selectedContact?.color}15` }}
            >
              {selectedContact?.avatar}
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-lg">{selectedContact?.name}</p>
              <p className="text-white/50 text-sm">
                {selectedContact?.bank} • {selectedContact?.accountNumber?.slice(-4)}
              </p>
            </div>
            <button onClick={() => setCurrentStep("select")} className="text-white/40 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="px-5 mb-6">
          <div className="text-center mb-8">
            <p className="text-white/50 text-sm mb-2">Enter amount to send</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-[#00FF41] text-3xl font-bold">₦</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatAmount(amount)}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="bg-transparent text-white text-5xl font-bold text-center outline-none w-full max-w-xs"
              />
            </div>
            <p className="text-white/30 text-sm mt-2">Balance: ₦842,300.50</p>
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="px-5 mb-6">
          <div className="flex gap-2 justify-center flex-wrap">
            {[1000, 2000, 5000, 10000, 20000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Note Input */}
        <div className="px-5 mb-8">
          <Input
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
          />
        </div>

        {/* Continue Button */}
        <div className="px-5">
          <button
            onClick={handleAmountContinue}
            disabled={!amount || Number.parseFloat(amount) <= 0}
            className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 disabled:bg-white/10 disabled:text-white/30 text-black font-bold text-base rounded-2xl transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  // Confirm Screen
  if (currentStep === "confirm") {
    const fee = 10
    const total = Number.parseFloat(amount) + fee

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep("amount")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-xl font-bold">Confirm Transfer</h1>
          <div className="w-10" />
        </div>

        {/* Transfer Details */}
        <div className="px-5 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            {/* Recipient */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2"
                style={{ borderColor: selectedContact?.color, background: `${selectedContact?.color}15` }}
              >
                {selectedContact?.avatar}
              </div>
              <div className="flex-1">
                <p className="text-white/50 text-sm">Sending to</p>
                <p className="text-white font-bold text-lg">{selectedContact?.name}</p>
                <p className="text-white/40 text-xs">
                  {selectedContact?.bank} • {selectedContact?.accountNumber}
                </p>
              </div>
            </div>

            {/* Amount Details */}
            <div className="py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Amount</span>
                <span className="text-white font-semibold">₦{Number.parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Transaction Fee</span>
                <span className="text-white font-semibold">₦{fee.toLocaleString()}</span>
              </div>
              {note && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Note</span>
                  <span className="text-white/80 text-sm">{note}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">Total</span>
                <span className="text-[#00FF41] font-bold text-2xl">₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Kumba AI Tip */}
          <div className="mt-4 bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="text-[#00FF41] flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-[#00FF41] font-bold text-xs mb-1">Kumbapay AI</p>
                <p className="text-white/70 text-sm">
                  This transfer will complete instantly. {selectedContact?.name} will receive ₦
                  {Number.parseFloat(amount).toLocaleString()} in their {selectedContact?.bank} account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="fixed bottom-6 left-0 right-0 px-5">
          <button
            onClick={handleConfirmPayment}
            className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#00FF41]/20 transition-all"
          >
            <CheckCircle2 size={20} />
            Confirm & Pay
          </button>
        </div>
      </div>
    )
  }

  // PIN Entry Screen
  if (currentStep === "pin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-center relative">
          <button
            onClick={() => setCurrentStep("confirm")}
            className="absolute left-5 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="text-white" size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00FF41]" />
            <span className="text-[#00FF41] text-sm font-bold">SECURE PAYMENT</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <h1 className="text-white text-2xl font-bold mb-2">Enter Transaction PIN</h1>
          <p className="text-white/50 text-sm mb-8 text-center">
            Authorize ₦{Number.parseFloat(amount).toLocaleString()} to {selectedContact?.name}
          </p>

          {/* PIN Dots */}
          <div className="flex gap-4 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  i < pin.length ? "bg-[#00FF41] scale-110" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2 text-[#00FF41] mb-4">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-sm">Processing...</span>
            </div>
          )}

          <button className="text-[#00FF41] text-sm font-medium mb-8">Forgot PIN?</button>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"].map((key, index) => (
              <button
                key={index}
                onClick={() => {
                  if (key === "del") handlePinDelete()
                  else if (key !== "") handlePinInput(key.toString())
                }}
                disabled={key === "" || isProcessing}
                className={`h-16 rounded-2xl text-2xl font-bold transition-all ${
                  key === ""
                    ? "invisible"
                    : key === "del"
                      ? "bg-white/5 text-white/60 hover:bg-white/10"
                      : "bg-white/5 text-white hover:bg-white/10 active:bg-white/20"
                }`}
              >
                {key === "del" ? "⌫" : key}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Success Screen
  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col items-center justify-center px-5">
        {/* Success Animation */}
        <div className="w-24 h-24 rounded-full bg-[#00FF41]/20 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-[#00FF41]/10 animate-ping" />
          <CheckCircle2 className="text-[#00FF41]" size={48} />
        </div>

        <h1 className="text-white text-2xl font-bold mb-2">Transfer Successful!</h1>
        <p className="text-white/50 text-center mb-8">
          ₦{Number.parseFloat(amount).toLocaleString()} has been sent to {selectedContact?.name}
        </p>

        {/* Transaction Details */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Recipient</span>
              <span className="text-white font-medium">{selectedContact?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Bank</span>
              <span className="text-white font-medium">{selectedContact?.bank}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Amount</span>
              <span className="text-[#00FF41] font-bold">₦{Number.parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Reference</span>
              <span className="text-white font-medium text-xs">KPY{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Date</span>
              <span className="text-white font-medium text-xs">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button className="w-full h-12 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
            Share Receipt
          </button>
          <button
            onClick={handleNewTransfer}
            className="w-full h-12 bg-[#00FF41] text-black font-bold rounded-xl hover:bg-[#00FF41]/90 transition-colors"
          >
            New Transfer
          </button>
          <button onClick={onBack} className="w-full h-12 text-white/60 font-medium hover:text-white transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return null
}
