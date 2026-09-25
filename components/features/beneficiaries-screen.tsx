"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Search,
  Mic,
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  User,
  Building2,
  CreditCard,
  CheckCircle2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useSession } from "@/components/session-provider"

interface BeneficiariesScreenProps {
  onBack: () => void
  userId?: Id<"users"> | string | null
  onSelectBeneficiary?: (beneficiary: Beneficiary) => void
}

interface Beneficiary {
  id: number
  _convexId?: string
  name: string
  bank: string
  accountNumber: string
  initials: string
  color: string
  lastUsed?: string
  isFavorite?: boolean
}

type ViewMode = "list" | "add" | "edit" | "details" | "success"

const banks = [
  "Access Bank",
  "GTBank",
  "Zenith Bank",
  "First Bank",
  "UBA",
  "Kuda Bank",
  "Opay",
  "Palmpay",
  "Stanbic IBTC",
  "Sterling Bank",
]

export default function BeneficiariesScreen({ onBack, userId, onSelectBeneficiary }: BeneficiariesScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null)
  const { session } = useSession()
  const effectiveUserId = (session?.userId ?? userId) as Id<"users"> | undefined
  const authed = effectiveUserId && session?.sessionToken
    ? { userId: effectiveUserId, sessionToken: session.sessionToken }
    : "skip"
  const liveBeneficiaries = useQuery(api.beneficiaries.getAll, authed)
  const addBeneficiary = useMutation(api.beneficiaries.add)
  const updateBeneficiary = useMutation(api.beneficiaries.update)
  const removeBeneficiary = useMutation(api.beneficiaries.remove)
  const lookupAccount = useAction((api as any).actions["9psb"].lookupAccount)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    accountNumber: "",
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifiedName, setVerifiedName] = useState("")
  const [formError, setFormError] = useState("")

  // Real saved beneficiaries only. The previous build showed five
  // hardcoded fake contacts here; an empty wallet now shows empty.
  const displayBeneficiaries: Beneficiary[] = (liveBeneficiaries ?? []).map((b: any, i: number) => ({
    id: i + 1000,
    _convexId: b._id,
    name: b.name,
    bank: b.bankName,
    accountNumber: b.accountNumber,
    initials: b.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
    color: "bg-teal-500",
    lastUsed: undefined as string | undefined,
    isFavorite: b.isFavorite,
  }))

  const frequentContacts = displayBeneficiaries.filter((b) => b.isFavorite)

  const filteredBeneficiaries = displayBeneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.accountNumber.includes(searchQuery),
  )

  // Bank name → NIP bank code for the lookup action.
  const bankCodeFor = (bankName: string) => {
    const codes: Record<string, string> = {
      "Access Bank": "044", GTBank: "058", "Zenith Bank": "057", "First Bank": "011",
      UBA: "033", "Kuda Bank": "090267", Opay: "100004", Palmpay: "100033",
      "Stanbic IBTC": "221", "Sterling Bank": "232",
    }
    return codes[bankName] ?? ""
  }

  const handleVerifyAccount = async () => {
    if (formData.accountNumber.length === 10 && formData.bank) {
      setIsVerifying(true)
      setFormError("")
      try {
        if (!session) throw new Error("You are not logged in.")
        const code = bankCodeFor(formData.bank)
        if (!code) throw new Error("Unsupported bank for verification")
        const result = await lookupAccount({
          userId: session.userId as Id<"users">,
          sessionToken: session.sessionToken,
          accountNumber: formData.accountNumber,
          bankCode: code,
        })
        if (result?.success && result?.data?.accountName) {
          // Sandbox names are explicitly UNVERIFIED (see convex/lib/9psb.ts).
          setVerifiedName(result.data.accountName)
        } else {
          throw new Error(result?.error?.message ?? "Verification failed")
        }
      } catch (e) {
        setFormError(e instanceof Error ? e.message : "Verification failed")
        setVerifiedName("")
      } finally {
        setIsVerifying(false)
      }
    }
  }

  const handleSaveBeneficiary = async () => {
    setFormError("")
    if (!effectiveUserId || !session?.sessionToken) {
      setFormError("You are not logged in.")
      return
    }
    try {
      if (viewMode === "edit" && selectedBeneficiary?._convexId) {
        await updateBeneficiary({
          userId: effectiveUserId,
          sessionToken: session.sessionToken,
          beneficiaryId: selectedBeneficiary._convexId as Id<"beneficiaries">,
          name: formData.name,
          bankName: formData.bank,
          accountNumber: formData.accountNumber,
        })
      } else {
        await addBeneficiary({
          userId: effectiveUserId,
          sessionToken: session.sessionToken,
          name: formData.name || verifiedName || "Unnamed",
          bankName: formData.bank,
          accountNumber: formData.accountNumber,
        })
      }
      setViewMode("success")
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not save beneficiary.")
    }
  }

  const handleDeleteBeneficiary = async (id: number) => {
    const target: any = displayBeneficiaries.find((b: any) => b.id === id)
    if (target?._convexId) {
      if (!effectiveUserId || !session?.sessionToken) return
      try {
        await removeBeneficiary({
          userId: effectiveUserId,
          sessionToken: session.sessionToken,
          beneficiaryId: target._convexId,
        })
      } catch {}
    }
    setShowActionMenu(null)
    if (selectedBeneficiary?.id === id) {
      setSelectedBeneficiary(null)
      setViewMode("list")
    }
  }

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary)
    setFormData({
      name: beneficiary.name,
      bank: beneficiary.bank,
      accountNumber: beneficiary.accountNumber,
    })
    setVerifiedName(beneficiary.name)
    setViewMode("edit")
    setShowActionMenu(null)
  }

  const resetForm = () => {
    setFormData({ name: "", bank: "", accountNumber: "" })
    setVerifiedName("")
    setSelectedBeneficiary(null)
  }

  // Success Screen
  if (viewMode === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col items-center justify-center px-5">
        <div className="w-24 h-24 rounded-full bg-[#00FF41]/10 border-2 border-[#00FF41] flex items-center justify-center mb-6">
          <CheckCircle2 className="text-[#00FF41]" size={48} />
        </div>
        <h1 className="text-white text-2xl font-bold mb-2">
          {selectedBeneficiary ? "Beneficiary Updated!" : "Beneficiary Added!"}
        </h1>
        <p className="text-white/50 text-sm mb-8 text-center">
          {formData.name} has been {selectedBeneficiary ? "updated" : "added"} to your beneficiaries list.
        </p>
        <button
          onClick={() => {
            setViewMode("list")
            resetForm()
          }}
          className="w-full max-w-xs h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-2xl transition-all"
        >
          Done
        </button>
      </div>
    )
  }

  // Add/Edit Beneficiary Screen
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
        <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/5">
          <button
            onClick={() => {
              setViewMode("list")
              resetForm()
            }}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-lg font-bold">
            {viewMode === "edit" ? "Edit Beneficiary" : "Add Beneficiary"}
          </h1>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* Bank Selection */}
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Select Bank</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <select
                value={formData.bank}
                onChange={(e) => {
                  setFormData({ ...formData, bank: e.target.value })
                  setVerifiedName("")
                }}
                className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0a1a12]">
                  Select a bank
                </option>
                {banks.map((bank) => (
                  <option key={bank} value={bank} className="bg-[#0a1a12]">
                    {bank}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">
              Account Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <Input
                type="text"
                maxLength={10}
                value={formData.accountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  setFormData({ ...formData, accountNumber: value })
                  setVerifiedName("")
                }}
                onBlur={handleVerifyAccount}
                placeholder="Enter 10-digit account number"
                className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
              />
              {isVerifying && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#00FF41] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Verified Account Name */}
          {verifiedName && (
            <div className="bg-[#00FF41]/5 border border-[#00FF41]/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-[#00FF41] flex-shrink-0" size={20} />
                <div>
                  <p className="text-[#00FF41] text-xs font-bold mb-0.5">Account Verified</p>
                  <p className="text-white font-semibold">{verifiedName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nickname (Optional) */}
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">
              Nickname (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mom, Landlord, etc."
                className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
              />
            </div>
          </div>

          {/* Save Button */}
          {formError && (
            <p className="text-red-400 text-sm text-center animate-pulse">{formError}</p>
          )}
          <button
            onClick={handleSaveBeneficiary}
            disabled={!formData.bank || formData.accountNumber.length !== 10}
            className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 disabled:bg-white/10 disabled:text-white/30 text-black font-bold text-base rounded-2xl transition-all"
          >
            {viewMode === "edit" ? "Update Beneficiary" : "Add Beneficiary"}
          </button>
        </div>
      </div>
    )
  }

  // Details Screen
  if (viewMode === "details" && selectedBeneficiary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode("list")
                setSelectedBeneficiary(null)
              }}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg font-bold">Beneficiary Details</h1>
          </div>
          <button
            onClick={() => handleEditBeneficiary(selectedBeneficiary)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Edit2 className="text-white" size={18} />
          </button>
        </div>

        <div className="px-5 py-6">
          {/* Profile Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-col items-center mb-6">
              <div
                className={`w-20 h-20 rounded-full ${selectedBeneficiary.color} flex items-center justify-center text-white font-bold text-2xl mb-3`}
              >
                {selectedBeneficiary.initials}
              </div>
              <h2 className="text-white font-bold text-xl">{selectedBeneficiary.name}</h2>
              <p className="text-white/50 text-sm">{selectedBeneficiary.bank}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/50 text-sm">Account Number</span>
                <span className="text-white font-mono">{selectedBeneficiary.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/50 text-sm">Bank</span>
                <span className="text-white">{selectedBeneficiary.bank}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-white/50 text-sm">Last Transaction</span>
                <span className="text-white">{selectedBeneficiary.lastUsed}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => onSelectBeneficiary?.(selectedBeneficiary)}
              className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-2xl transition-all"
            >
              Send Money
            </button>
            <button
              onClick={() => handleDeleteBeneficiary(selectedBeneficiary.id)}
              className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 size={18} />
              Delete Beneficiary
            </button>
          </div>
        </div>
      </div>
    )
  }

  // List Screen (Main)
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12]">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <h1 className="text-white text-lg font-bold">Beneficiaries</h1>
        </div>
        <button className="text-[#00FF41] text-sm font-bold">Manage</button>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, @tag, or bank..."
            className="w-full h-12 pl-11 pr-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00FF41] hover:text-[#00FF41]/80 transition-colors">
            <Mic size={18} />
          </button>
        </div>
      </div>

      {/* Frequent Contacts */}
      {frequentContacts.length > 0 && !searchQuery && (
        <div className="px-5 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white/70 text-xs font-bold uppercase tracking-wide">Frequent</h2>
            <button className="text-[#00FF41] text-xs font-bold">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {frequentContacts.map((contact) => (
              <button
                key={contact.id}
                className="flex flex-col items-center gap-2 flex-shrink-0"
                onClick={() => {
                  setSelectedBeneficiary(contact)
                  setViewMode("details")
                }}
              >
                <div
                  className={`w-14 h-14 rounded-full ${contact.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                >
                  {contact.initials}
                </div>
                <span className="text-white text-xs font-medium">{contact.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Contacts */}
      <div className="px-5">
        <h2 className="text-white/70 text-xs font-bold uppercase tracking-wide mb-3">All Contacts</h2>
        <div className="space-y-2">
          {filteredBeneficiaries.map((contact) => (
            <div key={contact.id} className="relative">
              <button
                onClick={() => {
                  setSelectedBeneficiary(contact)
                  setViewMode("details")
                }}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <div
                  className={`w-11 h-11 rounded-full ${contact.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {contact.initials}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white font-semibold text-sm mb-0.5 truncate">{contact.name}</p>
                  <p className="text-white/40 text-xs truncate">
                    {contact.bank} • {contact.accountNumber.slice(-4)}
                  </p>
                </div>
                <span className="text-white/20 text-xs mr-8">{contact.lastUsed}</span>
              </button>

              {/* Action Menu Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActionMenu(showActionMenu === contact.id ? null : contact.id)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <MoreVertical className="text-white/40" size={18} />
              </button>

              {/* Action Menu Dropdown */}
              {showActionMenu === contact.id && (
                <div className="absolute right-3 top-14 bg-[#1a2f22] border border-white/10 rounded-xl overflow-hidden shadow-xl z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditBeneficiary(contact)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                  >
                    <Edit2 className="text-white/60" size={16} />
                    <span className="text-white text-sm">Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteBeneficiary(contact.id)
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-t border-white/10"
                  >
                    <Trash2 className="text-red-500" size={16} />
                    <span className="text-red-500 text-sm">Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredBeneficiaries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">No beneficiaries found</p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setViewMode("add")}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 rounded-full flex items-center justify-center shadow-2xl shadow-[#00FF41]/30 transition-all"
      >
        <Plus className="text-black" size={24} />
      </button>

      {/* Bottom Safe Area */}
      <div className="h-24" />

      {/* Overlay to close action menu */}
      {showActionMenu && <div className="fixed inset-0 z-0" onClick={() => setShowActionMenu(null)} />}
    </div>
  )
}
