"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Trash2, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BudgetCategory {
  id: string
  name: string
  allocated: number
}

interface ManualBudgetCreatorScreenProps {
  onBack: () => void
}

export default function ManualBudgetCreatorScreen({ onBack }: ManualBudgetCreatorScreenProps) {
  const [budgetName, setBudgetName] = useState("My Budget")
  const [totalIncome, setTotalIncome] = useState("")
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { id: "1", name: "Housing", allocated: 250000 },
    { id: "2", name: "Food & Groceries", allocated: 80000 },
    { id: "3", name: "Transportation", allocated: 50000 },
    { id: "4", name: "Entertainment", allocated: 40000 },
    { id: "5", name: "Savings", allocated: 100000 },
  ])
  const [newCategory, setNewCategory] = useState("")
  const [newAmount, setNewAmount] = useState("")

  const addCategory = () => {
    if (newCategory && newAmount) {
      setCategories([
        ...categories,
        { id: Date.now().toString(), name: newCategory, allocated: parseFloat(newAmount) },
      ])
      setNewCategory("")
      setNewAmount("")
    }
  }

  const removeCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
  }

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const income = parseFloat(totalIncome) || 0
  const remaining = income - totalAllocated

  return (
    <div className="min-h-screen bg-gradient-to-b from-card to-background text-foreground pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/40 px-5 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-card rounded-lg transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-xl">Budget Creator</h1>
            <p className="text-xs text-muted-foreground">Create your custom budget</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Budget Name */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Budget Name</label>
          <input
            type="text"
            value={budgetName}
            onChange={(e) => setBudgetName(e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border/50 rounded-xl outline-none focus:border-[#00FF41]/50"
          />
        </div>

        {/* Monthly Income */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Monthly Income (NGN)</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border/50 rounded-xl">
            <DollarSign size={18} className="text-[#00FF41]" />
            <input
              type="number"
              placeholder="650,000"
              value={totalIncome}
              onChange={(e) => setTotalIncome(e.target.value)}
              className="flex-1 bg-transparent outline-none placeholder-muted-foreground"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Budget Categories</h3>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/50">
              <div className="flex-1">
                <p className="font-semibold text-sm">{category.name}</p>
                <p className="text-xs text-muted-foreground">₦{category.allocated.toLocaleString()}</p>
              </div>
              <button
                onClick={() => removeCategory(category.id)}
                className="p-2 hover:bg-background rounded-lg transition"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Category */}
        <div className="space-y-3 p-4 bg-card/50 border border-border/30 rounded-xl">
          <p className="font-semibold text-sm">Add Category</p>
          <input
            type="text"
            placeholder="Category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg outline-none focus:border-[#00FF41]/50 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border/50 rounded-lg outline-none focus:border-[#00FF41]/50 text-sm"
            />
            <Button
              onClick={addCategory}
              className="bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold px-4"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Budget Summary */}
        {totalIncome && (
          <div className="bg-card border border-[#00FF41]/30 rounded-2xl p-5 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground">Total Income</p>
                <p className="font-bold text-[#00FF41]">₦{income.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-muted-foreground">Total Allocated</p>
                <p className="font-bold">₦{totalAllocated.toLocaleString()}</p>
              </div>
              <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00FF41]"
                  style={{ width: `${Math.min((totalAllocated / income) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <p className="text-muted-foreground">Remaining</p>
                <p className={`font-bold ${remaining >= 0 ? "text-[#00FF41]" : "text-red-500"}`}>
                  ₦{remaining.toLocaleString()}
                </p>
              </div>
            </div>

            <Button className="w-full h-12 bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-bold rounded-xl">
              Save Budget
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
