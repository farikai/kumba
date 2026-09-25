'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { AnimatePresence, motion } from 'framer-motion'
import { SplashScreen } from '@/components/onboarding/splash-screen'
import PhoneLoginScreen from '@/components/onboarding/phone-login-screen'
import OtpVerifyScreen from '@/components/onboarding/otp-verify-screen'
import PinCreateScreen from '@/components/onboarding/pin-create-screen'
import PinConfirmScreen from '@/components/onboarding/pin-confirm-screen'
import KycScreen from '@/components/onboarding/kyc-screen'
import DashboardScreen from '@/components/dashboard/dashboard-screen'
import TransactionPinScreen from '@/components/onboarding/transaction-pin-screen'
import { SessionProvider, useSession } from '@/components/session-provider'

type Step = 'splash' | 'phone' | 'otp' | 'pin' | 'pinConfirm' | 'kyc' | 'activate' | 'loginPin' | 'home'

const pageVariants = {
  initial: { opacity: 0, x: 30, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -30, scale: 0.98 },
}

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
}

function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<Step>('splash')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register')
  const [accountPin, setAccountPin] = useState('')
  const [pinConfirmError, setPinConfirmError] = useState('')
  const [kycData, setKycData] = useState<{ idType: 'bvn' | 'nin'; idNumber: string } | null>(null)
  const [authError, setAuthError] = useState('')
  const [busy, setBusy] = useState(false)

  const { session, ready, saveSession, clearSession } = useSession()
  const register = useMutation(api.users.register)
  const login = useMutation(api.users.login)
  const setKyc = useMutation(api.users.setKyc)

  // Restore a persisted session (validated server-side, not trusted blindly).
  useEffect(() => {
    if (!ready || !session) return
    let cancelled = false
    ;(async () => {
      try {
        const base = process.env.NEXT_PUBLIC_CONVEX_SITE_URL
        if (!base) return
        const res = await fetch(`${base}/api/query/users:validateSession`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ args: { userId: session.userId, sessionToken: session.sessionToken } }),
        })
        if (!res.ok) throw new Error('invalid session')
        const { value } = await res.json()
        if (!cancelled && value?.valid) setCurrentStep('home')
        else if (!cancelled) clearSession()
      } catch {
        if (!cancelled) clearSession()
      }
    })()
    return () => { cancelled = true }
  }, [ready, session, clearSession])

  const handleSplashComplete = () => setCurrentStep('phone')
  const handlePhoneSubmit = (phone: string, name: string, mode: 'register' | 'login') => {
    setPhoneNumber(phone)
    setAccountName(name)
    setAuthMode(mode)
    setAuthError('')
    setCurrentStep('otp')
  }
  // NOTE: the OTP step is currently a client-side UX gate only — no SMS
  // provider is wired, so it confers no authentication. The credential
  // check happens at register/login with phone + PIN server-side.
  const handleOtpVerify = useCallback(() => {
    setCurrentStep(authMode === 'register' ? 'pin' : 'loginPin')
  }, [authMode])

  const handlePinCreate = (pin: string) => {
    setAccountPin(pin)
    setPinConfirmError('')
    setCurrentStep('pinConfirm')
  }
  const handlePinConfirm = (pin: string) => {
    if (pin !== accountPin) {
      setPinConfirmError('PINs do not match. Try again.')
      return
    }
    setPinConfirmError('')
    setCurrentStep('kyc')
  }
  const handleKycComplete = (data: { idType: 'bvn' | 'nin'; idNumber: string }) => {
    setKycData(data)
    setAuthError('')
    setCurrentStep('activate')
  }

  const triggerIngest = (userId: string, sessionToken: string) => {
    fetch('/api/kumba-ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionToken }),
    }).catch(() => {})
  }

  const handleActivate = useCallback(async (pin: string) => {
    if (busy) return
    if (pin !== accountPin) {
      setAuthError('That PIN does not match the one you created.')
      return
    }
    setBusy(true)
    setAuthError('')
    try {
      const result = await register({ phone: phoneNumber, name: accountName || 'User', pin })
      if (kycData) {
        try {
          await setKyc({
            userId: result.userId,
            sessionToken: result.sessionToken,
            idType: kycData.idType,
            idNumber: kycData.idNumber,
          })
        } catch {
          /* KYC is self-attested metadata; registration already succeeded */
        }
      }
      saveSession({
        userId: result.userId,
        sessionToken: result.sessionToken,
        name: result.user.name,
        phone: result.user.phone,
      })
      triggerIngest(result.userId, result.sessionToken)
      setCurrentStep('home')
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Registration failed. Try logging in instead.')
    } finally {
      setBusy(false)
    }
  }, [busy, accountPin, register, phoneNumber, accountName, kycData, setKyc, saveSession])

  const handleLogin = useCallback(async (pin: string) => {
    if (busy) return
    setBusy(true)
    setAuthError('')
    try {
      const result = await login({ phone: phoneNumber, pin })
      saveSession({
        userId: result.userId,
        sessionToken: result.sessionToken,
        name: result.user.name,
        phone: result.user.phone,
      })
      setCurrentStep('home')
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Login failed.')
    } finally {
      setBusy(false)
    }
  }, [busy, login, phoneNumber, saveSession])

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {currentStep === 'splash' && (
          <motion.div key="splash" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        )}
        {currentStep === 'phone' && (
          <motion.div key="phone" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <PhoneLoginScreen onSubmit={handlePhoneSubmit} onBack={() => setCurrentStep('splash')} />
          </motion.div>
        )}
        {currentStep === 'otp' && (
          <motion.div key="otp" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <OtpVerifyScreen phoneNumber={phoneNumber} onVerify={handleOtpVerify} onBack={() => setCurrentStep('phone')} />
          </motion.div>
        )}
        {currentStep === 'pin' && (
          <motion.div key="pin" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <PinCreateScreen onComplete={handlePinCreate} onBack={() => setCurrentStep('otp')} />
          </motion.div>
        )}
        {currentStep === 'pinConfirm' && (
          <motion.div key="pinConfirm" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <PinConfirmScreen onComplete={handlePinConfirm} error={pinConfirmError} onBack={() => setCurrentStep('pin')} />
          </motion.div>
        )}
        {currentStep === 'kyc' && (
          <motion.div key="kyc" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <KycScreen onComplete={handleKycComplete} onBack={() => setCurrentStep('pinConfirm')} />
          </motion.div>
        )}
        {currentStep === 'activate' && (
          <motion.div key="activate" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <TransactionPinScreen
              onComplete={handleActivate}
              onBack={() => setCurrentStep('kyc')}
              title="Activate your wallet"
              subtitle="Re-enter the PIN you just created to finish setting up your account."
              error={authError || (busy ? 'Creating your account…' : '')}
            />
          </motion.div>
        )}
        {currentStep === 'loginPin' && (
          <motion.div key="loginPin" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <TransactionPinScreen
              onComplete={handleLogin}
              onBack={() => setCurrentStep('phone')}
              title="Welcome back"
              subtitle={`Enter the PIN for ${phoneNumber} to log in.`}
              error={authError || (busy ? 'Verifying…' : '')}
            />
          </motion.div>
        )}
        {currentStep === 'home' && (
          <motion.div key="home" variants={{ initial: { opacity: 0, scale: 1.02 }, animate: { opacity: 1, scale: 1 } }} initial="initial" animate="animate" transition={{ duration: 0.5 }}>
            <DashboardScreen userId={session?.userId ?? null} onLogout={() => setCurrentStep('splash')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  return (
    <SessionProvider>
      <OnboardingFlow />
    </SessionProvider>
  )
}
