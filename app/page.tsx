'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  CheckCircle2, Zap, Shield, TrendingUp, MessageCircle, ArrowRight,
  Lock, Globe, CreditCard, BarChart3, Smartphone,
  Download, Star, Users, ChevronRight, Banknote, BrainCircuit, ScanLine
} from 'lucide-react'
import Image from 'next/image'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

const floatingAnimation = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: [0.45, 0.05, 0.55, 0.95] as const,
    },
  },
}

const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(0, 255, 65, 0.2)',
      '0 0 40px rgba(0, 255, 65, 0.4)',
      '0 0 20px rgba(0, 255, 65, 0.2)',
    ],
    transition: { duration: 3, repeat: Infinity },
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
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FF41] flex items-center justify-center shadow-lg shadow-[#00FF41]/20">
              <span className="text-black font-bold text-lg">K</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Kumba</span>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <motion.a
              href="/app"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex px-5 py-2.5 rounded-xl border border-[#00FF41]/40 text-[#00FF41] font-semibold text-sm hover:bg-[#00FF41]/10 transition-all"
            >
              Launch App
            </motion.a>
            <motion.a
              href="#get-access"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex px-5 py-2.5 rounded-xl bg-[#00FF41] text-black font-semibold text-sm hover:bg-[#00FF41]/90 transition-all shadow-lg shadow-[#00FF41]/20"
            >
              Get Early Access
            </motion.a>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#00FF41]/5 blur-[120px]"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#00FF41]/8 blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="inline-block">
                <motion.div
                  {...pulseGlow}
                  className="px-5 py-2.5 rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 backdrop-blur-sm"
                >
                  <span className="text-sm font-semibold text-[#00FF41] flex items-center gap-2">
                    <BrainCircuit size={16} />
                    Powered by Advanced AI Technology
                  </span>
                </motion.div>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Your Money,
                <br />
                <span className="relative">
                  <span className="text-[#00FF41]">Powered by AI</span>
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  >
                    <motion.path
                      d="M2 8 C50 2, 100 2, 150 8 S250 14, 298 6"
                      stroke="#00FF41"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                    />
                  </motion.svg>
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Send money with your voice, QR, or text. Pay bills intelligently. Budget automatically. 
                Kumba is Africa&apos;s first AI-powered financial assistant that lives in your pocket.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="#get-access"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="group px-8 py-4 rounded-2xl bg-[#00FF41] text-black font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#00FF41]/25 hover:shadow-2xl hover:shadow-[#00FF41]/35 transition-shadow"
                >
                  Get Early Access
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <motion.a
                  href="#how-it-works"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm font-semibold text-lg flex items-center justify-center gap-3 hover:bg-card hover:border-border transition-all"
                >
                  See How It Works
                  <ChevronRight size={20} />
                </motion.a>
              </motion.div>

              {/* Social Proof */}
              <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center overflow-hidden">
                      <Users size={14} className="text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className="fill-[#00FF41] text-[#00FF41]" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">2,500+</span> early adopters signed up
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - App Preview */}
            <motion.div variants={scaleIn} className="relative">
              <motion.div {...floatingAnimation} className="relative z-10">
                <div className="relative mx-auto max-w-sm">
                  {/* Phone Frame */}
                  <div className="relative rounded-[3rem] bg-background border-4 border-border/50 p-2 shadow-2xl shadow-black/40">
                    <div className="rounded-[2.5rem] overflow-hidden bg-card aspect-[9/19.5]">
                      <Image
                        src="/kumba-hero-phone-app.jpg"
                        alt="Kumba App Interface"
                        width={400}
                        height={860}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </div>
                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 px-4 py-2.5 rounded-2xl bg-[#00FF41] text-black font-bold text-sm shadow-xl shadow-[#00FF41]/30"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    Instant Transfer
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-4 -left-4 px-4 py-2.5 rounded-2xl bg-card border border-border/50 backdrop-blur-xl text-sm shadow-xl"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <BrainCircuit size={16} className="text-[#00FF41]" />
                      <span className="font-semibold">AI Powered</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '20+', label: 'AI Capabilities' },
              { value: '5+', label: 'Bill Categories' },
              { value: '₦0', label: 'Hidden Fees' },
              { value: '24/7', label: 'AI Assistant' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#00FF41] mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 text-sm font-semibold text-[#00FF41] mb-6"
            >
              Features
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Everything You Need,
              <br />
              <span className="text-[#00FF41]">Nothing You Don&apos;t</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Kumba combines cutting-edge AI with seamless payments to give you complete control over your finances.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: MessageCircle,
                title: 'Voice-First Banking',
                description: 'Just speak to Kumba. Send money, check balance, or schedule payments using natural voice commands.',
                color: 'from-[#00FF41]/20 to-transparent',
              },
              {
                icon: Zap,
                title: 'Instant Payments',
                description: 'Send money in seconds via QR, voice, or text. No complicated steps, no waiting.',
                color: 'from-blue-500/20 to-transparent',
              },
              {
                icon: BrainCircuit,
                title: 'Smart AI Assistant',
                description: 'Kumba learns your habits and gives personalized financial advice tailored to you.',
                color: 'from-purple-500/20 to-transparent',
              },
              {
                icon: Shield,
                title: 'Bank-Level Security',
                description: 'Military-grade encryption and PIN protection keep your money safe and your data private.',
                color: 'from-amber-500/20 to-transparent',
              },
              {
                icon: Banknote,
                title: 'Bills & Subscriptions',
                description: 'Pay electricity, airtime, TV subs, and more instantly. Schedule recurring payments automatically.',
                color: 'from-pink-500/20 to-transparent',
              },
              {
                icon: BarChart3,
                title: 'Wealth Intelligence',
                description: 'Get detailed insights on spending, savings goals, and investment recommendations.',
                color: 'from-cyan-500/20 to-transparent',
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group relative p-8 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/80 hover:border-[#00FF41]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[#00FF41]/10"
                >
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-14 h-14 rounded-2xl bg-[#00FF41]/10 flex items-center justify-center mb-6"
                    >
                      <Icon className="w-7 h-7 text-[#00FF41]" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-card/20 border-y border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 text-sm font-semibold text-[#00FF41] mb-6"
            >
              How It Works
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Start in <span className="text-[#00FF41]">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with Kumba in minutes. No complex setup, no paperwork.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#00FF41]/0 via-[#00FF41]/50 to-[#00FF41]/0" />
            
            {[
              {
                step: '01',
                icon: Download,
                title: 'Download the App',
                description: 'Visit kumba.app and download the web app directly to your phone. No app store needed.',
              },
              {
                step: '02',
                icon: CreditCard,
                title: 'Create Your Wallet',
                description: 'Sign up with your phone number. Verify your identity and set up your secure PIN.',
              },
              {
                step: '03',
                icon: MessageCircle,
                title: 'Talk to Kumba',
                description: 'Start managing your money with voice or text. Send money, pay bills, get advice.',
              },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-20 h-20 rounded-3xl bg-[#00FF41]/10 border border-[#00FF41]/30 flex items-center justify-center mx-auto mb-8 relative z-10"
                  >
                    <Icon className="w-9 h-9 text-[#00FF41]" />
                  </motion.div>
                  <div className="text-6xl font-bold text-[#00FF41]/15 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-lg max-w-xs mx-auto">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 text-sm font-semibold text-[#00FF41] mb-6"
              >
                Security
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight">
                Your Money.
                <br />
                <span className="text-[#00FF41]">Fortress Security.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Built with enterprise-grade security from the ground up. Your financial data and transactions are protected by multiple layers of defense.
              </p>
              
              <div className="space-y-8">
                {[
                  {
                    icon: Lock,
                    title: 'Military-Grade Encryption',
                    desc: '256-bit AES encryption protects every transaction and piece of data',
                  },
                  {
                    icon: Shield,
                    title: 'Biometric Authentication',
                    desc: 'Face ID, fingerprint, or PIN for secure access to your wallet',
                  },
                  {
                    icon: ScanLine,
                    title: 'Real-Time Fraud Detection',
                    desc: 'AI monitors for unusual activity and alerts you instantly',
                  },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      whileHover={{ x: 8 }}
                      className="flex gap-5 p-5 rounded-2xl hover:bg-card/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#00FF41]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-[#00FF41]" />
                      </div>
                      <div>
                        <p className="font-bold text-lg mb-1">{item.title}</p>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <motion.div {...floatingAnimation} className="relative z-10">
                <Image
                  src="/kumba-security-shield.jpg"
                  alt="Security Features"
                  width={600}
                  height={500}
                  className="rounded-3xl shadow-2xl shadow-black/40 object-cover w-full"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#00FF41]/10 to-transparent rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-24 sm:py-32 bg-card/20 border-y border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div {...floatingAnimation} className="relative z-10">
                <div className="relative mx-auto max-w-sm">
                  <div className="relative rounded-[3rem] bg-background border-4 border-border/50 p-2 shadow-2xl shadow-black/40">
                    <div className="rounded-[2.5rem] overflow-hidden bg-card aspect-[9/19.5]">
                      <Image
                        src="/kumba-hero-phone-app.jpg"
                        alt="Kumba App"
                        width={400}
                        height={860}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 text-sm font-semibold text-[#00FF41] mb-6"
              >
                <Smartphone size={14} className="inline mr-2" />
                Download Now
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
                Get Kumba
                <br />
                <span className="text-[#00FF41]">On Your Phone</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Kumba is a progressive web app — download it directly from our website. No app store needed. Works on any device with a browser.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  'Works on Android & iOS',
                  'No app store download required',
                  'Auto-updates always',
                  'Instant access — no waiting',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#00FF41] flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>

              <motion.a
                href="#get-access"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#00FF41] text-black font-bold text-lg shadow-xl shadow-[#00FF41]/25 hover:shadow-2xl hover:shadow-[#00FF41]/35 transition-shadow"
              >
                <Download size={22} />
                Download Kumba
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 text-sm font-semibold text-[#00FF41] mb-6"
              >
                Why Kumba
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight">
                Built for
                <br />
                <span className="text-[#00FF41]">Africa, by Africans</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                We understand the unique challenges of managing money in Africa. Kumba is designed from the ground up for the African financial landscape.
              </p>
              
              <ul className="space-y-5">
                {[
                  'Deep understanding of local banking and payment needs',
                  'Supports all major Nigerian banks and networks',
                  'Zero hidden fees — complete transparency',
                  'AI learns your spending patterns for personalized advice',
                  'Licensed partnerships with 9PSB for secure transactions',
                  'Built-in budgeting that actually works for your lifestyle',
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <CheckCircle2 className="w-6 h-6 text-[#00FF41] flex-shrink-0 mt-0.5" />
                    <span className="text-lg leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div {...floatingAnimation} className="relative z-10">
                <Image
                  src="/kumba-features-illustration.jpg"
                  alt="Kumba Features"
                  width={600}
                  height={500}
                  className="rounded-3xl shadow-2xl shadow-black/40 object-cover w-full"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#00FF41]/10 to-transparent rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="get-access" className="py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] bg-gradient-to-br from-[#0A2F1F] via-[#0A2F1F] to-[#051810] p-12 sm:p-16 text-center overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#00FF41]/10 blur-[150px]" />
              <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-[#00FF41]/15 blur-[100px]" />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-5 py-2.5 rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 backdrop-blur-sm text-sm font-semibold text-[#00FF41] mb-8"
              >
                Limited Time Offer
              </motion.div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                Join the Financial
                <br />
                <span className="text-[#00FF41]">Revolution</span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                Be among the first 100 users to get free access to premium features for a month. Experience the future of African finance today.
              </p>

              <div className="max-w-lg mx-auto">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-2xl bg-[#00FF41]/10 border border-[#00FF41]/30 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 className="w-16 h-16 text-[#00FF41] mx-auto mb-4" />
                    </motion.div>
                    <h3 className="font-bold text-2xl mb-2 text-white">Welcome to Kumba!</h3>
                    <p className="text-white/70">
                      Check your email for exclusive early access. You could be among the first 100 to unlock free premium features.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#00FF41] focus:border-[#00FF41]/50 text-lg transition-all backdrop-blur-sm"
                      />
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 rounded-xl bg-[#00FF41] text-black font-bold text-lg hover:bg-[#00FF41]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-[#00FF41]/30"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Joining...
                          </span>
                        ) : (
                          <>
                            Get Early Access
                            <ArrowRight size={20} />
                          </>
                        )}
                      </motion.button>
                    </div>
                    <p className="text-sm text-white/50">
                      Free for first 100 users. No credit card required.
                    </p>
                    <a href="/app" className="inline-flex items-center gap-2 mt-3 text-[#00FF41] font-semibold hover:underline">
                      Already have an account? Launch the app <ArrowRight size={16} />
                    </a>
                  </form>
                )}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-white/10">
                {[
                  { icon: Shield, text: 'Bank-Level Security' },
                  { icon: Lock, text: 'Encrypted Data' },
                  { icon: Globe, text: 'Licensed Partner' },
                ].map((badge, i) => {
                  const Icon = badge.icon
                  return (
                    <div key={i} className="flex items-center gap-2 text-white/60">
                      <Icon size={16} />
                      <span className="text-sm">{badge.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-16 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#00FF41] flex items-center justify-center shadow-lg shadow-[#00FF41]/20">
                    <span className="text-black font-bold text-lg">K</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight">Kumba</span>
                </div>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Kumba is an AI-powered digital wallet platform built for Africa. We partner with licensed financial institutions to provide secure, accessible banking powered by artificial intelligence.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                  <li><a href="#security" className="hover:text-foreground transition-colors">Security</a></li>
                  <li><a href="#get-access" className="hover:text-foreground transition-colors">Early Access</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">KYC Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-border/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>© 2024 Kumba by Korapay. All rights reserved.</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Made with</span>
                <span className="text-[#00FF41]">&#9829;</span>
                <span>in Africa</span>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
