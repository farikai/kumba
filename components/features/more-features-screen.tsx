"use client"

import { ArrowLeft, Calculator, TrendingUp, PiggyBank, Calendar } from "lucide-react"

interface MoreFeaturesScreenProps {
  onBack: () => void
  onSelectFeature: (feature: string) => void
}

export default function MoreFeaturesScreen({ onBack, onSelectFeature }: MoreFeaturesScreenProps) {
  const features = [
    {
      id: "taxCalculator",
      icon: Calculator,
      title: "AI Tax Calculator",
      description: "Calculate estimated income tax with smart deductions",
      color: "#FF6B6B",
    },
    {
      id: "financialAnalyzer",
      icon: TrendingUp,
      title: "Financial Stability",
      description: "AI analysis of your financial health & spending patterns",
      color: "#00FF41",
    },
    {
      id: "budgetCreator",
      icon: PiggyBank,
      title: "Budget Creator",
      description: "Manually create and manage custom budgets",
      color: "#4ECDC4",
    },
    {
      id: "scheduled",
      icon: Calendar,
      title: "Scheduled Payments",
      description: "View and manage all your scheduled transactions",
      color: "#FFB800",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-card to-background text-foreground pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/40 px-5 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-card rounded-lg transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-xl">More Features</h1>
            <p className="text-xs text-muted-foreground">Advanced financial tools</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-5 py-6">
        <div className="space-y-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <button
                key={feature.id}
                onClick={() => onSelectFeature(feature.id)}
                className="w-full p-5 rounded-xl border border-border/50 hover:border-[#00FF41]/50 bg-card hover:bg-card/80 transition text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg" style={{ background: feature.color + "20" }}>
                    <Icon size={24} style={{ color: feature.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <div className="text-[#00FF41]">→</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
