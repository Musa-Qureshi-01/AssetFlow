"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Wrench, 
  ArrowLeftRight, 
  Menu, 
  X, 
  LogOut, 
  Bell, 
  User, 
  Clock,
  Database,
  Layers,
  ClipboardCheck,
  BarChart3
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { getCurrentUser, logoutUser, type AuthUser } from "@/services/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Update clock in header to reflect standard live ERP monitoring
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: '2-digit' }) + 
        " // " + 
        now.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await getCurrentUser();
        if (isMounted) setCurrentUser(response.user);
      } catch {
        router.replace("/auth/login");
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await logoutUser().catch(() => null);
    router.replace("/auth/login");
  };

  const navLinks = [
    { name: "Operations Control", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Asset Registry", href: "/dashboard/assets", icon: <Package className="h-4 w-4" /> },
    { name: "Bookings & Schedules", href: "/dashboard/bookings", icon: <Calendar className="h-4 w-4" /> },
    { name: "Maintenance Logs", href: "/dashboard/maintenance", icon: <Wrench className="h-4 w-4" /> },
    { name: "Relocation/Transfers", href: "/dashboard/allocations", icon: <ArrowLeftRight className="h-4 w-4" /> },
    { name: "Audit Cycles", href: "/dashboard/audits", icon: <ClipboardCheck className="h-4 w-4" /> },
    { name: "Reports & Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { name: "Organization Setup", href: "/dashboard/organization", icon: <Layers className="h-4 w-4" /> },
  ];

  const telemetryShards = [
    { name: "SHARD_US_EAST", status: "online", color: "bg-emerald-500" },
    { name: "SHARD_EU_WEST", status: "online", color: "bg-emerald-500" },
    { name: "SHARD_APAC_SNG", status: "routing", color: "bg-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar - Compact and polished enterprise style */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-border bg-zinc-950 text-zinc-400 transition-transform duration-200 lg:static lg:translate-x-0 ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col gap-6 p-5">
          {/* Logo container */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <Link href="/" onClick={() => setIsMobileSidebarOpen(false)}>
              <Logo showText={true} size="sm" className="brightness-125" />
            </Link>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-zinc-500 hover:text-zinc-200 p-0.5 rounded cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Main Navigation links */}
          <nav className="flex flex-col gap-1">
            <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-600 uppercase mb-2 select-none">
              Control Deck
            </span>
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all duration-150 ${
                    isActive 
                      ? "bg-zinc-900 text-zinc-50 font-semibold shadow-xs border border-zinc-800" 
                      : "hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Telemetry Shards Monitor */}
          <div className="flex flex-col gap-2 mt-4">
            <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-600 uppercase mb-1 select-none flex items-center gap-1.5">
              <Database className="h-3 w-3" /> Telemetry Shards
            </span>
            <div className="flex flex-col gap-2 rounded border border-zinc-900 bg-zinc-900/20 p-3 font-mono text-[10px]">
              {telemetryShards.map((shard, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-zinc-500 tracking-tight font-semibold">{shard.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      {shard.status === "online" && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${shard.color}`}></span>
                    </span>
                    <span className="text-zinc-400 text-[9px] uppercase font-bold">{shard.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/10 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-100 border border-zinc-700 shadow-sm">
              <User className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="flex flex-col text-[10px]">
              <span className="font-sans font-bold text-zinc-200 leading-tight">
                {currentUser?.name ?? "Loading..."}
              </span>
              <span className="text-zinc-600 uppercase font-extrabold text-[9px]">
                {currentUser?.role ?? "Session"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out Session"
            className="text-zinc-600 hover:text-red-400 p-1.5 rounded transition-colors cursor-pointer border border-transparent hover:border-red-500/10 hover:bg-red-500/5"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur-xs select-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Operator Terminal
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <h1 className="text-sm font-bold text-foreground">
                Operations Control
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Clock Telemetry */}
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground px-2.5 py-1 rounded bg-muted/40 border border-border">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>{currentTime}</span>
            </div>

            {/* Notification triggers */}
            <button className="relative p-1.5 text-muted-foreground hover:text-foreground rounded border border-border bg-muted/20 cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 border border-background animate-pulse" />
            </button>
          </div>
        </header>

        {/* View content placeholder */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
