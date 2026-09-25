"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

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

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1f0f] via-[#0d1612] to-[#0a0f0d] flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#00FF41]/5 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      {/* Header - Logo */}
      <div className="absolute top-6 left-6 z-10">
        <AnimatePresence mode="wait">
          {slides[currentSlide].showLogo ? (
            <motion.div
              key="logo"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 bg-[#00FF41] rounded-lg flex items-center justify-center shadow-lg shadow-[#00FF41]/20">
                <span className="text-[#0a1f0f] font-bold text-base">K</span>
              </div>
              <span className="text-white font-semibold text-lg">Kumbapay</span>
            </motion.div>
          ) : (
            <motion.span
              key="korapay"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-white/40 text-[11px] tracking-[0.25em] uppercase font-medium"
            >
              KORAPAY
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-end px-5 pb-8 pt-20">
        {/* Hero Image Container */}
        <div className="flex-1 flex items-center justify-center w-full mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-[340px] aspect-square"
            >
              <div className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-sm border border-white/[0.06] shadow-2xl shadow-black/40" />
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="transition-all duration-300"
              aria-label={`Go to slide ${index + 1}`}
            >
              <motion.div
                animate={{
                  width: index === currentSlide ? 28 : 6,
                  backgroundColor: index === currentSlide ? '#00FF41' : 'rgba(255,255,255,0.2)',
                }}
                className="h-1.5 rounded-full"
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>

        {/* Text Content */}
        <div className="text-center space-y-4 mb-8 max-w-[380px] px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-[28px] font-bold text-white leading-[1.25] tracking-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-white/50 text-[15px] leading-relaxed font-normal mt-3">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-[380px] space-y-4 px-4">
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handlePrev}
                className="w-14 h-[54px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="text-white/60" size={22} />
              </motion.button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 h-[54px] bg-[#00FF41] hover:bg-[#00FF41]/90 text-[#0a1f0f] font-semibold rounded-xl text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.3)] flex items-center justify-center gap-2"
            >
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          {currentSlide === 0 && (
            <button
              onClick={onComplete}
              className="w-full text-white/40 text-[14px] hover:text-white/60 transition-colors font-normal"
            >
              I already have an account
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
