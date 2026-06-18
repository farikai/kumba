"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: "/africa-3d.jpg",
      title: (
        <>
          Your <span className="text-[#00FF41]">AI-Powered</span>
          <br />
          Financial Companion
          <br />
          for Africa
        </>
      ),
      description: "Manage money, automate budgets, and shop online with intelligent insights.",
      showLogo: true,
    },
    {
      image: "/qr-card-3d.jpg",
      title: (
        <>
          One app. All finances.
          <br />
          Powered by <span className="text-[#00FF41]">AI</span>.
        </>
      ),
      description: "Automate your budget, shop online, and pay instantly with just your voice or a scan.",
      showLogo: false,
    },
    {
      image: "/robot-3d.jpg",
      title: (
        <>
          Meet Kumba,
          <br />
          <span className="text-[#00FF41]">your money genius</span>
        </>
      ),
      description: "I'm here to automate your bills, track your spending, and help you shop smarter.",
      showLogo: false,
    },
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1f0f] via-[#0d1612] to-[#0a0f0d] flex flex-col relative">
      {/* Header - Logo */}
      <div className="absolute top-6 left-6 z-10">
        {slides[currentSlide].showLogo ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#00FF41] rounded-md flex items-center justify-center">
              <span className="text-[#0a1f0f] font-bold text-base">K</span>
            </div>
            <span className="text-white font-semibold text-lg">Kumbapay</span>
          </div>
        ) : (
          <span className="text-white/40 text-[11px] tracking-[0.25em] uppercase font-medium">KORAPAY</span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-end px-5 pb-8 pt-20">
        {/* Hero Image Container */}
        <div className="flex-1 flex items-center justify-center w-full mb-4">
          <div className="relative w-full max-w-[340px] aspect-square">
            <div className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-sm border border-white/[0.03]" />
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <img
                src={slides[currentSlide].image || "/placeholder.svg"}
                alt=""
                className="w-full h-full object-contain"
                style={{
                  filter: "drop-shadow(0 20px 60px rgba(0, 255, 65, 0.25))",
                }}
              />
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex gap-1.5 mb-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="transition-all duration-300"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-7 bg-[#00FF41]" : "w-1.5 bg-white/20"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Text Content */}
        <div className="text-center space-y-4 mb-10 max-w-[380px] px-4">
          <h1 className="text-[28px] font-bold text-white leading-[1.25] tracking-tight">
            {slides[currentSlide].title}
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed font-normal">{slides[currentSlide].description}</p>
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-[380px] space-y-5 px-4">
          <Button
            onClick={handleNext}
            className="w-full h-[54px] bg-[#00FF41] hover:bg-[#00FF41]/90 text-[#0a1f0f] font-semibold rounded-xl text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.3)]"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <button
            onClick={onComplete}
            className="w-full text-white/50 text-[14px] hover:text-white/70 transition-colors font-normal"
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  )
}
