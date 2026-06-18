'use client'

import React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'
import { CheckCircle2, Zap, Shield, TrendingUp, MessageCircle, Smartphone, ArrowRight, Lightbulb, Lock, Wallet } from 'lucide-react'
import Image from 'next/image'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
}

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSubmitted(true)
    setEmail('')
    setLoading(false)

    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#00FF41] flex items-center justify-center">
              <span className="text-black font-bold text-lg">K</span>
            </div>
            <span className="font-bold text-lg">Kumba</span>
          </div>
          <ThemeToggle />
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 20% 50%, #00FF41 0%, transparent 50%)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="inline-block">
                <span className="px-4 py-2 rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 text-sm font-medium text-[#00FF41]">
                  ✨ Meet Kumba - Africa's Financial Genius
                </span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                Your Money,
                <span className="block text-[#00FF41]">Powered by AI</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                Talk to Kumba. Send money with your voice. Pay bills intelligently. Budget automatically. Powered by licensed African fintech partners. Get early access and join the financial revolution.
              </motion.p>

              {/* Early Access Form */}
              <motion.div variants={fadeInUp} className="max-w-sm">
                {submitted ? (
                  <motion.div variants={scaleIn} className="p-6 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-center">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                      <CheckCircle2 className="w-12 h-12 text-[#00FF41] mx-auto mb-3" />
                    </motion.div>
                    <h3 className="font-bold text-lg mb-2">Welcome to Kumba!</h3>
                    <p className="text-muted-foreground text-sm">
                      Check your email for exclusive early access updates and launch announcements.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1 px-4 py-4 rounded-xl bg-card border border-border/50 focus:ring-2 focus:ring-[#00FF41] focus:border-[#00FF41]/50 transition-all placeholder-muted-foreground"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={loading}
                        className="px-6 py-4 rounded-xl bg-[#00FF41] text-black font-bold hover:bg-[#00FF41]/90 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? '...' : <>Join <ArrowRight size={18} /></>}
                      </motion.button>
                    </div>
                    <p className="text-xs text-muted-foreground">We respect your privacy. Unsubscribe anytime.</p>
                  </form>
                )}
              </motion.div>

              {/* Promo Badge */}
              <motion.div variants={fadeInUp} className="inline-block px-4 py-3 rounded-xl border border-[#00FF41]/30 bg-[#00FF41]/5">
                <p className="text-sm font-semibold text-[#00FF41]">
                  🎉 First 100 users get free access to premium features for 1 month
                </p>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div variants={scaleIn} className="relative h-96 sm:h-[500px]">
              <motion.div {...floatingAnimation} className="relative w-full h-full">
                <Image
                  src="/kumba-hero-phone-app.jpg"
                  alt="Kumba App Interface"
                  fill
                  className="object-cover rounded-3xl shadow-2xl"
                  priority
                />
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[#00FF41]/20 to-transparent pointer-events-none"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 sm:py-32 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Superpowers in Your Pocket</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Kumba combines cutting-edge AI with African fintech to give you superpowers over your money.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: 'Voice-First Banking',
                description: 'Just speak to Kumba. Send money, check balance, or schedule payments using natural voice commands.',
              },
              {
                icon: Zap,
                title: 'Instant Payments',
                description: 'Send money in seconds via QR, voice, or text. No complicated steps, no waiting.',
              },
              {
                icon: Lightbulb,
                title: 'Smart AI Assistant',
                description: 'Kumba learns your habits and gives personalized financial advice tailored to you.',
              },
              {
                icon: Shield,
                title: 'Bank-Level Security',
                description: 'Military-grade encryption and PIN protection keep your money safe and your data private.',
              },
              {
                icon: TrendingUp,
                title: 'Bills & Subscriptions',
                description: 'Pay electricity, airtime, TV subs, and more instantly. Schedule recurring payments automatically.',
              },
              {
                icon: Wallet,
                title: 'Wealth Intelligence',
                description: 'Get detailed insights on spending, savings goals, and investment recommendations.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={index} variants={fadeInUp} className="group p-6 rounded-2xl border border-border/50 hover:border-[#00FF41]/50 bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:shadow-[#00FF41]/20">
                  <motion.div whileHover={{ scale: 1.1 }} className="inline-block mb-4">
                    <Icon className="w-12 h-12 text-[#00FF41]" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Why Kumba Section */}
      <section className="py-20 sm:py-32 bg-card/30 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative h-96 order-2 lg:order-1">
              <motion.div {...floatingAnimation} className="relative w-full h-full">
                <Image
                  src="/kumba-features-illustration.jpg"
                  alt="Kumba Features"
                  fill
                  className="object-cover rounded-3xl"
                />
              </motion.div>
            </motion.div>

            {/* Right Content */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
              <h2 className="text-4xl sm:text-5xl font-bold mb-8">Why Choose Kumba?</h2>
              <ul className="space-y-6">
                {[
                  'Built by Africans for Africans with deep understanding of local needs',
                  'AI learns your spending patterns and provides hyper-personalized advice',
                  'Partnerships with licensed financial institutions ensure compliance and security',
                  'Zero hidden fees - complete transparency on every transaction',
                  'Enterprise-grade security with biometric authentication',
                  'Seamless integration with trusted African payment networks',
                ].map((item, index) => (
                  <motion.li key={index} variants={fadeInUp} className="flex gap-4">
                    <motion.div whileHover={{ scale: 1.2 }} className="flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-[#00FF41] mt-1" />
                    </motion.div>
                    <span className="text-lg leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How Kumba Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to financial freedom</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Sign Up in Seconds',
                description: 'Create your account with just your phone number. KYC verification is instant.',
              },
              {
                step: '02',
                title: 'Set Up Your Wallet',
                description: 'Fund your wallet instantly from your bank. Link your accounts securely.',
              },
              {
                step: '03',
                title: 'Talk to Kumba',
                description: 'Start managing your money. Send money, pay bills, get advice using voice or text.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-7xl font-bold text-[#00FF41]/20 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-lg">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 sm:py-32 bg-card/30 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl sm:text-5xl font-bold mb-8">Your Money. Fortress Security.</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Lock,
                    title: 'Military-Grade Encryption',
                    desc: 'Bank-level security protects every transaction',
                  },
                  {
                    icon: Shield,
                    title: 'Biometric Authentication',
                    desc: 'Face ID or fingerprint for secure access',
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Fraud Detection AI',
                    desc: 'Real-time monitoring catches unusual activity',
                  },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div key={i} whileHover={{ x: 10 }} className="flex gap-4">
                      <Icon className="w-8 h-8 text-[#00FF41] flex-shrink-0" />
                      <div>
                        <p className="font-bold text-lg">{item.title}</p>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative h-96">
              <Image src="/kumba-security-shield.jpg" alt="Security" fill className="object-cover rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <h2 className="text-5xl sm:text-6xl font-bold">
              Join the Financial
              <span className="block text-[#00FF41]">Revolution</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the first users in Nigeria transforming how they manage money. Be among the first 100 and get free premium access for a month.
            </p>

            <div className="max-w-md mx-auto">
              {submitted ? (
                <motion.div variants={scaleIn} initial="hidden" animate="visible" className="p-8 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 text-center">
                  <CheckCircle2 className="w-16 h-16 text-[#00FF41] mx-auto mb-4" />
                  <h3 className="font-bold text-2xl mb-2">You're In!</h3>
                  <p className="text-muted-foreground">
                    Welcome to Kumba. Check your email for exclusive updates. You could be among the first 100 to unlock free premium features for a month.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 rounded-xl bg-card border border-border/50 focus:ring-2 focus:ring-[#00FF41] focus:border-[#00FF41]/50 text-lg transition-all placeholder-muted-foreground"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-[#00FF41] text-black font-bold text-lg hover:bg-[#00FF41]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Joining...' : <>Get Early Access <ArrowRight size={20} /></>}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-card/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#00FF41] flex items-center justify-center">
                <span className="text-black font-bold text-sm">K</span>
              </div>
              <span className="font-bold">Kumba</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
              Kumba is an intelligent financial software platform launching in Nigeria, partnering with licensed financial institutions to provide secure, accessible banking and payment services powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
              <span>© 2024 Kumba. All rights reserved.</span>
              <span className="hidden sm:block">•</span>
              <span>Made with love in Africa</span>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
