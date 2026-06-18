'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calculator, TrendingUp, PiggyBank, Clock, ShoppingCart, Store } from 'lucide-react'

interface MoreFeaturesBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelectFeature: (feature: string) => void
}

export function MoreFeaturesBottomSheet({ isOpen, onClose, onSelectFeature }: MoreFeaturesBottomSheetProps) {
  const features = [
    {
      id: 'taxCalculator',
      icon: Calculator,
      title: 'AI Tax Calculator',
    },
    {
      id: 'financialAnalyzer',
      icon: TrendingUp,
      title: 'Financial Analyzer',
    },
    {
      id: 'budgetCreator',
      icon: PiggyBank,
      title: 'Budget Planner',
    },
    {
      id: 'scheduled',
      icon: Clock,
      title: 'Scheduled Payments',
    },
    {
      id: 'seller',
      icon: Store,
      title: 'Sell on Kumbapay',
    },
  ]

  const handleSelectFeature = (featureId: string) => {
    onSelectFeature(featureId)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-full"
          >
            <div className="bg-card rounded-t-3xl px-5 pb-8 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 mt-2">
                <div>
                  <h3 className="text-xl font-bold text-white">More Features</h3>
                  <p className="text-xs text-white/60 mt-1">Unlock powerful financial tools</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-white" />
                </motion.button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {features.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <motion.button
                      key={feature.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectFeature(feature.id)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors active:bg-white/10"
                    >
                      <div className="w-11 h-11 rounded-[14px] bg-[#00FF41]/10 backdrop-blur-md border border-[#00FF41]/20 flex items-center justify-center shadow-lg shadow-[#00FF41]/5">
                        <Icon size={18} className="text-[#00FF41]" />
                      </div>
                      <span className="text-white/90 text-[10px] font-medium text-center leading-tight">
                        {feature.title}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="h-4" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
