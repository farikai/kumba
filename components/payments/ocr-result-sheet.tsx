"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Copy, CreditCard, Building2, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OcrResultSheetProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    data?: {
        accountNumber: string
        accountName: string
        bankName: string
    }
}

export function OcrResultSheet({ isOpen, onClose, onConfirm, data }: OcrResultSheetProps) {
    // Mock data if none provided
    const result = data || {
        accountNumber: "0123456789",
        accountName: "John Doe",
        bankName: "Guaranty Trust Bank",
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-full"
                    >
                        {/* Handle Bar */}
                        <div className="flex justify-center pt-3 pb-4 bg-gradient-to-b from-card/95 to-card">
                            <div className="w-12 h-1 rounded-full bg-white/20" />
                        </div>

                        <div className="bg-[#1C1C1E] rounded-t-3xl px-6 pb-10 border-t border-white/10 shadow-2xl shadow-black/50">
                            {/* Header */}
                            <div className="flex items-center justify-between py-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Account Details</h3>
                                    <p className="text-white/50 text-xs mt-1">Extracted from image</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                    <X className="text-white" size={16} />
                                </button>
                            </div>

                            {/* Result Card */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 space-y-4">
                                {/* Account Number */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 flex items-center justify-center border border-[#00FF41]/20">
                                        <CreditCard className="text-[#00FF41]" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Account Number</p>
                                        <p className="text-white font-mono text-lg font-bold tracking-wide">{result.accountNumber}</p>
                                    </div>
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <Copy className="text-white/40" size={16} />
                                    </button>
                                </div>

                                <div className="h-px bg-white/5 w-full" />

                                {/* Account Name */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <User className="text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Account Name</p>
                                        <p className="text-white font-semibold text-base">{result.accountName}</p>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5 w-full" />

                                {/* Bank Name */}
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                        <Building2 className="text-orange-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Bank Name</p>
                                        <p className="text-white font-semibold text-base">{result.bankName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="h-14 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white font-semibold"
                                >
                                    Retake
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    className="h-14 rounded-2xl bg-[#00FF41] text-black hover:bg-[#00FF41]/90 font-bold text-base shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                                >
                                    Proceed to Pay
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
