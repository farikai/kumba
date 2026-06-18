"use client"

import { useState } from "react"
import {
  ArrowLeft,
  User,
  Shield,
  CreditCard,
  Fingerprint,
  Bell,
  Moon,
  HelpCircle,
  FileText,
  Info,
  LogOut,
  ChevronRight,
  Bot,
  CheckCircle2,
  X,
  ChevronLeft,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

interface SettingsScreenProps {
  onBack: () => void
  onLogout?: () => void
  onKumbaDefaultChange?: (enabled: boolean) => void
  kumbaDefault?: boolean
}

type SettingsView =
  | "main"
  | "personal-info"
  | "kyc"
  | "change-login-pin"
  | "change-transaction-pin"
  | "notifications"
  | "help"
  | "about"

export default function SettingsScreen({ onBack, onLogout, onKumbaDefaultChange, kumbaDefault: kumbaDefaultProp = false }: SettingsScreenProps) {
  const [kumbaDefault, setKumbaDefault] = useState(kumbaDefaultProp)
  const [currentView, setCurrentView] = useState<SettingsView>("main")
  const [biometricEnabled, setBiometricEnabled] = useState(true)
  const [fraudAlertsEnabled, setFraudAlertsEnabled] = useState(true)

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Tunde Johnson",
    email: "tunde.johnson@gmail.com",
    phone: "+234 901 234 5678",
    address: "15 Admiralty Way, Lekki Phase 1, Lagos",
    dateOfBirth: "1990-05-15",
  })

  // PIN Change State
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [pinChangeStep, setPinChangeStep] = useState<"current" | "new" | "confirm" | "success">("current")
  const [pinType, setPinType] = useState<"login" | "transaction">("login")

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    transactionAlerts: true,
    promotionalAlerts: false,
    securityAlerts: true,
  })

  const handlePinInput = (digit: string, type: "current" | "new" | "confirm") => {
    if (type === "current" && currentPin.length < 4) {
      const newValue = currentPin + digit
      setCurrentPin(newValue)
      if (newValue.length === 4) {
        setTimeout(() => setPinChangeStep("new"), 500)
      }
    } else if (type === "new" && newPin.length < 4) {
      const newValue = newPin + digit
      setNewPin(newValue)
      if (newValue.length === 4) {
        setTimeout(() => setPinChangeStep("confirm"), 500)
      }
    } else if (type === "confirm" && confirmPin.length < 4) {
      const newValue = confirmPin + digit
      setConfirmPin(newValue)
      if (newValue.length === 4) {
        setTimeout(() => setPinChangeStep("success"), 1000)
      }
    }
  }

  const handlePinDelete = (type: "current" | "new" | "confirm") => {
    if (type === "current") setCurrentPin(currentPin.slice(0, -1))
    else if (type === "new") setNewPin(newPin.slice(0, -1))
    else setConfirmPin(confirmPin.slice(0, -1))
  }

  const resetPinChange = () => {
    setCurrentPin("")
    setNewPin("")
    setConfirmPin("")
    setPinChangeStep("current")
  }

  // Render PIN Entry Screen
  const renderPinScreen = (type: "current" | "new" | "confirm") => {
    const pin = type === "current" ? currentPin : type === "new" ? newPin : confirmPin
    const title =
      type === "current"
        ? `Enter Current ${pinType === "login" ? "Login" : "Transaction"} PIN`
        : type === "new"
          ? "Enter New PIN"
          : "Confirm New PIN"

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col">
        <div className="px-5 pt-6 pb-4 flex items-center">
          <button
            onClick={() => {
              if (type === "current") {
                setCurrentView("main")
                resetPinChange()
              } else if (type === "new") {
                setPinChangeStep("current")
                setNewPin("")
              } else {
                setPinChangeStep("new")
                setConfirmPin("")
              }
            }}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="text-white" size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <h1 className="text-white text-2xl font-bold mb-2">{title}</h1>
          <p className="text-white/50 text-sm mb-8">
            {type === "current"
              ? "Enter your current PIN to continue"
              : type === "new"
                ? "Choose a new 4-digit PIN"
                : "Re-enter your new PIN to confirm"}
          </p>

          {/* PIN Dots */}
          <div className="flex gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  i < pin.length ? "bg-[#00FF41] scale-110" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePinInput(num.toString(), type)}
                className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-2xl font-semibold transition-colors"
              >
                {num}
              </button>
            ))}
            <div className="h-16" />
            <button
              onClick={() => handlePinInput("0", type)}
              className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-2xl font-semibold transition-colors"
            >
              0
            </button>
            <button
              onClick={() => handlePinDelete(type)}
              className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 flex items-center justify-center transition-colors"
            >
              <X className="text-white" size={24} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // PIN Success Screen
  if (pinChangeStep === "success" && (currentView === "change-login-pin" || currentView === "change-transaction-pin")) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col items-center justify-center px-5">
        <div className="w-24 h-24 rounded-full bg-[#00FF41]/10 border-2 border-[#00FF41] flex items-center justify-center mb-6">
          <CheckCircle2 className="text-[#00FF41]" size={48} />
        </div>
        <h1 className="text-white text-2xl font-bold mb-2">PIN Changed Successfully!</h1>
        <p className="text-white/50 text-sm mb-8 text-center">
          Your {pinType === "login" ? "login" : "transaction"} PIN has been updated successfully.
        </p>
        <button
          onClick={() => {
            setCurrentView("main")
            resetPinChange()
          }}
          className="w-full max-w-xs h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-2xl transition-all"
        >
          Done
        </button>
      </div>
    )
  }

  // Change Login PIN
  if (currentView === "change-login-pin") {
    return renderPinScreen(pinChangeStep as "current" | "new" | "confirm")
  }

  // Change Transaction PIN
  if (currentView === "change-transaction-pin") {
    return renderPinScreen(pinChangeStep as "current" | "new" | "confirm")
  }

  // Personal Information Screen
  if (currentView === "personal-info") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
        <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/5">
          <button
            onClick={() => setCurrentView("main")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-lg font-bold">Personal Information</h1>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#00FF41]/20">
                <img src="/abstract-profile.png" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#00FF41] rounded-full flex items-center justify-center">
                <Camera className="text-black" size={16} />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <Input
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <Input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <Input
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <Input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-white/40" size={18} />
                <textarea
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none h-24"
                />
              </div>
            </div>
          </div>

          <button className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-2xl transition-all">
            Save Changes
          </button>
        </div>
      </div>
    )
  }

  // Notification Settings Screen
  if (currentView === "notifications") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
        <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/5">
          <button
            onClick={() => setCurrentView("main")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-lg font-bold">Notification Settings</h1>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* Channels */}
          <div className="space-y-2">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider px-2">NOTIFICATION CHANNELS</h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-4 flex items-center gap-3 border-b border-white/5">
                <Bell className="text-white/60" size={18} />
                <span className="text-white text-sm font-medium flex-1">Push Notifications</span>
                <Switch
                  checked={notifications.pushEnabled}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushEnabled: checked })}
                />
              </div>
              <div className="px-4 py-4 flex items-center gap-3 border-b border-white/5">
                <Mail className="text-white/60" size={18} />
                <span className="text-white text-sm font-medium flex-1">Email Notifications</span>
                <Switch
                  checked={notifications.emailEnabled}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailEnabled: checked })}
                />
              </div>
              <div className="px-4 py-4 flex items-center gap-3">
                <MessageSquare className="text-white/60" size={18} />
                <span className="text-white text-sm font-medium flex-1">SMS Notifications</span>
                <Switch
                  checked={notifications.smsEnabled}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, smsEnabled: checked })}
                />
              </div>
            </div>
          </div>

          {/* Alert Types */}
          <div className="space-y-2">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider px-2">ALERT TYPES</h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-4 flex items-center gap-3 border-b border-white/5">
                <CreditCard className="text-white/60" size={18} />
                <div className="flex-1">
                  <span className="text-white text-sm font-medium block">Transaction Alerts</span>
                  <span className="text-white/40 text-xs">Get notified for all transactions</span>
                </div>
                <Switch
                  checked={notifications.transactionAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, transactionAlerts: checked })}
                />
              </div>
              <div className="px-4 py-4 flex items-center gap-3 border-b border-white/5">
                <Shield className="text-white/60" size={18} />
                <div className="flex-1">
                  <span className="text-white text-sm font-medium block">Security Alerts</span>
                  <span className="text-white/40 text-xs">Login attempts and suspicious activity</span>
                </div>
                <Switch
                  checked={notifications.securityAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, securityAlerts: checked })}
                />
              </div>
              <div className="px-4 py-4 flex items-center gap-3">
                <Bot className="text-white/60" size={18} />
                <div className="flex-1">
                  <span className="text-white text-sm font-medium block">Promotional Alerts</span>
                  <span className="text-white/40 text-xs">Deals, offers, and updates</span>
                </div>
                <Switch
                  checked={notifications.promotionalAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, promotionalAlerts: checked })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Help & Support Screen
  if (currentView === "help") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
        <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/5">
          <button
            onClick={() => setCurrentView("main")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-lg font-bold">Help & Support</h1>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* Ask Kumba AI */}
          <div className="bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00FF41]/15 flex items-center justify-center">
                <Bot className="text-[#00FF41]" size={20} />
              </div>
              <div>
                <p className="text-[#00FF41] font-bold text-sm">Ask Kumba AI</p>
                <p className="text-white/50 text-xs">Get instant help with any question</p>
              </div>
            </div>
            <button className="w-full h-11 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-sm rounded-xl transition-all">
              Start Chat with Kumba
            </button>
          </div>

          {/* FAQs */}
          <div className="space-y-2">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider px-2">FREQUENTLY ASKED</h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
              {[
                "How do I reset my PIN?",
                "What are the transfer limits?",
                "How do I verify my account?",
                "Is my money safe?",
                "How do I contact support?",
              ].map((faq, i) => (
                <button
                  key={i}
                  className={`w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors ${i < 4 ? "border-b border-white/5" : ""}`}
                >
                  <HelpCircle className="text-white/40" size={18} />
                  <span className="text-white text-sm font-medium flex-1 text-left">{faq}</span>
                  <ChevronRight className="text-white/30" size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-2">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider px-2">CONTACT US</h3>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
              <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5">
                <Mail className="text-white/60" size={18} />
                <div className="flex-1 text-left">
                  <span className="text-white text-sm font-medium block">Email Support</span>
                  <span className="text-white/40 text-xs">support@korapay.com</span>
                </div>
              </button>
              <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
                <Phone className="text-white/60" size={18} />
                <div className="flex-1 text-left">
                  <span className="text-white text-sm font-medium block">Call Us</span>
                  <span className="text-white/40 text-xs">+234 1 234 5678</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // About Kumbapay Screen
  if (currentView === "about") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
        <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/5">
          <button
            onClick={() => setCurrentView("main")}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-lg font-bold">About Kumbapay</h1>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* Logo & Version */}
          <div className="flex flex-col items-center py-6">
            <div className="w-20 h-20 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/20 flex items-center justify-center mb-4">
              <span className="text-[#00FF41] text-3xl font-bold">K</span>
            </div>
            <h2 className="text-white text-xl font-bold">Kumbapay</h2>
            <p className="text-white/40 text-sm">Version 2.1.0</p>
          </div>

          <p className="text-white/60 text-sm text-center leading-relaxed">
            Kumbapay is Africa's leading AI-powered fintech platform, making payments seamless, secure, and intelligent
            for everyone.
          </p>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
            <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5">
              <FileText className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">Terms of Service</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5">
              <Shield className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">Privacy Policy</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
              <FileText className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">Licenses</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
          </div>

          <p className="text-white/30 text-xs text-center">© 2025 Kumbapay Technologies Ltd. All rights reserved.</p>
        </div>
      </div>
    )
  }

  // Main Settings Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <h1 className="text-white text-lg font-bold">Settings & Profile</h1>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Profile Section */}
        <div className="bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00FF41]/20">
              <img src="/abstract-profile.png" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-white font-bold text-lg">Tunde Johnson</h2>
                <CheckCircle2 className="text-[#00FF41]" size={16} />
              </div>
              <p className="text-white/40 text-sm">@tunde_j</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded text-[#00FF41] text-[10px] font-bold">
                PRO USER
              </span>
            </div>
          </div>

          {/* Ask Kumba AI Quick Action */}
          <div className="bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00FF41]/15 flex items-center justify-center flex-shrink-0">
              <Bot className="text-[#00FF41]" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#00FF41] font-bold text-xs mb-0.5">Ask Kumba AI</p>
              <p className="text-white/70 text-[11px] leading-tight">
                "Change my transaction PIN" or "Turn on biometric login"
              </p>
            </div>
            <button className="text-[#00FF41]">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="space-y-2">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider px-2">ACCOUNT</h3>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
            <button
              onClick={() => setCurrentView("personal-info")}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              <User className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">Personal Information</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
              <Shield className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">KYC Verification</span>
              <span className="px-2 py-0.5 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded text-[#00FF41] text-[10px] font-bold mr-1">
                Level 2
              </span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-2">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider px-2">SECURITY</h3>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
            <button
              onClick={() => {
                setPinType("login")
                setCurrentView("change-login-pin")
              }}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              <svg className="text-white/60" width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-white text-sm font-medium flex-1 text-left">Change Login PIN</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <button
              onClick={() => {
                setPinType("transaction")
                setCurrentView("change-transaction-pin")
              }}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              <CreditCard className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">Change Transaction PIN</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <div className="px-4 py-4 flex items-center gap-3 border-b border-white/5">
              <Fingerprint className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1">Biometric Login</span>
              <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
            </div>
            <div className="px-4 py-4 flex items-center gap-3">
              <svg className="text-white/60" width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-white text-sm font-medium flex-1">AI Fraud Alerts</span>
              <Switch checked={fraudAlertsEnabled} onCheckedChange={setFraudAlertsEnabled} />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider px-2">PREFERENCES</h3>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
            <button
              onClick={() => setCurrentView("notifications")}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              <Bell className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">Notification Settings</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5">
              <Moon className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">App Theme</span>
              <span className="text-white/40 text-sm mr-1">Dark</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <div className="px-4 py-4 flex items-center gap-3">
              <Bot className="text-white/60" size={18} />
              <div className="flex-1">
                <span className="text-white text-sm font-medium block">Kumba as Default Screen</span>
                <span className="text-white/40 text-xs">Open Kumba AI when launching the app</span>
              </div>
              <Switch
                checked={kumbaDefault}
                onCheckedChange={(checked) => {
                  setKumbaDefault(checked)
                  onKumbaDefaultChange?.(checked)
                }}
              />
            </div>
          </div>
        </div>

        {/* Support & Legal */}
        <div className="space-y-2">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider px-2">SUPPORT & LEGAL</h3>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
            <button
              onClick={() => setCurrentView("help")}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              <HelpCircle className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">Help & Support</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5">
              <FileText className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">Privacy Policy</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5">
              <FileText className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">Terms of Service</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
            <button
              onClick={() => setCurrentView("about")}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
              <Info className="text-white/60" size={18} />
              <span className="text-white text-sm font-medium flex-1 text-left">About Kumbapay</span>
              <ChevronRight className="text-white/30" size={18} />
            </button>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={onLogout}
          className="w-full py-4 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>

      <div className="h-20" />
    </div>
  )
}
