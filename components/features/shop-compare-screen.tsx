"use client"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Mic, Bot, ShoppingCart, Send, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface Product {
  name: string
  price: number
  originalPrice?: number
  store: string
  rating?: number
  freeDelivery: boolean
  savings?: number
  inStock: boolean
  category: string
}

interface ShopCompareScreenProps {
  onBack: () => void
  onConfirmOrder?: (product: Product) => void
}

const categories = ["All", "Rice & Grains", "Beverages", "Electronics", "Fashion", "Home & Kitchen"]

export default function ShopCompareScreen({ onBack, onConfirmOrder }: ShopCompareScreenProps) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchedProduct, setSearchedProduct] = useState("")

  const allProducts = useQuery(api.products.getAll) ?? []
  const searchResults = useQuery(api.products.search, { query: searchedProduct || "__empty__" })
  const categoryResults = useQuery(api.products.getByCategory, { category: activeCategory === "All" ? "__all__" : activeCategory })
  const seedProducts = useMutation(api.products.seedProducts)

  useEffect(() => {
    seedProducts()
  }, [])

  const getDisplayProducts = (): Product[] => {
    if (searchedProduct) return (searchResults ?? []) as Product[]
    if (activeCategory !== "All") return (categoryResults ?? []) as Product[]
    return allProducts.slice(0, 20) as Product[]
  }

  const products = getDisplayProducts()

  const handleSearch = () => {
    if (!query.trim()) return
    setSearchedProduct(query)
    setActiveCategory("All")
  }

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat)
    setSearchedProduct("")
    setQuery("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a12] via-[#0d1f16] to-[#0a1a12] flex flex-col">
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/5 flex-shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="text-white" size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-lg font-bold">Shop & Compare</h1>
          <p className="text-white/40 text-xs">Powered by Kumba AI</p>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 h-12">
          <Search className="text-white/30" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search products across stores..."
            className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
          />
          {query && (
            <button onClick={handleSearch} className="text-[#00FF41] text-xs font-bold hover:text-[#00FF41]/80">
              Search
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button key={cat} onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat ? "bg-[#00FF41] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto text-white/20 mb-3" size={48} />
            <p className="text-white/40 text-sm">No products found</p>
            <p className="text-white/30 text-xs mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product, index) => (
              <div key={index}
                className={`rounded-2xl p-4 ${
                  index === 0 && !searchedProduct
                    ? "bg-gradient-to-br from-[#0f2a1c] to-[#0a1a12] border border-[#00FF41]/20"
                    : "bg-white/[0.03] border border-white/5"
                }`}
              >
                {index === 0 && !searchedProduct && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
                    <span className="text-[#00FF41] text-[10px] font-bold uppercase tracking-wide">Best Value</span>
                    {product.savings ? <span className="text-white/40 text-xs ml-auto">Save ₦{product.savings.toLocaleString()}</span> : null}
                  </div>
                )}

                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00FF41]/20 to-[#00FF41]/5 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={24} className="text-[#00FF41]/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-white/40 text-xs mb-1.5">
                      {product.store} {product.rating ? `• ${product.rating}/5` : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF41] text-lg font-bold">₦{product.price.toLocaleString()}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-white/30 text-xs line-through">₦{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {product.freeDelivery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-lg text-[#00FF41] text-[10px] font-bold">
                      FREE DELIVERY
                    </span>
                  )}
                  {!product.inStock && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-[10px] font-bold">
                      OUT OF STOCK
                    </span>
                  )}
                  <span className="text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded-lg">{product.category}</span>
                </div>

                {product.inStock ? (
                  <Button onClick={() => onConfirmOrder?.(product)}
                    className={`w-full h-10 mt-3 ${
                      index === 0 && !searchedProduct
                        ? "bg-[#00FF41] hover:bg-[#00FF41]/90 text-black shadow-lg shadow-[#00FF41]/20"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    } font-bold text-sm rounded-xl transition-all`}
                  >
                    <ShoppingCart size={14} className="mr-2" />
                    Buy with Kumba
                  </Button>
                ) : (
                  <Button disabled className="w-full h-10 mt-3 bg-white/5 text-white/30 border border-white/10 font-bold text-sm rounded-xl cursor-not-allowed">
                    Out of Stock
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-white/5 flex-shrink-0">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask Kumba to find products..."
              className="w-full h-12 pl-4 pr-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FF41] hover:text-[#00FF41]/80 transition-colors">
              <Mic size={18} />
            </button>
          </div>
          <button onClick={handleSearch} disabled={!query.trim()}
            className="w-12 h-12 rounded-xl bg-[#00FF41] hover:bg-[#00FF41]/90 disabled:bg-white/5 disabled:text-white/20 flex items-center justify-center transition-all"
          >
            <Send size={18} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  )
}
