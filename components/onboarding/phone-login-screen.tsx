"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Shield, ArrowRight } from "lucide-react"

interface PhoneLoginScreenProps {
  onSubmit: (phone: string, name: string, mode: "register" | "login") => void
  onBack?: () => void
}

export default function PhoneLoginScreen({ onSubmit, onBack }: PhoneLoginScreenProps) {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [mode, setMode] = useState<"register" | "login">("register")
  const [countryCode, setCountryCode] = useState("+234")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone && phone.length >= 10 && (mode === "login" || name.trim().length >= 2)) {
      onSubmit(countryCode + phone, name.trim(), mode)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2818] via-[#0f3a24] to-[#0a2818] flex flex-col">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#00FF41]/5 blur-[100px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          type="button"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors active:bg-white/15"
        >
          <ArrowLeft className="text-white" size={20} />
        </motion.button>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 bg-[#00FF41]/10 px-3 py-1.5 rounded-full border border-[#00FF41]/30"
        >
          <Shield className="text-[#00FF41]" size={14} />
          <span className="text-[#00FF41] text-xs font-bold tracking-wide">SECURE</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8 max-w-md mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-10"
        >
          <h1 className="text-white text-3xl font-bold tracking-tight">Let&apos;s get started</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Enter your mobile number to create your smart wallet. We&apos;ll send a code to verify it&apos;s you.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Register / Login toggle */}
          <div className="flex gap-2 bg-black/20 border border-white/10 rounded-xl p-1">
            {(["register", "login"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 h-10 rounded-lg font-semibold text-sm transition-all ${
                  mode === m ? "bg-[#00FF41] text-black" : "text-white/60 hover:text-white"
                }`}
              >
                {m === "register" ? "Create account" : "Log in"}
              </button>
            ))}
          </div>

          {mode === "register" && (
            <div className="space-y-3">
              <label htmlFor="name" className="text-white text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Adaeze Okafor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 bg-black/20 border border-white/10 text-white placeholder:text-white/30 rounded-xl text-base flex-1 hover:bg-black/30 focus:bg-black/40 transition-colors"
              />
            </div>
          )}
          <div className="space-y-3">
            <label htmlFor="phone" className="text-white text-sm font-medium">
              Mobile Number
            </label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-24 h-14 bg-black/20 border border-white/10 text-white rounded-xl hover:bg-black/30 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f3a24] border-white/10">
                  <SelectItem value="+234" className="text-white">🇳🇬 +234</SelectItem>
                  <SelectItem value="+254" className="text-white">🇰🇪 +254</SelectItem>
                  <SelectItem value="+256" className="text-white">🇺🇬 +256</SelectItem>
                  <SelectItem value="+233" className="text-white">🇬🇭 +233</SelectItem>
                  <SelectItem value="+27" className="text-white">🇿🇦 +27</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                placeholder="80 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 bg-black/20 border border-white/10 text-white placeholder:text-white/30 rounded-xl text-base flex-1 hover:bg-black/30 focus:bg-black/40 transition-colors"
              />
            </div>
          </div>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#00FF41]/20"
            >
              Continue
              <ArrowRight size={20} />
            </Button>
          </motion.div>

          <p className="text-center text-white/40 text-xs leading-relaxed">
            By continuing, you agree to our <span className="text-[#00FF41]">Terms</span> &{" "}
            <span className="text-[#00FF41]">Privacy Policy</span>
          </p>
        </motion.form>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center relative z-10">
        <p className="text-white/20 text-[10px] font-semibold tracking-[0.2em] uppercase">Next World Innovation</p>
      </div>
    </div>
  )
}
