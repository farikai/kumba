"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "@/components/session-provider"
import {
  ArrowLeft,
  Send,
  Bot,
  Sparkles,
  MoreVertical,
  Volume2,
  Loader2,
  Mic,
  Check,
  Share2,
  AlertCircle,
  User,
  ChevronRight,
} from "lucide-react"

interface KumbaChatScreenProps {
  onBack: () => void
  onNavigate: (screen: string, data?: any) => void
  userId?: string | null
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  action?: {
    type: string
    data: any
  }
  receipt?: {
    type: string
    amount: number
    ref: string
    whatsappUrl: string
  }
  suggestions?: {
    type: "beneficiary" | "product" | "generic"
    items: { id: string; label: string; description?: string; data?: any }[]
  }
}

export default function KumbaChatScreen({ onBack, onNavigate, userId }: KumbaChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm Kumba, your AI financial assistant. I can help you:\n\n• Send money to contacts\n• Schedule recurring payments\n• Shop online and find deals\n• Buy airtime and data\n• Track your budget\n\nWhat would you like to do?",
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [pendingAction, setPendingAction] = useState<any>(null)
  const [pinDots, setPinDots] = useState<string[]>([])
  const [pinError, setPinError] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [showPinInput, setShowPinInput] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const recognitionRef = useRef<any>(null)
  const { session } = useSession()
  const activeUserId = session?.userId ?? userId ?? null
  const activeToken = session?.sessionToken ?? null

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputText(transcript)
          setIsListening(false)
          sendMessage(transcript)
        }
        recognitionRef.current.onend = () => setIsListening(false)
        recognitionRef.current.onerror = () => setIsListening(false)
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const speakText = useCallback((text: string) => {
    if (synthRef.current && text) {
      synthRef.current.cancel()
      const cleanText = text.replace(/[🎯💰📊💸🛒📈👋•\n₦]/gu, " ").replace(/\s+/g, " ")
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1.0
      utterance.pitch = 1.1
      const voices = synthRef.current.getVoices()
      const preferredVoice = voices.find(
        (v) => v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.lang.startsWith("en"),
      )
      if (preferredVoice) utterance.voice = preferredVoice
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      synthRef.current.speak(utterance)
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    if (!activeUserId || !activeToken) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "You are not logged in, so I can't access your wallet data. Restart the app and log in first.",
        },
      ])
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)
    setPendingAction(null)
    setShowPinInput(false)
    setPinDots([])
    setPinError("")

    try {
      const res = await fetch("/api/kumba-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUserId,
          sessionToken: activeToken,
          messages: messages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const content = data.content || "Got it! What else can I help with?"
      const receipt = data.receipt

      if (data.navigateAction) {
        onNavigate(data.navigateAction)
        return
      }

      if (data.pendingAction) {
        setPendingAction(data.pendingAction)
        setShowPinInput(true)
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content,
        receipt,
        action: data.action,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Connection error"
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Sorry, I'm having trouble connecting right now. (${errMsg})\nPlease try again or use the menu below.`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinDigit = (digit: string) => {
    if (pinDots.length < 4) {
      const newDots = [...pinDots, digit]
      setPinDots(newDots)
      setPinError("")
      if (newDots.length === 4) {
        executeWithPin(newDots.join(""))
      }
    }
  }

  const handlePinDelete = () => {
    setPinDots(pinDots.slice(0, -1))
    setPinError("")
  }

  const executeWithPin = async (pin: string) => {
    if (!pendingAction) return
    if (!activeUserId || !activeToken) {
      setPinError("Session expired. Log in again.")
      return
    }
    setIsExecuting(true)
    setPinError("")

    try {
      const res = await fetch("/api/kumba-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUserId,
          sessionToken: activeToken,
          toolCalls: pendingAction.toolCalls,
          pin,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 403) {
          setPinError("Incorrect PIN. Try again.")
          setPinDots([])
          setIsExecuting(false)
          return
        }
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const failed = (data.results ?? []).filter((r: any) => r?.result?.success === false || r?.result?.debitError)
      const outcome = failed.length === 0
        ? `✅ Transaction completed successfully!${data.receipt?.whatsappUrl ? `\n\n[Share receipt on WhatsApp](${data.receipt.whatsappUrl})` : ""}`
        : `⚠️ Some actions failed:\n${failed.map((r: any) => `• ${r.name}: ${r?.result?.error ?? r?.result?.debitError ?? "failed"}`).join("\n")}`
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: outcome,
        },
      ])
      setPendingAction(null)
      setShowPinInput(false)
      setPinDots([])
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Execution failed"
      setPinError(errMsg)
      setPinDots([])
    }

    setIsExecuting(false)
  }

  const handleSend = () => {
    if (inputText.trim()) sendMessage(inputText)
  }

  const handleSelectSuggestion = (suggestion: { id: string; label: string; description?: string; data?: any }) => {
    sendMessage(suggestion.label)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/5 bg-[#0a1a12]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                isSpeaking ? "bg-[#00FF41] border-[#00FF41]" : "bg-[#00FF41]/20 border-[#00FF41]/30"
              }`}
            >
              {isSpeaking ? (
                <Volume2 className="text-black animate-pulse" size={20} />
              ) : (
                <Bot className="text-[#00FF41]" size={20} />
              )}
            </div>
            <div>
              <h1 className="text-white font-bold text-base">Kumba AI</h1>
              <p className="text-[#00FF41] text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#00FF41] rounded-full" />
                {isLoading ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
          <MoreVertical className="text-white" size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => {
            const isAssistant = message.role === "assistant"

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
              >
                <div className="max-w-[85%]">
                  {isAssistant && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 mb-1 ml-1"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
                        <Sparkles className="text-[#00FF41]" size={12} />
                      </div>
                      <span className="text-[#00FF41] text-xs font-medium">Kumba</span>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={`rounded-2xl px-4 py-3 ${
                      isAssistant
                        ? "bg-white/5 border border-white/10 text-white rounded-bl-md"
                        : "bg-[#00FF41] text-black rounded-br-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </motion.div>

                  {/* Suggestion Cards */}
                  {isAssistant && message.suggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 space-y-1.5"
                    >
                      {message.suggestions.items.map((item) => (
                        <motion.button
                          key={item.id}
                          whileHover={{ scale: 1.01, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full flex items-center gap-3 bg-[#00FF41]/5 border border-[#00FF41]/20 hover:bg-[#00FF41]/10 hover:border-[#00FF41]/40 rounded-xl px-3.5 py-3 transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 flex items-center justify-center flex-shrink-0">
                            {message.suggestions!.type === "beneficiary" ? (
                              <User className="text-[#00FF41]" size={16} />
                            ) : (
                              <Sparkles className="text-[#00FF41]" size={16} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{item.label}</p>
                            {item.description && (
                              <p className="text-white/50 text-xs truncate">{item.description}</p>
                            )}
                          </div>
                          <ChevronRight className="text-white/30 flex-shrink-0" size={16} />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {/* Receipt card */}
                  {isAssistant && message.receipt && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-2 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#00FF41] text-xs font-medium">Transaction Complete</span>
                        <span className="text-white text-xs font-bold">₦{message.receipt.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-white/50 text-xs mb-2">Ref: {message.receipt.ref}</p>
                      <a
                        href={message.receipt.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#00FF41] hover:underline"
                      >
                        <Share2 size={12} /> Share receipt on WhatsApp
                      </a>
                    </motion.div>
                  )}

                  {/* Action buttons */}
                  {isAssistant && message.action && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onNavigate(message.action!.type, message.action!.data)}
                      className="mt-2 w-full bg-[#00FF41] text-black rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#00FF41]/90 transition-colors"
                    >
                      <Check size={16} /> Continue
                    </motion.button>
                  )}

                  {isAssistant && message.content && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => speakText(message.content)}
                      className="mt-2 flex items-center gap-1 text-white/40 text-xs hover:text-white/60"
                    >
                      <Volume2 size={12} />
                      {isSpeaking ? "Speaking..." : "Listen"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* PIN Confirmation */}
      {showPinInput && pendingAction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-3"
        >
          <div className="bg-gradient-to-br from-[#00FF41]/10 to-transparent border border-[#00FF41]/30 rounded-2xl p-4">
            <p className="text-white text-xs mb-3 text-center">Enter your 4-digit PIN to confirm</p>
            <div className="flex justify-center gap-3 mb-3">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: pinDots[i] ? [1, 1.15, 1] : 1,
                    backgroundColor: pinDots[i] ? '#00FF41' : i === pinDots.length ? 'transparent' : 'transparent',
                    borderColor: pinDots[i] ? '#00FF41' : i === pinDots.length ? '#00FF41' : 'rgba(255,255,255,0.2)',
                  }}
                  className="w-12 h-12 rounded-xl border-2 flex items-center justify-center"
                >
                  {pinDots[i] && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 rounded-full bg-black" />}
                </motion.div>
              ))}
            </div>
            {pinError && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center gap-1 mb-2">
                <AlertCircle size={12} className="text-red-400" />
                <span className="text-red-400 text-xs">{pinError}</span>
              </motion.div>
            )}
            {isExecuting && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 mb-2">
                <Loader2 size={14} className="text-[#00FF41] animate-spin" />
                <span className="text-white/60 text-xs">Processing...</span>
              </motion.div>
            )}
            <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} onClick={() => handlePinDigit(n.toString())} disabled={isExecuting}
                  className="h-10 rounded-xl bg-white/5 text-white text-base font-medium hover:bg-white/10 transition-colors disabled:opacity-30">{n}</button>
              ))}
              <div />
              <button onClick={() => handlePinDigit("0")} disabled={isExecuting}
                className="h-10 rounded-xl bg-white/5 text-white text-base font-medium hover:bg-white/10 transition-colors disabled:opacity-30">0</button>
              <button onClick={handlePinDelete} disabled={isExecuting}
                className="h-10 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors disabled:opacity-30 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>
            <button onClick={() => { setShowPinInput(false); setPendingAction(null); setPinDots([]) }}
              className="w-full mt-2 text-center text-white/40 text-xs hover:text-white/60">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-white/40 text-xs mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {["Send 5k to Mom", "Schedule rent", "Order rice", "My budget", "Buy data"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs hover:bg-white/10 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-white/5 bg-[#0a1a12]/80 backdrop-blur-xl">
        <div className="flex gap-2">
          <button
            onClick={startListening}
            disabled={isListening || isLoading}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isListening ? "bg-[#00FF41] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <Mic size={20} className={isListening ? "animate-pulse" : ""} />
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask Kumba anything..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 rounded-xl bg-[#00FF41] flex items-center justify-center disabled:opacity-30"
          >
            {isLoading ? (
              <Loader2 size={20} className="text-black animate-spin" />
            ) : (
              <Send size={20} className="text-black" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
