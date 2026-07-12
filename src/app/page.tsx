"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Server,
  Network,
  Boxes,
  ClipboardCheck,
  Wrench,
  CalendarCheck,
  Bell,
  Users,
  ChevronDown,
  CheckCircle2,
  Globe,
  Zap,
  Lock,
  TrendingUp,
  Package,
} from "lucide-react";
import Logo from "@/components/ui/logo";

/* ── Animated counter ─────────────────────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 18);
    return () => clearInterval(timer);
  }, [to]);
  return <>{count.toLocaleString()}{suffix}</>;
}

/* ── Data ─────────────────────────────────────────────────────────────────── */
const STATS = [
  { label: "Assets Tracked",     value: 12400, suffix: "+" },
  { label: "Active Allocations", value: 4800,  suffix: "+" },
  { label: "Audit Accuracy",     value: 99,    suffix: "%" },
  { label: "Uptime SLA",         value: 99.9,  suffix: "%" },
];

const MODULES = [
  { icon: Boxes,          color: "indigo",  title: "Asset Registry",          desc: "Full lifecycle tracking with tags, serial numbers, conditions, and history for every asset across departments." },
  { icon: Users,          color: "violet",  title: "Allocations & Transfers",  desc: "Assign, transfer, and return assets with approval workflows. Track overdue returns and generate instant audit trails." },
  { icon: CalendarCheck,  color: "sky",     title: "Bookings & Scheduling",    desc: "Reserve shared resources like meeting rooms and equipment with conflict detection and calendar views." },
  { icon: Wrench,         color: "amber",   title: "Maintenance Logs",         desc: "Raise, approve, and track maintenance requests through full lifecycle states with technician assignment." },
  { icon: ClipboardCheck, color: "emerald", title: "Audit Cycles",             desc: "Plan and execute audit cycles with per-asset verification records. Flag missing and damaged items instantly." },
  { icon: BarChart3,      color: "rose",    title: "Operations Dashboard",     desc: "Real-time KPIs, department breakdowns, asset utilisation rates, and exportable compliance reports." },
  { icon: Bell,           color: "orange",  title: "Notification Center",      desc: "Priority-ranked alerts for overdue returns, approval requests, audit discrepancies, and system events." },
  { icon: ShieldCheck,    color: "teal",    title: "Role-Based Access",        desc: "Granular RBAC for Admin, Asset Manager, Department Head and Employee — enforced at route and data layer." },
];

const FAQS = [
  { q: "Who can register on the platform?", a: "Any employee can register. New accounts are provisioned as Employee by default. An Admin can elevate roles — to Asset Manager or Department Head — after account creation." },
  { q: "How does role-based access work?", a: "Roles are enforced at every layer: sidebar navigation, page routes, API routes, and data queries. Employees only see their own assets; Admins see everything." },
  { q: "Can shared resources like meeting rooms be booked?", a: "Yes. Assets marked as shared resources can be booked via the Bookings module. Conflicts are detected automatically and admins receive booking notifications." },
  { q: "How are overdue asset returns handled?", a: "The system flags allocations past their expected return date on the Operations Dashboard and triggers high-priority notifications to the Asset Manager and Admin." },
  { q: "Is audit data exportable for compliance?", a: "Audit cycles generate complete records — Verified, Missing, Damaged — which can be reviewed in the Reports module and prepared for external compliance audits." },
];

const colorMap: Record<string, { badge: string; icon: string }> = {
  indigo:  { badge: "bg-indigo-50  border-indigo-100  text-indigo-700",  icon: "text-indigo-600" },
  violet:  { badge: "bg-violet-50  border-violet-100  text-violet-700",  icon: "text-violet-600" },
  sky:     { badge: "bg-sky-50     border-sky-100     text-sky-700",     icon: "text-sky-600" },
  amber:   { badge: "bg-amber-50   border-amber-100   text-amber-700",   icon: "text-amber-600" },
  emerald: { badge: "bg-emerald-50 border-emerald-100 text-emerald-700", icon: "text-emerald-600" },
  rose:    { badge: "bg-rose-50    border-rose-100    text-rose-700",    icon: "text-rose-600" },
  orange:  { badge: "bg-orange-50  border-orange-100  text-orange-700",  icon: "text-orange-600" },
  teal:    { badge: "bg-teal-50    border-teal-100    text-teal-700",    icon: "text-teal-600" },
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo showText size="sm" />
          <nav className="hidden items-center gap-8 md:flex">
            {[["#modules", "Modules"], ["#faq", "FAQ"], ["mailto:support@assetflow.com", "Support"]].map(([href, label], i) => (
              <a key={i} href={href}
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/auth/login">
              <button className="cursor-pointer rounded border border-border bg-background px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:bg-muted">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="cursor-pointer rounded bg-indigo-600 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-indigo-700">
                Get Access
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border/60 py-20 md:py-32">
          {/* Subtle dot grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle,#6366f1 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }} />
          {/* Soft gradient blobs */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />

          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-mono font-bold text-emerald-700 select-none">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              ALL SYSTEMS OPERATIONAL — 3/3 REGIONS ONLINE
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Enterprise Asset Intelligence
              <span className="mt-2 block bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">
                Built for Scale
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Unified lifecycle management, real-time allocations, maintenance workflows,
              audit cycles, and role-based access — in a single command-grade platform.
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/login">
                <button className="group flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300">
                  Access Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted">
                  Request Employee Access
                </button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-[11px] font-mono text-muted-foreground">
              {[
                { icon: Lock,       text: "JWT Auth + Cookies" },
                { icon: Globe,      text: "Multi-Department" },
                { icon: Zap,        text: "Real-time Alerts" },
                { icon: TrendingUp, text: "Live KPI Dashboard" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <section className="border-b border-border/60 bg-muted/30">
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-border md:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 px-6 py-8 text-center">
                <span className="text-3xl font-extrabold tabular-nums text-foreground">
                  <Counter to={s.value} suffix={s.suffix} />
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Modules grid ──────────────────────────────────────────────── */}
        <section id="modules" className="border-b border-border/60 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 flex flex-col items-center gap-2 text-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600">
                Platform Modules
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Everything Your Operations Need
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Eight tightly integrated modules covering the full asset operations lifecycle — from registration to retirement.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((m, i) => {
                const Icon = m.icon;
                const { badge, icon: iconCls } = colorMap[m.color];
                return (
                  <div key={i}
                    className="group flex flex-col gap-4 rounded-xl border border-border bg-background p-5 transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${badge}`}>
                      <Icon className={`h-5 w-5 ${iconCls}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{m.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Feature highlight ─────────────────────────────────────────── */}
        <section className="border-b border-border/60 bg-muted/20 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div className="flex flex-col gap-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600">
                  Why AssetFlow
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Compliance-Grade Control,{" "}
                  <span className="text-indigo-600">Zero Compromise</span>
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Built with a security-first architecture. Every action is logged, every route is role-guarded,
                  and every asset movement creates an immutable audit trail.
                </p>
                <ul className="flex flex-col gap-2.5">
                  {[
                    "Centralized RBAC — 4 roles, zero overlap",
                    "Immutable activity logs on every operation",
                    "Middleware route enforcement + API-level guards",
                    "Real-time notifications for time-sensitive events",
                    "Audit cycles with per-asset discrepancy records",
                    "Overdue return tracking with automatic escalation",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="mt-2 w-fit">
                  <button className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-indigo-700">
                    Enter Dashboard →
                  </button>
                </Link>
              </div>

              {/* Fake dashboard card */}
              <div className="relative rounded-2xl border border-border bg-background shadow-xl shadow-zinc-100">
                {/* Title bar */}
                <div className="flex items-center gap-2 rounded-t-2xl border-b border-border bg-muted/50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 font-mono text-[10px] text-muted-foreground">operations-dashboard — AssetFlow ERP</span>
                </div>
                <div className="flex flex-col gap-3 p-5">
                  {/* KPI row */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Total Assets",       value: "247", color: "text-indigo-600",  bg: "bg-indigo-50  border-indigo-100" },
                      { label: "Active Allocations", value: "183", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                      { label: "Overdue Returns",    value: "3",   color: "text-red-600",     bg: "bg-red-50    border-red-100" },
                      { label: "Under Maintenance",  value: "6",   color: "text-amber-600",   bg: "bg-amber-50  border-amber-100" },
                    ].map((k, i) => (
                      <div key={i} className={`rounded-lg border ${k.bg} p-3`}>
                        <p className={`text-xl font-extrabold tabular-nums ${k.color}`}>{k.value}</p>
                        <p className="text-[10px] text-muted-foreground">{k.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Activity log */}
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="mb-2 text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Recent Activity</p>
                    {[
                      { dot: "bg-emerald-500", text: "MacBook Pro M3 allocated → Arjun Gupta",  time: "2m ago" },
                      { dot: "bg-amber-500",   text: "Maintenance raised — APC UPS (HIGH)",      time: "18m ago" },
                      { dot: "bg-red-500",     text: "AST-PR-001 flagged MISSING in Q3 Audit",  time: "1h ago" },
                      { dot: "bg-indigo-500",  text: "Transfer request: HP EliteBook → Finance", time: "2h ago" },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 py-1.5 text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.dot}`} />
                          <span className="text-muted-foreground">{a.text}</span>
                        </div>
                        <span className="shrink-0 text-muted-foreground/50">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Role breakdown ────────────────────────────────────────────── */}
        <section className="border-b border-border/60 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col items-center gap-2 text-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600">Access Control</span>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Four Roles. Clear Boundaries.</h2>
              <p className="text-sm text-muted-foreground">Every capability is gated by role at the route, API, and UI level.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { role: "Admin",         color: "indigo",  perms: ["Full system access", "Manage users & roles", "Organization config", "All reports & audits"] },
                { role: "Asset Manager", color: "emerald", perms: ["Register & allocate assets", "Approve transfers", "Assign technicians", "Manage maintenance"] },
                { role: "Dept Head",     color: "amber",   perms: ["View department assets", "Approve dept transfers", "Send notifications", "Dept-level reports"] },
                { role: "Employee",      color: "violet",  perms: ["View own assets", "Raise maintenance requests", "Book shared resources", "View notifications"] },
              ].map((r, i) => {
                const { badge } = colorMap[r.color];
                return (
                  <div key={i} className={`rounded-xl border bg-background p-5 ${badge.split(" ").slice(0, 2).join(" ")} border`}>
                    <div className={`mb-3 inline-block rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge}`}>
                      {r.role}
                    </div>
                    <ul className="flex flex-col gap-2">
                      {r.perms.map((p, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section id="faq" className="border-b border-border/60 bg-muted/20 py-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col items-center gap-2 text-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600">Common Questions</span>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">FAQ</h2>
            </div>
            <div className="flex flex-col gap-2">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="overflow-hidden rounded-xl border border-border bg-background">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/30"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border bg-muted/20 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-mono font-bold text-indigo-700 mb-4">
              <Package className="h-3.5 w-3.5" />
              Enterprise Asset Management
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Ready to take control<br />of your asset operations?
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Sign in to your existing account or request onboarding to get provisioned as an Employee.
              Administrators manage roles from the Organization Setup dashboard.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/login">
                <button className="group flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700">
                  Sign In to Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="cursor-pointer rounded-lg border border-border bg-background px-7 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted">
                  Request Employee Access
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-muted/30 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col gap-1.5">
            <Logo showText size="sm" />
            <span className="text-[10px] font-mono text-muted-foreground">
              © {new Date().getFullYear()} AssetFlow Systems. Enterprise Edition.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Server className="h-3 w-3" />
              <span>Gateway Online — IN-SOUTH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Network className="h-3 w-3" />
              <span>DB Replication: Nominal</span>
            </div>
            <Link href="/auth/login" className="transition-colors hover:text-foreground">
              Operator Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}