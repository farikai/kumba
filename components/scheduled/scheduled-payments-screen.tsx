"use client"
import type React from "react"
import { useState } from "react"
import {
  ArrowLeft, Plus, Wifi, Tv, Home, Dumbbell, MoreVertical, Sparkles,
  Zap, Phone, CreditCard, Pause, Play, Trash2, Calendar, PiggyBank, ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface ScheduledPaymentsScreenProps {
  onBack: () => void
  userId: Id<"users">
}

const iconMap: Record<string, React.ElementType> = {
  Home, Wifi, Tv, Dumbbell, Zap, Phone, CreditCard, Calendar, PiggyBank, ShoppingBag,
}

function getIcon(name: string) {
  return iconMap[name] || Calendar
}

function deriveIcon(name: string, desc?: string): string {
  const lower = (name + " " + (desc ?? "")).toLowerCase()
  if (lower.includes("rent") || lower.includes("mortgage")) return "Home"
  if (lower.includes("wifi") || lower.includes("data") || lower.includes("internet")) return "Wifi"
  if (lower.includes("tv") || lower.includes("netflix") || lower.includes("dstv") || lower.includes("gotv")) return "Tv"
  if (lower.includes("gym") || lower.includes("fitness")) return "Dumbbell"
  if (lower.includes("electric") || lower.includes("light") || lower.includes("bill")) return "Zap"
  if (lower.includes("phone") || lower.includes("airtime") || lower.includes("mobile")) return "Phone"
  if (lower.includes("card") || lower.includes("subscription")) return "CreditCard"
  if (lower.includes("saving") || lower.includes("piggy")) return "PiggyBank"
  if (lower.includes("shop") || lower.includes("buy") || lower.includes("grocer")) return "ShoppingBag"
  return "Calendar"
}

const iconOptions = [
  { name: "Home", icon: Home },
  { name: "Wifi", icon: Wifi },
  { name: "Tv", icon: Tv },
  { name: "Gym", icon: Dumbbell },
  { name: "Zap", icon: Zap },
  { name: "Phone", icon: Phone },
  { name: "Card", icon: CreditCard },
  { name: "Piggy", icon: PiggyBank },
  { name: "Shop", icon: ShoppingBag },
]

export default function ScheduledPaymentsScreen({ onBack, userId }: ScheduledPaymentsScreenProps) {
  const paymentsData = useQuery(api.scheduled.list, { userId })
  const toggleActive = useMutation(api.scheduled.toggleActive)
  const removePayment = useMutation(api.scheduled.remove)
  const createPayment = useMutation(api.scheduled.create)

  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Paused" | "History">("All")
  const [selectedIcon, setSelectedIcon] = useState(0)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    recipient: "",
    amount: "",
    frequency: "monthly" as "daily" | "weekly" | "monthly",
    nextDate: "",
  })

  const payments = (paymentsData ?? []).map((p) => ({
    ...p,
    _id: p._id.toString(),
    iconName: p.icon ?? deriveIcon(p.recipientName, p.description),
  }))

  const activePayments = payments.filter((p) => p.isActive)
  const totalUpcoming = activePayments.reduce((sum, p) => sum + p.amount, 0)
  const nextPayment = activePayments.length > 0 ? activePayments[0] : null

  const filteredPayments = payments.filter((payment) => {
    if (activeTab === "Active") return payment.isActive
    if (activeTab === "Paused") return !payment.isActive
    if (activeTab === "History") return !payment.isActive
    return true
  })

  const thisWeekPayments = filteredPayments.filter((p) => {
    const in7days = Date.now() + 7 * 86400000
    return p.nextPaymentDate <= in7days
  })
  const laterThisMonthPayments = filteredPayments.filter((p) => {
    const in7days = Date.now() + 7 * 86400000
    return p.nextPaymentDate > in7days
  })

  const handleToggle = (id: string) => {
    toggleActive({ id: id as unknown as Id<"scheduledPayments"> })
    setShowActionMenu(null)
  }

  const handleDelete = (id: string) => {
    removePayment({ id: id as unknown as Id<"scheduledPayments"> })
    setShowActionMenu(null)
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    await createPayment({
      userId,
      recipientName: formData.name,
      amount: Number.parseFloat(formData.amount),
      frequency: formData.frequency,
      nextPaymentDate: new Date(formData.nextDate).getTime(),
      description: formData.recipient,
      icon: iconOptions[selectedIcon].name,
    })
    setShowAddForm(false)
    setFormData({ name: "", recipient: "", amount: "", frequency: "monthly", nextDate: "" })
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diffDays = Math.round((d.getTime() - now.getTime()) / 86400000)
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "long" })
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0f2818] to-[#0a1a12]">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setShowAddForm(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-lg font-bold">New Scheduled Payment</h1>
        </div>
        <form onSubmit={handleAddPayment} className="px-5 py-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-white/80 text-sm">Select Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {iconOptions.map((opt, i) => {
                const IconComp = opt.icon
                return (
                  <button key={i} type="button" onClick={() => setSelectedIcon(i)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedIcon === i ? "bg-[#00FF41] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                  >
                    <IconComp size={20} />
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80 text-sm">Payment Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Electricity Bill" required className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-white/80 text-sm">Recipient / Description</Label>
            <Input id="recipient" value={formData.recipient} onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} placeholder="e.g., Eko Disco" required className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white/80 text-sm">Amount (₦)</Label>
            <Input id="amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" required className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80 text-sm">Frequency</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["daily", "weekly", "monthly"] as const).map((freq) => (
                <button key={freq} type="button" onClick={() => setFormData({ ...formData, frequency: freq })}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${formData.frequency === freq ? "bg-[#00FF41] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextDate" className="text-white/80 text-sm">First Payment Date</Label>
            <Input id="nextDate" type="date" value={formData.nextDate} onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })} required className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          </div>
          <Button type="submit" className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-xl">
            Schedule Payment
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0f2818] to-[#0a1a12] pb-24">
      <div className="px-5 py-5 flex items-center justify-between border-b border-white/5">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white text-lg font-bold">Scheduled Payments</h1>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <MoreVertical size={20} className="text-white" />
        </button>
      </div>

      <div className="px-5 py-5 grid grid-cols-2 gap-3">
        <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4">
          <p className="text-white/40 text-xs mb-1">Total Upcoming</p>
          <h2 className="text-white text-2xl font-bold mb-1">₦{totalUpcoming.toLocaleString()}</h2>
          <p className="text-[#00FF41] text-xs font-medium">{activePayments.length} active payments</p>
        </div>
        {nextPayment ? (
          <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4">
            <p className="text-white/40 text-xs mb-1">Next Payment</p>
            <h3 className="text-white text-base font-bold mb-1 truncate">{nextPayment.recipientName}</h3>
            <div className="flex items-center gap-1 text-[#00FF41] text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
              {formatDate(nextPayment.nextPaymentDate)}
            </div>
          </div>
        ) : (
          <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4 flex items-center justify-center">
            <p className="text-white/40 text-xs">No upcoming payments</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <div className="flex gap-2">
          {(["All", "Active", "Paused", "History"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${activeTab === tab ? "bg-[#00FF41] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {thisWeekPayments.length > 0 && (
        <div className="px-5 pb-5">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">THIS WEEK</h3>
          <div className="space-y-2">
            {thisWeekPayments.map((payment) => {
              const Icon = getIcon(payment.iconName)
              return (
                <div key={payment._id} className="bg-[#0d2419]/30 border border-white/5 rounded-2xl p-4 hover:bg-[#0d2419]/50 transition-all relative">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white text-sm">{payment.recipientName}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${payment.isActive ? "text-[#00FF41] bg-[#00FF41]/10" : "text-yellow-500 bg-yellow-500/10"}`}>
                            {payment.isActive ? "ACTIVE" : "PAUSED"}
                          </span>
                          <button onClick={() => setShowActionMenu(showActionMenu === payment._id ? null : payment._id)} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center">
                            <MoreVertical size={14} className="text-white/40" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-white/40 mb-1">{formatDate(payment.nextPaymentDate)} • {payment.description ?? payment.frequency}</p>
                      <p className="text-white font-bold text-base">₦{payment.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  {showActionMenu === payment._id && (
                    <div className="absolute right-4 top-14 bg-[#1a2f22] border border-white/10 rounded-xl overflow-hidden shadow-xl z-10">
                      <button onClick={() => handleToggle(payment._id)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                        {payment.isActive ? <Pause size={16} className="text-yellow-500" /> : <Play size={16} className="text-[#00FF41]" />}
                        <span className="text-white text-sm">{payment.isActive ? "Pause" : "Resume"}</span>
                      </button>
                      <button onClick={() => handleDelete(payment._id)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-t border-white/10">
                        <Trash2 size={16} className="text-red-500" />
                        <span className="text-red-500 text-sm">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {laterThisMonthPayments.length > 0 && (
        <div className="px-5 pb-5">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">LATER THIS MONTH</h3>
          <div className="space-y-2">
            {laterThisMonthPayments.map((payment) => {
              const Icon = getIcon(payment.iconName)
              return (
                <div key={payment._id} className="bg-[#0d2419]/30 border border-white/5 rounded-2xl p-4 hover:bg-[#0d2419]/50 transition-all relative">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className={payment.isActive ? "text-white" : "text-white/40"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white text-sm">{payment.recipientName}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${payment.isActive ? "text-[#00FF41] bg-[#00FF41]/10" : "text-yellow-500 bg-yellow-500/10"}`}>
                            {payment.isActive ? "ACTIVE" : "PAUSED"}
                          </span>
                          <button onClick={() => setShowActionMenu(showActionMenu === payment._id ? null : payment._id)} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center">
                            <MoreVertical size={14} className="text-white/40" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-white/40 mb-1">{formatDate(payment.nextPaymentDate)} • {payment.description ?? payment.frequency}</p>
                      <p className="text-white font-bold text-base">₦{payment.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  {showActionMenu === payment._id && (
                    <div className="absolute right-4 top-14 bg-[#1a2f22] border border-white/10 rounded-xl overflow-hidden shadow-xl z-10">
                      <button onClick={() => handleToggle(payment._id)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                        {payment.isActive ? <Pause size={16} className="text-yellow-500" /> : <Play size={16} className="text-[#00FF41]" />}
                        <span className="text-white text-sm">{payment.isActive ? "Pause" : "Resume"}</span>
                      </button>
                      <button onClick={() => handleDelete(payment._id)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-t border-white/10">
                        <Trash2 size={16} className="text-red-500" />
                        <span className="text-red-500 text-sm">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {filteredPayments.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-white/40 text-sm">No scheduled payments found</p>
        </div>
      )}

      <div className="fixed bottom-20 left-0 right-0 px-5">
        <div className="bg-[#0a1a12]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00FF41]/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-[#00FF41]" size={16} />
            </div>
            <p className="text-white/70 text-xs flex-1">
              <span className="text-[#00FF41] font-bold">Kumba</span> to schedule a payment!
            </p>
            <button onClick={() => setShowAddForm(true)}
              className="w-10 h-10 rounded-full bg-[#00FF41] flex items-center justify-center hover:bg-[#00FF41]/90 transition-all shadow-lg shadow-[#00FF41]/30"
            >
              <Plus size={20} className="text-black" />
            </button>
          </div>
        </div>
      </div>

      {showActionMenu && <div className="fixed inset-0 z-0" onClick={() => setShowActionMenu(null)} />}
    </div>
  )
}
