import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

const transactions = [
  {
    id: 1,
    type: "sent",
    name: "Amina Adeyemi",
    amount: "5,000",
    time: "Today, 2:30 PM",
    category: "transfer",
  },
  {
    id: 2,
    type: "received",
    name: "Salary Credit",
    amount: "150,000",
    time: "Yesterday, 9:00 AM",
    category: "credit",
  },
  {
    id: 3,
    type: "sent",
    name: "Electricity Bill",
    amount: "2,500",
    time: "2 days ago",
    category: "bill",
  },
]

export default function TransactionList() {
  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const isSent = tx.type === "sent"
        const Icon = isSent ? ArrowUpRight : ArrowDownLeft
        const iconBg = isSent ? "bg-red-500/10" : "bg-green-500/10"
        const iconColor = isSent ? "text-red-500" : "text-green-500"

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-secondary/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center`}>
                <Icon size={20} className={iconColor} strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{tx.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tx.time}</p>
              </div>
            </div>
            <p className={`font-bold text-sm ${isSent ? "text-red-500" : "text-green-500"}`}>
              {isSent ? "-" : "+"}₦{tx.amount}
            </p>
          </div>
        )
      })}
    </div>
  )
}
