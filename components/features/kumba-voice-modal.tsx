"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Mic, MicOff, Send, Bot, Loader2, Keyboard, Volume2, Check, AlertCircle } from "lucide-react"

interface KumbaVoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (screen: string, data?: any) => void
  userId?: string | null
}

interface PendingAction {
  toolCalls: { name: string; args: Record<string, any> }[]
  balance: number
}

export default function KumbaVoiceModal({ isOpen, onClose, onNavigate, userId }: KumbaVoiceModalProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [kumbaResponse, setKumbaResponse] = useState("")
  const [showResponse, setShowResponse] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(24).fill(4))
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasRealSpeech, setHasRealSpeech] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [pinDots, setPinDots] = useState<string[]>([])
  const [pinError, setPinError] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"
        setHasRealSpeech(true)

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptText = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcriptText
            } else {
              interimTranscript += transcriptText
            }
          }
          setTranscript(finalTranscript || interimTranscript)
        }

        recognitionRef.current.onerror = () => setIsListening(false)
        recognitionRef.current.onend = () => setIsListening(false)
      }

      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
      if (synthRef.current) synthRef.current.cancel()
    }
  }, [])

  useEffect(() => {
    if (isListening || isSpeaking) {
      animationRef.current = setInterval(() => {
        setWaveHeights(
          Array(24).fill(0).map(() => 4 + Math.random() * (isListening ? 48 : 32)),
        )
      }, 80)
    } else {
      if (animationRef.current) clearInterval(animationRef.current)
      setWaveHeights(Array(24).fill(4))
    }
    return () => {
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [isListening, isSpeaking])

  useEffect(() => {
    if (showTextInput && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showTextInput])

  useEffect(() => {
    if (!isOpen) {
      setTranscript("")
      setKumbaResponse("")
      setShowResponse(false)
      setIsListening(false)
      setIsProcessing(false)
      setShowTextInput(false)
      setIsSpeaking(false)
      setPendingAction(null)
      setPinDots([])
      setPinError("")
      setIsExecuting(false)
      setExecutionResult(null)
      if (recognitionRef.current) recognitionRef.current.abort()
      if (synthRef.current) synthRef.current.cancel()
    }
  }, [isOpen])

  const speakResponse = useCallback((text: string) => {
    if (synthRef.current && text) {
      synthRef.current.cancel()
      const cleanText = text.replace(/[🎯💰📊💸🛒📈👋•\n₦]/gu, " ").replace(/\s+/g, " ")
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1.0
      utterance.pitch = 1.1

      const setVoice = () => {
        const voices = synthRef.current?.getVoices() || []
        const preferredVoice =
          voices.find(
            (v) =>
              v.name.includes("Samantha") ||
              v.name.includes("Google UK English Female") ||
              (v.lang.startsWith("en") && v.name.toLowerCase().includes("female")),
          ) || voices.find((v) => v.lang.startsWith("en"))
        if (preferredVoice) utterance.voice = preferredVoice
      }

      if ((synthRef.current.getVoices() || []).length > 0) {
        setVoice()
      } else {
        synthRef.current.onvoiceschanged = setVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      synthRef.current.speak(utterance)
    }
  }, [])

  const startListening = () => {
    setIsListening(true)
    setShowResponse(false)
    setKumbaResponse("")
    setTranscript("")
    setPendingAction(null)
    setPinDots([])
    setPinError("")
    setExecutionResult(null)
    if (recognitionRef.current && hasRealSpeech) {
      try { recognitionRef.current.start() } catch {}
    }
  }

  const stopListening = () => {
    setIsListening(false)
    if (recognitionRef.current && hasRealSpeech) {
      recognitionRef.current.stop()
    }
    if (transcript) {
      processWithAI(transcript)
    }
  }

  const processWithAI = async (command: string) => {
    setIsProcessing(true)

    try {
      const updatedHistory = [...chatHistory, { role: "user", content: command }]
      setChatHistory(updatedHistory)

      const res = await fetch("/api/kumba-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "demo-user",
          messages: updatedHistory,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      const content = data.content || "Got it!"

      if (data.navigateAction) {
        setKumbaResponse(content)
        speakResponse(content)
        setShowResponse(true)
        setTimeout(() => {
          onClose()
          onNavigate(data.navigateAction)
        }, 1200)
        return
      }

      if (data.pendingAction) {
        setPendingAction(data.pendingAction)
        setKumbaResponse(content)
        speakResponse(content + " Please enter your PIN to confirm.")
        setShowResponse(true)
      } else {
        setKumbaResponse(content)
        speakResponse(content)
        setShowResponse(true)
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Connection error"
      const fallback = `I'm having trouble connecting. (${errMsg}) Please try again or type your request.`
      setKumbaResponse(fallback)
      speakResponse(fallback)
      setShowResponse(true)
    }

    setIsProcessing(false)
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
    setIsExecuting(true)
    setPinError("")

    try {
      const res = await fetch("/api/kumba-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "demo-user",
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

      setExecutionResult(data)
      setPendingAction(null)
      setPinDots([])

      const successMsg = `Done! The transaction was successful.`
      setKumbaResponse(successMsg)
      speakResponse(successMsg)
      setShowResponse(true)
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Execution failed"
      setPinError(errMsg)
      setPinDots([])
    }

    setIsExecuting(false)
  }

  const handleTextSubmit = () => {
    if (transcript.trim()) {
      processWithAI(transcript)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#0f2a1c] to-[#0a1a12] rounded-t-[32px] border-t border-x border-[#00FF41]/20 px-6 pt-4 pb-8"
        style={{ maxHeight: "90vh", animation: "slideUp 0.3s ease-out" }}
      >
        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X size={20} className="text-white" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
              isSpeaking ? "bg-[#00FF41] shadow-lg shadow-[#00FF41]/50" : "bg-[#00FF41]/20 border-2 border-[#00FF41]/30"
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="text-black animate-pulse" size={28} />
            ) : (
              <Bot className="text-[#00FF41]" size={28} />
            )}
          </div>
          <h2 className="text-white font-bold text-lg">
            {isSpeaking ? "Kumba is speaking..." : isListening ? "Listening..." : isProcessing ? "Processing..." : executionResult ? "Transaction Complete" : pendingAction ? "Enter PIN to Confirm" : "Talk to Kumba"}
          </h2>
          <p className="text-white/50 text-xs">
            {hasRealSpeech ? "Voice recognition active" : "Type or use suggestions"}
          </p>
        </div>

        {/* Waveform */}
        <div className="flex items-center justify-center gap-[2px] h-12 mb-4">
          {waveHeights.map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-75 ${
                isSpeaking ? "bg-[#00FF41]" : isListening ? "bg-[#00FF41]" : "bg-white/20"
              }`}
              style={{ height: `${height}px`, opacity: isListening || isSpeaking ? 0.6 + Math.random() * 0.4 : 0.3 }}
            />
          ))}
        </div>

        {/* Transcript */}
        {transcript && !pendingAction && !executionResult && (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 mb-3">
            <p className="text-white text-center text-sm">{transcript}</p>
          </div>
        )}

        {/* Kumba's response */}
        {showResponse && !pendingAction && !executionResult && (
          <div className="w-full bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-2xl p-3 mb-4 max-h-32 overflow-y-auto">
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">{kumbaResponse}</p>
          </div>
        )}

        {/* Pending action + PIN */}
        {pendingAction && (
          <div className="w-full bg-gradient-to-br from-[#00FF41]/10 to-transparent border border-[#00FF41]/30 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot size={16} className="text-[#00FF41]" />
              <span className="text-white text-sm font-medium">Confirm Transaction</span>
            </div>
            {pendingAction.toolCalls.map((tc, i) => (
              <div key={i} className="mb-2">
                <p className="text-white text-xs leading-relaxed">{kumbaResponse}</p>
              </div>
            ))}

            {/* PIN Dots */}
            <div className="flex justify-center gap-3 my-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                    pinDots[i] ? "bg-[#00FF41] border-[#00FF41]" : i === pinDots.length ? "border-[#00FF41]/50" : "border-white/20"
                  }`}
                >
                  {pinDots[i] && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                </div>
              ))}
            </div>

            {pinError && (
              <div className="flex items-center gap-1 mb-3 justify-center">
                <AlertCircle size={12} className="text-red-400" />
                <span className="text-red-400 text-xs">{pinError}</span>
              </div>
            )}

            {isExecuting && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <Loader2 size={14} className="text-[#00FF41] animate-spin" />
                <span className="text-white/60 text-xs">Verifying and processing...</span>
              </div>
            )}

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  onClick={() => handlePinDigit(n.toString())}
                  disabled={isExecuting}
                  className="h-12 rounded-xl bg-white/5 text-white text-lg font-medium hover:bg-white/10 transition-colors disabled:opacity-30"
                >
                  {n}
                </button>
              ))}
              <div />
              <button
                onClick={() => handlePinDigit("0")}
                disabled={isExecuting}
                className="h-12 rounded-xl bg-white/5 text-white text-lg font-medium hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                0
              </button>
              <button
                onClick={handlePinDelete}
                disabled={isExecuting}
                className="h-12 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors disabled:opacity-30 flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Execution result */}
        {executionResult && (
          <div className="w-full bg-gradient-to-br from-[#00FF41]/10 to-transparent border border-[#00FF41]/30 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Check size={16} className="text-[#00FF41]" />
              <span className="text-[#00FF41] font-bold text-sm">Successful</span>
            </div>
            {executionResult.results?.map((r: any, i: number) => (
              <div key={i} className="text-white text-xs space-y-1">
                <p>Transaction completed successfully!</p>
                {executionResult.receipt?.whatsappUrl && (
                  <a
                    href={executionResult.receipt.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00FF41] underline inline-block mt-1"
                  >
                    Share receipt on WhatsApp →
                  </a>
                )}
              </div>
            ))}
            <button
              onClick={() => {
                setExecutionResult(null)
                setShowResponse(false)
                setKumbaResponse("")
              }}
              className="w-full mt-3 h-10 bg-white/10 rounded-xl text-white text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Done — ask something else
            </button>
          </div>
        )}

        {/* Mic button */}
        {!showTextInput && !pendingAction && !executionResult && (
          <div className="flex justify-center mb-4">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              className="relative"
            >
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[#00FF41]/30 animate-ping" />
                  <div className="absolute -inset-3 rounded-full bg-[#00FF41]/20 animate-pulse" />
                </>
              )}
              <div
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? "bg-[#00FF41] shadow-xl shadow-[#00FF41]/50"
                    : "bg-white/10 border-2 border-[#00FF41]/50 hover:bg-[#00FF41]/20"
                }`}
              >
                {isListening ? <MicOff size={28} className="text-black" /> : <Mic size={28} className="text-[#00FF41]" />}
              </div>
            </button>
          </div>
        )}

        {/* Text input */}
        {showTextInput && !pendingAction && !executionResult && (
          <div className="w-full flex gap-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your request..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
              className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF41]/50 text-sm"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!transcript.trim() || isProcessing}
              className="w-12 h-12 rounded-xl bg-[#00FF41] flex items-center justify-center disabled:opacity-30"
            >
              <Send size={18} className="text-black" />
            </button>
          </div>
        )}

        {/* Toggle */}
        {!pendingAction && !executionResult && (
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 rounded-xl text-white/60 text-sm hover:bg-white/10 transition-colors mb-3"
          >
            {showTextInput ? <><Mic size={14} /> Use voice</> : <><Keyboard size={14} /> Type instead</>}
          </button>
        )}

        {/* Quick suggestions */}
        {!pendingAction && !executionResult && (
          <div className="flex flex-wrap gap-2 justify-center">
            {["Send to Mom", "Schedule rent", "Buy airtime", "Order rice", "My budget"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setTranscript(suggestion)
                  processWithAI(suggestion)
                }}
                disabled={isProcessing}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
