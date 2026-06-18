"use client"

import { useState } from "react"
import { ArrowLeft, Check, Bot, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  name: string
  price: number
  store: string
  image: string
}

interface OrderConfirmationScreenProps {
  product: Product
  onBack: () => void
  onComplete: () => void
}

export default function OrderConfirmationScreen({ product, onBack, onComplete }: OrderConfirmationScreenProps) {
  const [step, setStep] = useState<"confirm" | "pin" | "success">("confirm")
  const [pin, setPin] = useState("")

  const deliveryFee = 1200
  const total = product.price + deliveryFee

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      if (newPin.length === 4) {
        // Auto-submit when 4 digits entered
        setTimeout(() => {
          setStep("success")
        }, 500)
      }
    }
  }

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1))
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/5">
          <button
            onClick={onComplete}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-lg font-bold">Order Confirmation</h1>
          <div className="w-10" />
        </div>

        {/* Success Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          <div className="w-24 h-24 rounded-full bg-[#00FF41]/10 border-2 border-[#00FF41] flex items-center justify-center mb-6">
            <Check className="text-[#00FF41]" size={48} strokeWidth={3} />
          </div>

          <h2 className="text-white text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p className="text-white/60 text-sm text-center mb-8">
            Your payment of ₦{total.toLocaleString()} to {product.store} was successful!
          </p>

          {/* Kumba AI Message */}
          <div className="w-full bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-2xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00FF41]/15 flex items-center justify-center flex-shrink-0">
                <Bot className="text-[#00FF41]" size={16} />
              </div>
              <div>
                <p className="text-[#00FF41] font-bold text-sm mb-1">Kumbapay AI Assistant</p>
                <p className="text-white/80 text-xs leading-relaxed">
                  I received the receipt for you from {product.store}. Auto-filled your shipping details. A receipt has
                  been sent to your email.
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="w-full space-y-4 mb-8">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <p className="text-white/40 text-xs mb-3">ORDER PLACED: KORA</p>
              <div className="flex gap-3 mb-4">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">{product.name}</h3>
                  <p className="text-white/40 text-xs">{product.store}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Total Amount</span>
                <span className="text-white font-bold text-lg">₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
              <p className="text-white font-semibold text-sm mb-4">Order Status</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00FF41] flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-black" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Order Placed</p>
                    <p className="text-white/40 text-xs">Just now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00FF41]/30 flex items-center justify-center flex-shrink-0">
                    <Package size={14} className="text-[#00FF41]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-medium">Processing</p>
                    <p className="text-white/40 text-xs">In about 2-4 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Truck size={14} className="text-white/30" />
                  </div>
                  <div>
                    <p className="text-white/40 text-sm font-medium">Shipped</p>
                    <p className="text-white/40 text-xs">Pending</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-white/30" />
                  </div>
                  <div>
                    <p className="text-white/40 text-sm font-medium">Delivered</p>
                    <p className="text-white/40 text-xs">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Button className="w-full h-12 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold rounded-xl">
              View Order Details
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={onComplete}
                className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "pin") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col items-center justify-center px-5">
        <button
          onClick={() => setStep("confirm")}
          className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>

        {/* Secure Payment Badge */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-6 h-6 rounded-lg bg-[#00FF41]/15 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[#00FF41]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-[#00FF41] text-xs font-bold uppercase tracking-wider">SECURE PAYMENT</span>
        </div>

        <h2 className="text-white text-2xl font-bold mb-2 text-center">Enter Transaction PIN</h2>
        <p className="text-white/60 text-sm text-center mb-8">
          Authorize An Order of ₦{total.toLocaleString()} to {product.store}
        </p>

        {/* PIN Dots */}
        <div className="flex gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length ? "bg-[#00FF41] border-[#00FF41]" : "bg-transparent border-white/20"
              }`}
            />
          ))}
        </div>

        <button className="text-[#00FF41] text-sm font-semibold mb-12 hover:text-[#00FF41]/80 transition-colors">
          Forgot PIN?
        </button>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-8">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handlePinInput(num)}
              className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-2xl font-bold transition-all"
            >
              {num}
            </button>
          ))}
          <button className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-xl font-bold transition-all">
            <svg className="w-5 h-5 mx-auto text-[#00FF41]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
          </button>
          <button
            onClick={() => handlePinInput("0")}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-2xl font-bold transition-all"
          >
            0
          </button>
          <button
            onClick={handlePinDelete}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-xl font-bold transition-all"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
              />
            </svg>
          </button>
        </div>

        <p className="text-white/40 text-xs">FACE ID ENABLED</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <h1 className="text-white text-lg font-bold">Order Confirmation</h1>
        <div className="w-10" />
      </div>

      {/* Kumba AI Chat Bubble */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="w-8 h-8 rounded-full bg-[#00FF41]/15 flex items-center justify-center flex-shrink-0">
            <Bot className="text-[#00FF41]" size={16} />
          </div>
          <div className="flex-1">
            <p className="text-[#00FF41] font-bold text-xs mb-1">KORA AI - Just now</p>
            <p className="text-white text-sm leading-relaxed">
              I found 1kg of {product.name} on {product.store}. It can be delivered by tomorrow. Would you like to
              proceed?
            </p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="flex-1 px-5">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-md bg-[#00FF41]/15 flex items-center justify-center">
              <Package size={12} className="text-[#00FF41]" />
            </div>
            <span className="text-[#00FF41] text-xs font-bold uppercase tracking-wide">YOUR DEAL</span>
          </div>

          <div className="flex gap-4 mb-4">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="text-white font-bold text-base mb-1">{product.name}</h3>
              <p className="text-white/40 text-xs mb-2">5kg Bag • Parboiled</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded text-[#00FF41] text-[10px] font-bold">
                  Selling very fast
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Item Price (x1)</span>
              <span className="text-white font-semibold">₦{product.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60 flex items-center gap-1">
                <Truck size={12} />
                Est. Delivery
              </span>
              <span className="text-white font-semibold">₦{deliveryFee.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#00FF41]/10 to-transparent border border-[#00FF41]/20 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-white/80 font-semibold">TOTAL AMOUNT</span>
            <span className="text-white text-2xl font-bold">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-white/40 text-xs text-center mb-6 flex items-center justify-center gap-1">
          <svg className="w-3.5 h-3.5 text-[#00FF41]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Tap to confirm order securely
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 pb-6 flex gap-3">
        <Button
          onClick={onBack}
          className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10"
        >
          Cancel
        </Button>
        <Button
          onClick={() => setStep("pin")}
          className="flex-1 h-12 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold rounded-xl shadow-lg shadow-[#00FF41]/20 flex items-center justify-center gap-2"
        >
          Confirm Order
          <Check size={16} />
        </Button>
      </div>
    </div>
  )
}
