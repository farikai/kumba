"use client"
import { useState } from "react"
import { ArrowLeft, Plus, Store, Package, TrendingUp, DollarSign, Edit3, Trash2, Loader2 } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SellerDashboardProps {
  onBack: () => void
  userId: Id<"users">
}

const categories = [
  "Food & Groceries", "Beverages", "Electronics", "Fashion",
  "Home & Kitchen", "Health & Beauty", "Books", "Other",
]

export default function SellerDashboard({ onBack, userId }: SellerDashboardProps) {
  const sellerProfile = useQuery(api.sellers.getProfile, { userId })
  const [view, setView] = useState<"overview" | "register" | "products" | "addProduct" | "orders" | "payouts">("overview")

  const registerStore = useMutation(api.sellers.registerStore)
  const addProduct = useMutation(api.sellers.addProduct)
  const removeProduct = useMutation(api.sellers.removeProduct)

  const [regForm, setRegForm] = useState({ storeName: "", description: "", phone: "", email: "", address: "" })
  const [prodForm, setProdForm] = useState({
    name: "", description: "", price: "", originalPrice: "", category: "", stock: "1", tags: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const sellerId = sellerProfile?._id

  const products = useQuery(api.sellers.listMyProducts, sellerId ? { sellerId } : "skip")
  const orders = useQuery(api.sellers.getOrders, sellerId ? { sellerId } : "skip")
  const payouts = useQuery(api.sellers.getPayoutHistory, sellerId ? { sellerId } : "skip")

  const handleRegister = async () => {
    setSubmitting(true)
    try {
      await registerStore({ userId, ...regForm })
      setView("overview")
    } catch (e: any) {
      alert(e.message)
    }
    setSubmitting(false)
  }

  const handleAddProduct = async () => {
    if (!sellerId) return
    setSubmitting(true)
    try {
      await addProduct({
        sellerId,
        userId,
        name: prodForm.name,
        description: prodForm.description,
        price: Number.parseFloat(prodForm.price),
        originalPrice: prodForm.originalPrice ? Number.parseFloat(prodForm.originalPrice) : undefined,
        category: prodForm.category,
        images: [],
        stock: Number.parseInt(prodForm.stock) || 1,
        tags: prodForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      })
      setProdForm({ name: "", description: "", price: "", originalPrice: "", category: "", stock: "1", tags: "" })
      setView("products")
    } catch (e: any) {
      alert(e.message)
    }
    setSubmitting(false)
  }

  const handleDeleteProduct = async (productId: Id<"sellerProducts">) => {
    if (confirm("Delete this product?")) {
      await removeProduct({ productId })
    }
  }

  // Register view
  if (view === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] to-[#0f2818]">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setView("overview")} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-lg font-bold">Register Your Store</h1>
        </div>
        <div className="px-5 py-6 space-y-5">
          <Input placeholder="Store Name" value={regForm.storeName} onChange={(e) => setRegForm({ ...regForm, storeName: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          <Input placeholder="Description (optional)" value={regForm.description} onChange={(e) => setRegForm({ ...regForm, description: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          <Input placeholder="Phone Number" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          <Input placeholder="Email (optional)" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          <Input placeholder="Store Address" value={regForm.address} onChange={(e) => setRegForm({ ...regForm, address: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          <Button onClick={handleRegister} disabled={submitting || !regForm.storeName || !regForm.phone || !regForm.address}
            className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-xl">
            {submitting ? "Registering..." : "Register Store"}
          </Button>
        </div>
      </div>
    )
  }

  // Add product view
  if (view === "addProduct") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] to-[#0f2818]">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setView("products")} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-lg font-bold">Add Product</h1>
        </div>
        <div className="px-5 py-6 space-y-5">
          <Input placeholder="Product Name" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          <Input placeholder="Description" value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Price (₦)" type="number" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
            <Input placeholder="Original Price (₦)" type="number" value={prodForm.originalPrice} onChange={(e) => setProdForm({ ...prodForm, originalPrice: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          </div>
          <select value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white px-4 outline-none">
            <option value="" className="bg-[#0a1a12]">Select Category</option>
            {categories.map((c) => <option key={c} value={c} className="bg-[#0a1a12]">{c}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Stock Quantity" type="number" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
            <Input placeholder="Tags (comma separated)" value={prodForm.tags} onChange={(e) => setProdForm({ ...prodForm, tags: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl" />
          </div>
          <Button onClick={handleAddProduct} disabled={submitting || !prodForm.name || !prodForm.price || !prodForm.category}
            className="w-full h-14 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold text-base rounded-xl">
            {submitting ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </div>
    )
  }

  // Products list view
  if (view === "products") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] to-[#0f2818] pb-24">
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/5">
          <button onClick={() => setView("overview")} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-lg font-bold">My Products</h1>
          <button onClick={() => setView("addProduct")} className="w-10 h-10 rounded-full bg-[#00FF41] flex items-center justify-center">
            <Plus size={20} className="text-black" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-3">
          {(!products || products.length === 0) ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-white/20 mb-3" size={48} />
              <p className="text-white/40 text-sm">No products yet</p>
              <Button onClick={() => setView("addProduct")} className="mt-4 bg-[#00FF41] text-black font-bold rounded-xl">
                <Plus size={16} className="mr-2" /> Add Product
              </Button>
            </div>
          ) : (
            products.map((p) => (
              <div key={p._id} className="bg-[#0d2419]/30 border border-white/5 rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm">{p.name}</h3>
                    <p className="text-white/40 text-xs mt-1 line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[#00FF41] font-bold">₦{p.price.toLocaleString()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        p.status === "active" ? "bg-[#00FF41]/10 text-[#00FF41]" :
                        p.status === "pending_review" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-white/10 text-white/40"
                      }`}>{p.status.replace("_", " ")}</span>
                      <span className="text-white/30 text-xs">Stock: {p.stock}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(p._id)} className="text-white/20 hover:text-red-500 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // Orders view
  if (view === "orders") {
    const totalSales = (orders ?? []).reduce((s, o) => s + (o.status === "completed" ? o.productPrice : 0), 0)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] to-[#0f2818] pb-24">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setView("overview")} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-lg font-bold">Orders ({orders?.length ?? 0})</h1>
        </div>
        <div className="px-5 py-3">
          <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4 mb-4">
            <p className="text-white/40 text-xs mb-1">Total Completed Sales</p>
            <p className="text-white text-2xl font-bold">₦{totalSales.toLocaleString()}</p>
          </div>
          {(orders ?? []).length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {(orders ?? []).map((o) => (
                <div key={o._id} className="bg-[#0d2419]/30 border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold text-sm">{o.productName}</p>
                      <p className="text-white/40 text-xs">₦{o.productPrice.toLocaleString()} • Ref: {o.reference}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                      o.status === "completed" ? "bg-[#00FF41]/10 text-[#00FF41]" :
                      o.status === "pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                    }`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Payouts view
  if (view === "payouts") {
    const totalPayouts = (payouts ?? []).reduce((s, p) => s + (p.status === "completed" ? p.amount : 0), 0)
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] to-[#0f2818] pb-24">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setView("overview")} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-lg font-bold">Payouts</h1>
        </div>
        <div className="px-5 py-3">
          <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4 mb-4">
            <p className="text-white/40 text-xs mb-1">Total Paid Out</p>
            <p className="text-white text-2xl font-bold">₦{totalPayouts.toLocaleString()}</p>
          </div>
          {(payouts ?? []).length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No payouts yet</p>
          ) : (
            <div className="space-y-2">
              {(payouts ?? []).map((p) => (
                <div key={p._id} className="bg-[#0d2419]/30 border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold text-sm">₦{p.amount.toLocaleString()}</p>
                      <p className="text-white/40 text-xs">Ref: {p.reference}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                      p.status === "completed" ? "bg-[#00FF41]/10 text-[#00FF41]" :
                      p.status === "pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                    }`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Overview (default)
  const storeStatus = sellerProfile?.status ?? "not_registered"
  const activeProducts = (products ?? []).filter((p) => p.status === "active").length
  const pendingProducts = (products ?? []).filter((p) => p.status === "pending_review").length
  const completedOrders = (orders ?? []).filter((o) => o.status === "completed").length
  const totalRevenue = (orders ?? []).reduce((s, o) => s + (o.status === "completed" ? o.productPrice : 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] to-[#0f2818] pb-24">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-lg font-bold">Seller Dashboard</h1>
          {sellerProfile ? (
            <p className="text-[#00FF41] text-xs font-medium capitalize">{sellerProfile.storeName} • {sellerProfile.status}</p>
          ) : (
            <p className="text-white/40 text-xs">Become a seller on Kumbapay Marketplace</p>
          )}
        </div>
        {sellerProfile && sellerProfile.status === "active" && (
          <button onClick={() => setView("addProduct")} className="w-10 h-10 rounded-full bg-[#00FF41] flex items-center justify-center">
            <Plus size={20} className="text-black" />
          </button>
        )}
      </div>

      {storeStatus === "not_registered" ? (
        <div className="px-5 py-12 text-center space-y-4">
          <Store className="mx-auto text-[#00FF41]" size={64} />
          <h2 className="text-white text-xl font-bold">Start Selling on Kumbapay</h2>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            Register your store and start selling to thousands of Kumbapay users across Nigeria.
          </p>
          <Button onClick={() => setView("register")} className="bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold px-8 h-12 rounded-xl">
            Register Store
          </Button>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto pt-4">
            {[
              { icon: Package, label: "List Products", desc: "Add your inventory" },
              { icon: TrendingUp, label: "Get Sales", desc: "Reach customers" },
              { icon: DollarSign, label: "Get Paid", desc: "Withdraw earnings" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 flex items-center justify-center mx-auto mb-1">
                    <Icon className="text-[#00FF41]" size={18} />
                  </div>
                  <p className="text-white text-[10px] font-semibold">{item.label}</p>
                  <p className="text-white/30 text-[8px]">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="px-5 py-5 space-y-5">
          {/* Status Banner */}
          {storeStatus !== "active" && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
              <p className="text-yellow-500 text-sm font-semibold">
                {storeStatus === "pending" ? "Your store is under review. You'll be notified when approved." :
                 storeStatus === "suspended" ? "Your store has been suspended. Contact support." :
                 "Your registration was rejected."}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4">
              <Package className="text-[#00FF41] mb-2" size={20} />
              <p className="text-white text-2xl font-bold">{activeProducts}</p>
              <p className="text-white/40 text-xs">Active Products</p>
            </div>
            <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4">
              <TrendingUp className="text-[#00FF41] mb-2" size={20} />
              <p className="text-white text-2xl font-bold">{completedOrders}</p>
              <p className="text-white/40 text-xs">Orders Fulfilled</p>
            </div>
            <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4">
              <DollarSign className="text-[#00FF41] mb-2" size={20} />
              <p className="text-white text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
              <p className="text-white/40 text-xs">Total Revenue</p>
            </div>
            <div className="bg-[#0d2419]/50 border border-white/5 rounded-2xl p-4">
              <Edit3 className="text-[#00FF41] mb-2" size={20} />
              <p className="text-white text-2xl font-bold">{pendingProducts}</p>
              <p className="text-white/40 text-xs">Pending Review</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            {[
              { label: "Manage Products", sub: `${activeProducts} active · ${pendingProducts} pending`, view: "products" as const, icon: Package },
              { label: "View Orders", sub: `${completedOrders} completed`, view: "orders" as const, icon: TrendingUp },
              { label: "Payout History", sub: `${(payouts ?? []).length} transactions`, view: "payouts" as const, icon: DollarSign },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button key={item.label} onClick={() => setView(item.view)}
                  className="w-full bg-[#0d2419]/30 border border-white/5 rounded-2xl p-4 flex items-center gap-3 hover:bg-[#0d2419]/50 transition-all text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#00FF41]/10 flex items-center justify-center">
                    <Icon className="text-[#00FF41]" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{item.label}</p>
                    <p className="text-white/40 text-xs">{item.sub}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Commission Info */}
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <p className="text-white/50 text-xs">Commission Rate</p>
            <p className="text-[#00FF41] font-bold text-lg">{sellerProfile?.commissionRate ?? 5}%</p>
            <p className="text-white/30 text-[10px]">Kumbapay charges {sellerProfile?.commissionRate ?? 5}% per sale</p>
          </div>
        </div>
      )}
    </div>
  )
}
