'use client'

import React from "react"

import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SplashScreen } from '@/components/onboarding/splash-screen'
import PhoneLoginScreen from '@/components/onboarding/phone-login-screen'
import OtpVerifyScreen from '@/components/onboarding/otp-verify-screen'
import PinCreateScreen from '@/components/onboarding/pin-create-screen'
import PinConfirmScreen from '@/components/onboarding/pin-confirm-screen'
import KycScreen from '@/components/onboarding/kyc-screen'
import DashboardScreen from '@/components/dashboard/dashboard-screen'
import TransactionPinScreen from '@/components/onboarding/transaction-pin-screen'
import { ThemeToggle } from '@/components/theme-toggle'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CheckCircle2, ArrowRight, MessageCircle, Zap, Lightbulb, Shield, TrendingUp, Wallet } from 'lucide-react'
import { Lock } from 'lucide-react'

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const scaleIn = {
  hidden: { scale: 0 },
  visible: { scale: 1 },
}

const floatingAnimation = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<
    'splash' | 'phone' | 'otp' | 'pin' | 'pinConfirm' | 'kyc' | 'transactionPin' | 'home'
  >('splash')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [transactionPin, setTransactionPin] = useState("")

  const getOrCreateUser = useMutation(api.users.getOrCreate)
  const setPin = useMutation(api.users.setPin)

  const handleSplashComplete = () => {
    setCurrentStep('phone')
  }

  const handleBackToSplash = () => {
    setCurrentStep('splash')
  }

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone)
    setCurrentStep('otp')
  }

  const handleOtpVerify = useCallback(async () => {
    setCurrentStep('pin')
  }, [])

  const handleBackToPhone = () => {
    setCurrentStep('phone')
  }

  const handlePinCreate = () => {
    setCurrentStep('pinConfirm')
  }

  const handleBackToOtp = () => {
    setCurrentStep('otp')
  }

  const handlePinConfirm = () => {
    setCurrentStep('kyc')
  }

  const handleBackToPin = () => {
    setCurrentStep('pin')
  }

  const handleKycComplete = () => {
    setCurrentStep('transactionPin')
  }

  const handleBackToPinConfirm = () => {
    setCurrentStep('pinConfirm')
  }

  const handleTransactionPinComplete = useCallback(async (pin: string) => {
    setTransactionPin(pin)
    try {
      const id = await getOrCreateUser({
        phone: phoneNumber,
        name: "User",
      })
      setUserId(id)
      if (pin) await setPin({ userId: id, pin })
      fetch("/api/kumba-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      }).catch(() => {})
    } catch {
      setUserId(null)
    }
    setCurrentStep('home')
  }, [phoneNumber, getOrCreateUser, setPin])

  const handleBackToKyc = () => {
    setCurrentStep('kyc')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen w-full">
      {currentStep === 'splash' && <SplashScreen onComplete={handleSplashComplete} />}
      {currentStep === 'phone' && <PhoneLoginScreen onSubmit={handlePhoneSubmit} onBack={handleBackToSplash} />}
      {currentStep === 'otp' && (
        <OtpVerifyScreen phoneNumber={phoneNumber} onVerify={handleOtpVerify} onBack={handleBackToPhone} />
      )}
      {currentStep === 'pin' && <PinCreateScreen onComplete={handlePinCreate} onBack={handleBackToOtp} />}
      {currentStep === 'pinConfirm' && <PinConfirmScreen onComplete={handlePinConfirm} onBack={handleBackToPin} />}
      {currentStep === 'kyc' && <KycScreen onComplete={handleKycComplete} onBack={handleBackToPinConfirm} />}
      {currentStep === 'transactionPin' && (
        <TransactionPinScreen onComplete={handleTransactionPinComplete} onBack={handleBackToKyc} />
      )}
      {currentStep === 'home' && <DashboardScreen userId={userId} />}
    </div>
  )
}
