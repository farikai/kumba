"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Sparkles, Zap, Clock, TrendingUp, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
  quickActions?: { label: string; action: string }[]
}

const suggestedPrompts = [
  { icon: TrendingUp, text: "Show my spending this week", color: "text-blue-500" },
  { icon: DollarSign, text: "Create a budget for me", color: "text-green-500" },
  { icon: Clock, text: "Set up monthly rent payment", color: "text-orange-500" },
  { icon: Zap, text: "Find me the best deals", color: "text-purple-500" },
]

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi Adekunle! I'm your Korapay AI assistant. I can help you send money, track spending, create budgets, and automate payments. How can I help you today?",
    timestamp: new Date(),
    quickActions: [
      { label: "Send Money", action: "send" },
      { label: "Check Balance", action: "balance" },
      { label: "View Spending", action: "spending" },
    ],
  },
]

export default function AiChatScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: getAiResponse(messageText),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getAiResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("spend") || lowerInput.includes("spent")) {
      return "This week, you've spent ₦45,250. Your biggest expenses were: Food (₦18,000), Transport (₦12,500), and Entertainment (₦8,750). You're 23% under your weekly budget. Great job!"
    }

    if (lowerInput.includes("budget")) {
      return "I've analyzed your spending patterns. I recommend: Food ₦60k/month, Transport ₦40k/month, Bills ₦30k/month, Savings ₦50k/month, Others ₦20k/month. Total: ₦200k/month. Should I set this up?"
    }

    if (lowerInput.includes("balance")) {
      return "Your current balance is ₦250,000.00. You received your salary yesterday and spent ₦5,000 today on transfers."
    }

    if (lowerInput.includes("send") && lowerInput.includes("amina")) {
      return "I can help you send money to Amina. How much would you like to send? Once you tell me, I'll ask for your PIN to confirm."
    }

    return (
      "I understand you want to " +
      input +
      ". I can help with that! Could you provide more details so I can assist you better?"
    )
  }

  const handleQuickAction = (action: string) => {
    if (action === "send") handleSendMessage("Send money")
    else if (action === "balance") handleSendMessage("Check my balance")
    else if (action === "spending") handleSendMessage("Show my spending this week")
  }

  const handleSuggestedPrompt = (text: string) => {
    handleSendMessage(text)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pt-8 pb-4 px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.length === 1 && (
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-muted-foreground">Suggested actions</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, index) => {
                const Icon = prompt.icon
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    className="flex items-start gap-2 p-3 bg-secondary/60 rounded-xl border border-border/50 hover:bg-secondary transition-all text-left"
                  >
                    <Icon size={18} className={prompt.color} />
                    <span className="text-xs font-medium flex-1">{prompt.text}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] space-y-2 ${message.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-accent to-primary text-white rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>

              {message.quickActions && (
                <div className="flex flex-wrap gap-2">
                  {message.quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.action)}
                      className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-xs font-medium hover:bg-accent/20 transition-all border border-accent/20"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground px-2">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4 pb-6">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-all active:scale-95">
            <Mic size={20} className="text-foreground" />
          </button>

          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything..."
              className="pr-12 scanpay-input"
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              inputValue.trim()
                ? "bg-gradient-to-br from-accent to-primary text-white"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
