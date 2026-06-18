"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Mic, MicOff, Sparkles, X, CheckCircle2, Send, Volume2 } from "lucide-react"

interface VoiceCommandScreenProps {
  onBack: () => void
  onNavigate?: (screen: string, data?: Record<string, unknown>) => void
}

interface Message {
  id: number
  type: "user" | "kora"
  text: string
  timestamp: Date
  action?: {
    type: "send" | "schedule" | "shop" | "budget" | "balance"
    data?: Record<string, unknown>
  }
}

const suggestedCommands = [
  { text: "Send 5000 naira to Mom", icon: "💸" },
  { text: "Pay my electricity bill", icon: "⚡" },
  { text: "Schedule rent payment for Friday", icon: "📅" },
  { text: "Find the cheapest bag of rice", icon: "🛒" },
  { text: "How much did I spend this week?", icon: "📊" },
  { text: "What's my balance?", icon: "💰" },
]

export default function VoiceCommandScreen({ onBack, onNavigate }: VoiceCommandScreenProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "kora",
      text: "Hi! I'm Kumba, your AI financial assistant. How can I help you today? You can speak or type your request.",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingAction, setPendingAction] = useState<Message["action"] | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      text: command,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    setTimeout(() => {
      let koraResponse: Message

      // Parse command and generate appropriate response
      if (lowerCommand.includes("send") && lowerCommand.includes("to")) {
        const amountMatch = lowerCommand.match(/(\d+)/g)
        const amount = amountMatch ? amountMatch[0] : "5000"
        const recipientMatch = lowerCommand.match(/to\s+(\w+)/i)
        const recipient = recipientMatch ? recipientMatch[1] : "Mom"

        koraResponse = {
          id: Date.now() + 1,
          type: "kora",
          text: `I'll send ₦${Number(amount).toLocaleString()} to ${recipient}. Would you like me to proceed with this transfer?`,
          timestamp: new Date(),
          action: {
            type: "send",
            data: { amount, recipient },
          },
        }
        setPendingAction(koraResponse.action)
        setShowConfirmation(true)
      } else if (lowerCommand.includes("schedule") || lowerCommand.includes("remind")) {
        koraResponse = {
          id: Date.now() + 1,
          type: "kora",
          text: "I can help you schedule that payment. When would you like this payment to go out, and how much should I set aside?",
          timestamp: new Date(),
          action: { type: "schedule" },
        }
      } else if (lowerCommand.includes("balance") || lowerCommand.includes("how much do i have")) {
        koraResponse = {
          id: Date.now() + 1,
          type: "kora",
          text: "Your current balance is ₦842,300.50. You've spent ₦45,200 this week, which is 15% less than last week. Great job saving!",
          timestamp: new Date(),
          action: { type: "balance" },
        }
      } else if (lowerCommand.includes("spend") || lowerCommand.includes("spending")) {
        koraResponse = {
          id: Date.now() + 1,
          type: "kora",
          text: "This week you've spent ₦45,200 across 12 transactions. Your biggest expenses were: Food & Groceries (₦18,500), Transportation (₦12,000), and Utilities (₦8,700).",
          timestamp: new Date(),
          action: { type: "budget" },
        }
      } else if (
        lowerCommand.includes("shop") ||
        lowerCommand.includes("buy") ||
        lowerCommand.includes("find") ||
        lowerCommand.includes("cheapest")
      ) {
        koraResponse = {
          id: Date.now() + 1,
          type: "kora",
          text: "I'll help you find the best deals! Let me search across multiple stores for you. What specific product are you looking for?",
          timestamp: new Date(),
          action: { type: "shop" },
        }
      } else if (lowerCommand.includes("pay") && lowerCommand.includes("bill")) {
        koraResponse = {
          id: Date.now() + 1,
          type: "kora",
          text: "I found your pending electricity bill of ₦12,500 from IKEDC. Would you like me to pay it now?",
          timestamp: new Date(),
          action: {
            type: "send",
            data: { amount: "12500", recipient: "IKEDC", isBill: true },
          },
        }
        setPendingAction(koraResponse.action)
        setShowConfirmation(true)
      } else {
        koraResponse = {
          id: Date.now() + 1,
          type: "kora",
          text: "I can help you with sending money, scheduling payments, checking your balance, tracking spending, or finding the best deals online. What would you like to do?",
          timestamp: new Date(),
        }
      }

      setMessages((prev) => [...prev, koraResponse])
      setIsProcessing(false)
    }, 1500)
  }

  const handleStartListening = () => {
    setIsListening(true)
    setTranscript("")

    // Simulate voice recognition
    setTimeout(() => {
      const simulatedTranscripts = [
        "Send 5000 naira to Mom",
        "What's my balance",
        "Pay my electricity bill",
        "How much did I spend this week",
      ]
      const randomTranscript = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)]
      setTranscript(randomTranscript)
    }, 1500)

    setTimeout(() => {
      setIsListening(false)
      if (transcript) {
        processCommand(transcript)
        setTranscript("")
      }
    }, 3000)
  }

  const handleStopListening = () => {
    setIsListening(false)
    if (transcript) {
      processCommand(transcript)
      setTranscript("")
    }
  }

  const handleSendMessage = () => {
    if (inputText.trim()) {
      processCommand(inputText.trim())
      setInputText("")
    }
  }

  const handleConfirmAction = () => {
    setShowConfirmation(false)
    if (pendingAction) {
      const confirmMessage: Message = {
        id: Date.now(),
        type: "kora",
        text: "Perfect! I'll take you to complete this transaction securely.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, confirmMessage])

      setTimeout(() => {
        if (pendingAction.type === "send" && onNavigate) {
          onNavigate("sendMoney", pendingAction.data)
        }
      }, 1000)
    }
    setPendingAction(null)
  }

  const handleCancelAction = () => {
    setShowConfirmation(false)
    setPendingAction(null)
    const cancelMessage: Message = {
      id: Date.now(),
      type: "kora",
      text: "No problem! Is there anything else I can help you with?",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, cancelMessage])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00FF41]/15 flex items-center justify-center">
              <Sparkles className="text-[#00FF41]" size={16} />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold">Kumba AI</h1>
              <p className="text-[#00FF41] text-xs">Online • Ready to help</p>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Volume2 className="text-white/60" size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.type === "user"
                  ? "bg-[#00FF41] text-black rounded-br-sm"
                  : "bg-white/5 border border-white/10 text-white rounded-bl-sm"
              }`}
            >
              {message.type === "kora" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="text-[#00FF41]" size={12} />
                  <span className="text-[#00FF41] text-[10px] font-bold">KORA AI</span>
                </div>
              )}
              <p className={`text-sm leading-relaxed ${message.type === "user" ? "font-medium" : ""}`}>
                {message.text}
              </p>
              <p
                className={`text-[10px] mt-1 ${message.type === "user" ? "text-black/50" : "text-white/30"} text-right`}
              >
                {message.timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div
                    className="w-2 h-2 rounded-full bg-[#00FF41] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-[#00FF41] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-white/50 text-xs">Kumba is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-5 z-50">
          <div className="bg-[#0f2a1c] border border-white/10 rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#00FF41]/15 flex items-center justify-center">
                <CheckCircle2 className="text-[#00FF41]" size={20} />
              </div>
              <h3 className="text-white font-bold text-lg">Confirm Action</h3>
            </div>
            <p className="text-white/70 text-sm mb-6">
              {pendingAction?.data &&
                `Send ₦${Number(pendingAction.data.amount).toLocaleString()} to ${pendingAction.data.recipient}?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelAction}
                className="flex-1 h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 h-12 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-sm rounded-xl transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Commands */}
      {messages.length <= 2 && !isListening && (
        <div className="px-5 pb-4">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Try saying:</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {suggestedCommands.map((cmd, i) => (
              <button
                key={i}
                onClick={() => processCommand(cmd.text)}
                className="flex-shrink-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
              >
                <span>{cmd.icon}</span>
                <span className="text-white/80 text-xs whitespace-nowrap">{cmd.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Indicator */}
      {isListening && (
        <div className="px-5 pb-4">
          <div className="bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#00FF41]/20 flex items-center justify-center animate-pulse">
                <Mic className="text-[#00FF41]" size={24} />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[#00FF41] animate-ping" />
            </div>
            <div className="flex-1">
              <p className="text-[#00FF41] font-bold text-sm">Listening...</p>
              <p className="text-white/70 text-sm">{transcript || "Speak now..."}</p>
            </div>
            <button
              onClick={handleStopListening}
              className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"
            >
              <X className="text-red-500" size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-5 pb-6 pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={isProcessing}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
              isListening ? "bg-red-500 hover:bg-red-600" : "bg-[#00FF41] hover:bg-[#00FF41]/90 shadow-[#00FF41]/20"
            } disabled:opacity-50`}
          >
            {isListening ? <MicOff className="text-white" size={24} /> : <Mic className="text-black" size={24} />}
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="w-full h-12 pl-4 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 outline-none focus:border-[#00FF41]/50 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#00FF41] flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <Send className="text-black" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
