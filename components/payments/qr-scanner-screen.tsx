"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Zap, ImageIcon, HistoryIcon, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OcrResultSheet } from "./ocr-result-sheet"

interface QrScannerScreenProps {
  onBack: () => void
  onScanComplete?: () => void
}

export default function QrScannerScreen({ onBack, onScanComplete }: QrScannerScreenProps) {
  const [scanning, setScanning] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const [mode, setMode] = useState<"qr" | "account">("qr")
  const [cameraActive, setCameraActive] = useState(false)
  const [useSimulated, setUseSimulated] = useState(false)
  const [showOcrResult, setShowOcrResult] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let mounted = true

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (mounted) {
          setUseSimulated(true)
          setCameraActive(true)
        }
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream

          try {
            await videoRef.current.play()
            if (mounted) setCameraActive(true)
          } catch {
            // Video play failed, use simulated view
            if (mounted) {
              setUseSimulated(true)
              setCameraActive(true)
            }
          }
        }
      } catch {
        if (mounted) {
          setUseSimulated(true)
          setCameraActive(true)
        }
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (scanning && cameraActive) {
      const timer = setTimeout(() => {
        setDetecting(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [scanning, cameraActive])

  const handleSimulatedScan = () => {
    if (mode === "account") {
      setShowOcrResult(true)
    } else if (onScanComplete) {
      onScanComplete()
    }
  }

  const handleGalleryPick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      // Simulate scan completion after file selection
      setDetecting(true)
      setTimeout(() => {
        if (mode === "account") {
          setShowOcrResult(true)
        } else if (onScanComplete) {
          onScanComplete()
        }
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {useSimulated ? (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 opacity-20">
            {/* Simulated camera pattern */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />
          </div>
        </div>
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      )}

      <div className="absolute inset-0 bg-black/40" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-6 pb-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="text-white" size={20} />
        </button>
        <div className="flex items-center gap-2 bg-[#00FF41]/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#00FF41]/30">
          <div className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse" />
          <span className="text-[#00FF41] text-xs font-bold">AI SCAN ACTIVE</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
          <Zap className="text-white" size={20} />
        </button>
      </div>

      {/* Scanner Frame */}
      <div className="relative z-10 flex items-center justify-center" style={{ height: "calc(100vh - 250px)" }}>
        <div className={`relative transition-all duration-300 ${mode === "account" ? "w-80 h-48" : "w-72 h-72"}`}>
          <div className="absolute -top-16 left-0 right-0 text-center">
            <p className="text-white text-sm font-medium">
              {mode === "qr" ? "Align QR code or Account Number within" : "Align account details within"}
            </p>
            <p className="text-white/60 text-xs">the frame</p>
          </div>

          {/* Corner borders */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#00FF41] rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#00FF41] rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#00FF41] rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#00FF41] rounded-br-3xl" />

          {/* Scanning line animation */}
          {scanning && (
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00FF41] to-transparent"
                style={{
                  animation: "scan 2s ease-in-out infinite",
                }}
              />
            </div>
          )}

          {useSimulated && !detecting && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="text-white/30" size={48} />
            </div>
          )}

          {/* Detection indicator */}
          {detecting && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handleSimulatedScan}
                className="bg-[#00FF41]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#00FF41]/40 flex items-center gap-2 hover:bg-[#00FF41]/30 transition-colors"
              >
                <Zap className="text-[#00FF41]" size={14} />
                <span className="text-[#00FF41] text-xs font-bold">
                  {useSimulated ? "Tap to simulate scan" : "Detecting account numbers..."}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-8 bg-gradient-to-t from-black/80 via-black/60 to-transparent pt-8">
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={() => setMode("qr")}
              className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all ${mode === "qr"
                  ? "bg-[#00FF41] text-black hover:bg-[#00FF41]/90"
                  : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              QR Code
            </Button>
            <Button
              onClick={() => setMode("account")}
              className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === "account"
                  ? "bg-[#00FF41] text-black hover:bg-[#00FF41]/90"
                  : "bg-white/10 text-white hover:bg-white/20"
                }`}
            >
              Extract Account
              <span className="bg-black/20 text-[10px] px-1.5 py-0.5 rounded">AI</span>
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-around">
            <button onClick={handleGalleryPick} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors active:scale-95">
                <ImageIcon className="text-white" size={20} />
              </div>
              <span className="text-white text-xs">Gallery</span>
            </button>
            <button
              onClick={handleSimulatedScan}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-full border-4 border-black/10" />
            </button>
            <button className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <HistoryIcon className="text-white" size={20} />
              </div>
              <span className="text-white text-xs">History</span>
            </button>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0;
          }
        }
      `}</style>
      <OcrResultSheet
        isOpen={showOcrResult}
        onClose={() => setShowOcrResult(false)}
        onConfirm={() => {
          setShowOcrResult(false)
          if (onScanComplete) onScanComplete()
        }}
      />
    </div>
  )
}
