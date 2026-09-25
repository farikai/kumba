"use client"

import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Bell } from "lucide-react"
import { useSession } from "@/components/session-provider"

/**
 * Read-only reminders for scheduled payments due within 24h.
 *
 * Previously this component simulated autopay from localStorage with a
 * hardcoded mock balance and displayed fake success/failure toasts.
 * Execution now belongs exclusively to the server cron
 * (convex/crons.ts → scheduled:executePayments); this only reminds.
 */
export default function NotificationManager() {
  const { session } = useSession()
  const payments = useQuery(
    api.scheduled.list,
    session ? { userId: session.userId as Id<"users">, sessionToken: session.sessionToken } : "skip"
  )

  const dueSoon = useMemo(() => {
    const now = Date.now()
    const in24h = now + 24 * 60 * 60 * 1000
    return (payments ?? []).filter(
      (p) => p.isActive && p.nextPaymentDate >= now && p.nextPaymentDate <= in24h
    )
  }, [payments])

  if (dueSoon.length === 0) return null
  const next = dueSoon[0]

  return (
    <div className="px-5 pt-4 relative z-10">
      <div className="max-w-md mx-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-xl bg-orange-500/20 border-orange-500/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-500/20">
            <Bell className="text-orange-400" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-1 text-orange-400">Payment Due Soon</h3>
            <p className="text-white text-xs leading-relaxed">
              ₦{next.amount.toLocaleString()} to {next.recipientName} is due{" "}
              {new Date(next.nextPaymentDate).toLocaleString("en-NG")}.
              {dueSoon.length > 1 ? ` +${dueSoon.length - 1} more due within 24h.` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
