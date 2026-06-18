"use client"

import { Send, QrCode, Sparkles, PiggyBank } from "lucide-react"

const actions = [
  { icon: Send, label: "Send Money", color: "text-blue-500" },
  { icon: QrCode, label: "Scan QR", color: "text-accent" },
  { icon: Sparkles, label: "AI Command", color: "text-purple-500" },
  { icon: PiggyBank, label: "Save Money", color: "text-orange-500" },
]

interface QuickActionsProps {
  onActionClick?: (action: string) => void
}

export default function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            onClick={() => onActionClick?.(action.label)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/60 hover:bg-secondary transition-all active:scale-95 border border-border/50"
          >
            <div className={`${action.color} bg-secondary p-2.5 rounded-lg`}>
              <Icon size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-medium text-center leading-tight text-foreground">{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}
