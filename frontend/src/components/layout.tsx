import { Link, useLocation } from "wouter";
import { 
  ShieldAlert, 
  Activity, 
  MessageSquareWarning, 
  ShieldQuestion, 
  RadioTower,
  Globe,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/message-analyzer", label: "Message Analyzer", icon: MessageSquareWarning },
  { href: "/scam-detection", label: "Scam Detection", icon: ShieldQuestion },
  { href: "/threat-intelligence", label: "Threat Intelligence", icon: RadioTower },
  { href: "/link-checker", label: "Link Checker", icon: Globe },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans dark">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card z-50">
        <div className="flex items-center gap-2 text-primary">
          <ShieldAlert className="h-6 w-6" />
          <span className="font-bold tracking-tight">AI Guardian</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0 mt-[73px] md:mt-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex p-6 items-center gap-2 text-primary border-b border-sidebar-border">
          <ShieldAlert className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight">AI Guardian</span>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2 px-4">
          <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-2">
            Intelligence
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-sidebar-primary/10 text-sidebar-primary shadow-[inset_2px_0_0_0_hsl(var(--sidebar-primary))]" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}>
                    <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/40 text-center">
          SYSTEM ACTIVE • SECURE
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10">
          {children}
        </div>
      </main>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
