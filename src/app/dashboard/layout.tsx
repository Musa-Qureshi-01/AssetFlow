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
  BarChart3,
  Check,
  CheckCheck,
  Plus,
  Trash2,
  MailOpen,
  Inbox,
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import {
  getNavLinksForRole,
  getRoleLabel,
  canSendNotification,
} from "@/lib/permissions";
import type { AppRole } from "@/lib/permissions";
import { getCurrentUser, logoutUser } from "@/services/auth";
import type { AuthUser } from "@/services/auth";

// ─── Icon map for nav links ───────────────────────────────────────────────────
const NAV_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  package:   <Package className="h-4 w-4" />,
  calendar:  <Calendar className="h-4 w-4" />,
  wrench:    <Wrench className="h-4 w-4" />,
  arrows:    <ArrowLeftRight className="h-4 w-4" />,
  clipboard: <ClipboardCheck className="h-4 w-4" />,
  chart:     <BarChart3 className="h-4 w-4" />,
  layers:    <Layers className="h-4 w-4" />,
};

// ─── Notification types ───────────────────────────────────────────────────────
interface Notification {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  isRead: boolean;
  timestamp: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Asset Assignment Pending",
    message: "Laptop ASSET-1042 is awaiting allocation approval from Asset Manager.",
    category: "Assignment",
    priority: "High",
    isRead: false,
    timestamp: "Today, 09:14",
  },
  {
    id: "n2",
    title: "Maintenance Request Approved",
    message: "Ticket MT-2091 for Projector P-88 has been approved and scheduled.",
    category: "Maintenance",
    priority: "Medium",
    isRead: false,
    timestamp: "Today, 08:47",
  },
  {
    id: "n3",
    title: "Transfer Request Submitted",
    message: "Relocation of Server RACK-03 to HQ West has been initiated.",
    category: "Transfer",
    priority: "Low",
    isRead: true,
    timestamp: "Yesterday, 17:30",
  },
  {
    id: "n4",
    title: "Audit Cycle Starting",
    message: "Q3 Audit cycle for IT Assets begins on Monday. Ensure all records are updated.",
    category: "Audit",
    priority: "High",
    isRead: false,
    timestamp: "Yesterday, 14:00",
  },
  {
    id: "n5",
    title: "Overdue Return Alert",
    message: "Asset CAM-007 assigned to Finance Dept is 3 days overdue for return.",
    category: "Return",
    priority: "High",
    isRead: true,
    timestamp: "2 days ago",
  },
];

const MOCK_DEPARTMENTS = ["Engineering", "Finance", "Operations", "HR", "Executive"];
const MOCK_EMPLOYEES   = ["EMP-1001 — Aarav Mehta", "EMP-1002 — Chloe Dubois", "EMP-1003 — Rajesh Kumar", "EMP-1004 — Elena Rossi"];

const telemetryShards = [
  { name: "SHARD_US_EAST",  status: "online",  color: "bg-emerald-500" },
  { name: "SHARD_EU_WEST",  status: "online",  color: "bg-emerald-500" },
  { name: "SHARD_APAC_SNG", status: "routing", color: "bg-indigo-500"  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // ── Session state ─────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // ── Notification state ────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "unread" | "high">("all");

  // ── Compose drawer state ──────────────────────────────────────────────────
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [compScope, setCompScope] = useState<"All" | "Department" | "Employee">("All");
  const [compScopeValue, setCompScopeValue] = useState(MOCK_DEPARTMENTS[0] ?? "");
  const [compTitle, setCompTitle] = useState("");
  const [compMsg, setCompMsg] = useState("");
  const [compPriority, setCompPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Live clock ────────────────────────────────────────────────────────────
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit" }) +
          " // " +
          now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Session load ──────────────────────────────────────────────────────────
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
    return () => { isMounted = false; };
  }, [router]);

  // ── Derived from session ──────────────────────────────────────────────────
  const appRole: AppRole = (currentUser?.role as AppRole) ?? "Employee";
  const navLinks = getNavLinksForRole(appRole);
  const userCanCompose = canSendNotification(appRole);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logoutUser().catch(() => null);
    router.replace("/auth/login");
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDeleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    const newNotif: Notification = {
      id: `n_${Date.now()}`,
      title: compTitle,
      message: compMsg,
      category: "Broadcast",
      priority: compPriority,
      isRead: false,
      timestamp: "Just now",
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setCompTitle("");
    setCompMsg("");
    setCompPriority("Medium");
    setCompScope("All");
    setIsSaving(false);
    setSaveSuccess(true);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Filtered notifications ─────────────────────────────────────────────────
  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread") return !n.isRead;
    if (filterType === "high")   return n.priority === "High";
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-border bg-zinc-950 text-zinc-400 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6 p-5">
          {/* Logo */}
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

          {/* Navigation — role-filtered */}
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
                  {NAV_ICONS[link.iconKey]}
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
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${shard.color}`} />
                    </span>
                    <span className="text-zinc-400 text-[9px] uppercase font-bold">{shard.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer — real session user */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/10 flex items-center justify-between font-mono">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-100 border border-zinc-700 shadow-sm">
              <User className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="flex flex-col text-[10px]">
              <span className="font-sans font-bold text-zinc-200 leading-tight">
                {currentUser?.name ?? "Loading…"}
              </span>
              <span className="text-zinc-600 uppercase font-extrabold text-[9px]">
                {getRoleLabel(appRole)}
              </span>
            </div>
          </Link>
          <Link
            href="/auth/login"
            onClick={handleLogout}
            title="Sign Out Session"
            className="text-zinc-600 hover:text-red-400 p-1.5 rounded transition-colors cursor-pointer border border-transparent hover:border-red-500/10 hover:bg-red-500/5"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
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
              <h1 className="text-sm font-bold text-foreground">Odoo Asset</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground px-2.5 py-1 rounded bg-muted/40 border border-border">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>{currentTime}</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-1.5 text-muted-foreground hover:text-foreground rounded border border-border bg-muted/20 cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white font-mono select-none">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/10 relative">{children}</main>
      </div>

      {/* ── Notification Center Drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col justify-between border-l border-border bg-background shadow-xl p-6 font-sans text-foreground"
            >
              <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                      Governance // Alert Desk
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      Notification Center
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Filter bar */}
                <div className="flex items-center justify-between select-none">
                  <div className="flex items-center gap-1">
                    {(["all", "unread", "high"] as const).map((f, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFilterType(f)}
                        className={`px-2.5 py-1.5 rounded text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                          filterType === f
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {f === "all" ? "All" : f === "unread" ? "Unread" : "High Priority"}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                  </button>
                </div>

                {/* Notification list */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-2 select-none">
                      <Inbox className="h-8 w-8 text-zinc-400" />
                      <span className="text-xs font-mono">No notifications logged.</span>
                    </div>
                  ) : (
                    filteredNotifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded border transition-colors relative flex flex-col gap-1 text-xs leading-normal ${
                          item.isRead
                            ? "bg-muted/10 border-border/50 text-muted-foreground"
                            : "bg-indigo-500/[0.02] border-indigo-500/20 text-foreground font-medium shadow-2xs"
                        }`}
                      >
                        {!item.isRead && (
                          <div className="absolute top-3.5 right-3.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        )}
                        <div className="flex items-center gap-2 pr-4 flex-wrap">
                          <span className="font-mono text-[9px] font-bold uppercase text-zinc-500">{item.category}</span>
                          <span className="text-zinc-300 dark:text-zinc-700">|</span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-bold border ${
                              item.priority === "High"
                                ? "text-red-500 bg-red-500/5 border-red-500/10"
                                : item.priority === "Medium"
                                  ? "text-amber-500 bg-amber-500/5 border-amber-500/10"
                                  : "text-zinc-500 bg-muted border-border"
                            }`}
                          >
                            {item.priority.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-bold text-foreground pr-4 mt-0.5">{item.title}</span>
                        <p className="text-muted-foreground mt-0.5">{item.message}</p>
                        <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-1.5 text-[9px] font-mono text-zinc-500 select-none">
                          <span>{item.timestamp}</span>
                          <div className="flex items-center gap-3">
                            {!item.isRead && (
                              <button
                                onClick={() => handleMarkRead(item.id)}
                                className="hover:text-indigo-500 flex items-center gap-0.5 cursor-pointer font-bold uppercase"
                              >
                                <MailOpen className="h-3 w-3" /> Mark read
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotif(item.id)}
                              className="hover:text-red-500 flex items-center gap-0.5 cursor-pointer font-bold uppercase"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Send Notification — ADMIN + DEPT_HEAD only */}
                {userCanCompose && (
                  <div className="border-t border-border pt-4">
                    <Button
                      onClick={() => {
                        setSaveSuccess(false);
                        setIsComposeOpen(true);
                      }}
                      className="w-full gap-1.5 font-mono uppercase tracking-wider text-xs h-9"
                    >
                      <Plus className="h-4 w-4" /> Send Notification
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Compose Notification Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {isComposeOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComposeOpen(false)}
              className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col justify-between border-l border-border bg-background shadow-xl p-6 font-sans text-foreground"
            >
              <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                      Admin Broadcasting console
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Compose Notification
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsComposeOpen(false)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 py-4">
                  {saveSuccess ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Check className="h-5 w-5 animate-bounce" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Broadcast Transmitted</h4>
                        <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                          The notification has been queued and dispatched to target employee streams successfully.
                        </p>
                      </div>
                      <Button onClick={() => setSaveSuccess(false)} size="sm" variant="outline" className="mt-2">
                        Send Another
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleComposeSubmit} className="flex flex-col gap-4">
                      {/* Recipient Scope */}
                      <div className="flex flex-col gap-1.5 w-full select-none">
                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                          Recipient Broadcast Scope
                        </label>
                        <select
                          value={compScope}
                          onChange={(e) => {
                            const val = e.target.value as "All" | "Department" | "Employee";
                            setCompScope(val);
                            setCompScopeValue(val === "Department" ? MOCK_DEPARTMENTS[0] ?? "" : MOCK_EMPLOYEES[0] ?? "");
                          }}
                          className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                        >
                          <option value="All">All Registered Staff (Broadcast)</option>
                          <option value="Department">Department Scope</option>
                          <option value="Employee">Specific Employee ID</option>
                        </select>
                      </div>

                      {compScope !== "All" && (
                        <div className="flex flex-col gap-1.5 w-full select-none">
                          <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                            Select Recipient Target
                          </label>
                          <select
                            value={compScopeValue}
                            onChange={(e) => setCompScopeValue(e.target.value)}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            {compScope === "Department"
                              ? MOCK_DEPARTMENTS.map((d, idx) => <option key={idx} value={d}>{d}</option>)
                              : MOCK_EMPLOYEES.map((em, idx) => <option key={idx} value={em}>{em}</option>)}
                          </select>
                        </div>
                      )}

                      <Input
                        label="Notification Title"
                        value={compTitle}
                        onChange={(e) => setCompTitle(e.target.value)}
                        placeholder="e.g. Schedule Maintenance Cycle Reminder"
                        required
                        disabled={isSaving}
                      />

                      <div className="flex flex-col gap-1.5 w-full select-none">
                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                          Broadcast Message Content
                        </label>
                        <textarea
                          value={compMsg}
                          onChange={(e) => setCompMsg(e.target.value)}
                          rows={4}
                          placeholder="Provide the notification body content here..."
                          required
                          disabled={isSaving}
                          className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden focus:ring-1 focus:ring-ring focus:border-ring resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 w-full select-none">
                        <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                          Priority Urgency
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["Low", "Medium", "High"] as const).map((p, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => setCompPriority(p)}
                              className={`py-2 rounded font-mono font-bold text-[10px] border transition-all cursor-pointer text-center ${
                                compPriority === p
                                  ? p === "High"
                                    ? "bg-red-500/10 border-red-500 text-red-500"
                                    : p === "Medium"
                                      ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                      : "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                  : "bg-background border-border text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
                        Transmit Broadcast
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4 text-[10px] font-mono text-muted-foreground flex justify-between select-none">
                <span>SECURED COMS CHANNELS</span>
                <span>OD00 ASSET // GOVERN</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
