"use client"

import { useState } from "react"
import { ArrowLeft, Calculator, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AiTaxCalculatorScreenProps {
  onBack: () => void
}

export default function AiTaxCalculatorScreen({ onBack }: AiTaxCalculatorScreenProps) {
  const [annualIncome, setAnnualIncome] = useState("")
  const [deductions, setDeductions] = useState("")
  const [taxCalculated, setTaxCalculated] = useState(false)
  const [estimatedTax, setEstimatedTax] = useState(0)

  const calculateTax = () => {
    const income = parseFloat(annualIncome) || 0
    const ded = parseFloat(deductions) || 0
    const taxableIncome = income - ded
    
    // Simplified Nigerian tax brackets
    let tax = 0
    if (taxableIncome > 3000000) {
      tax = (taxableIncome - 3000000) * 0.24 + 435000
    } else if (taxableIncome > 1000000) {
      tax = (taxableIncome - 1000000) * 0.19 + 100000
    } else if (taxableIncome > 500000) {
      tax = (taxableIncome - 500000) * 0.12
    }
    
    setEstimatedTax(tax)
    setTaxCalculated(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-card to-background text-foreground pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/40 px-5 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-card rounded-lg transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-xl">AI Tax Calculator</h1>
            <p className="text-xs text-muted-foreground">Estimate your income tax</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Info Card */}
        <div className="bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold text-[#00FF41]">Smart Tax Planning</p>
          <p className="text-xs text-muted-foreground">
            Enter your annual income and deductions to calculate your estimated tax liability under Nigerian FIRS guidelines.
          </p>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          {/* Annual Income */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Annual Income (NGN)</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border/50 rounded-xl">
              <DollarSign size={18} className="text-[#00FF41]" />
              <input
                type="number"
                placeholder="3,000,000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="flex-1 bg-transparent outline-none placeholder-muted-foreground"
              />
            </div>
          </div>

          {/* Deductions */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Deductions (NGN)</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border/50 rounded-xl">
              <TrendingUp size={18} className="text-muted-foreground" />
              <input
                type="number"
                placeholder="500,000"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="flex-1 bg-transparent outline-none placeholder-muted-foreground"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateTax}
            className="w-full h-12 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold rounded-xl"
          >
            <Calculator size={18} className="mr-2" />
            Calculate Tax
          </Button>
        </div>

        {/* Results */}
        {taxCalculated && (
          <div className="space-y-4">
            <div className="bg-card border border-[#00FF41]/30 rounded-2xl p-5 space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Estimated Annual Tax</p>
                <p className="text-3xl font-bold text-[#00FF41]">₦{estimatedTax.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Taxable Income</p>
                  <p className="font-bold">₦{(parseFloat(annualIncome || "0") - parseFloat(deductions || "0")).toLocaleString()}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Effective Rate</p>
                  <p className="font-bold">{((estimatedTax / parseFloat(annualIncome || "1")) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-card/50 border border-border/50 rounded-2xl p-4 space-y-3">
              <p className="font-semibold text-sm">Kumba AI Tax Tips</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>• Maximize your deductions to reduce taxable income</li>
                <li>• Consider quarterly tax payments to avoid penalties</li>
                <li>• Set aside 25% of income to cover tax obligations</li>
                <li>• Keep detailed records of all deductible expenses</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
