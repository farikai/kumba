import { Settings, Bell, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function WalletHeader() {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <div className="pt-12 pb-8 px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent via-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-accent/30 border-2 border-white/20">
              <User size={24} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-background" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-0.5">{getGreeting()}</p>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Adekunle</h2>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button className="relative w-11 h-11 rounded-xl bg-secondary/60 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-muted transition-all active:scale-95 border border-border/50 shadow-sm">
            <Bell size={20} strokeWidth={2} />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-white text-[10px] font-bold border-2 border-background">
              3
            </Badge>
          </button>
          <button className="w-11 h-11 rounded-xl bg-secondary/60 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-muted transition-all active:scale-95 border border-border/50 shadow-sm">
            <Settings size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
