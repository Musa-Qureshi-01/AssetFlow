"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  UserCheck, 
  Wrench, 
  CalendarDays, 
  ArrowLeftRight, 
  History, 
  AlertTriangle, 
  PlusCircle, 
  BookOpen, 
  X, 
  CheckCircle2
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Mock Data
const OVERDUE_RETURNS = [
  { id: "AF-902", name: "Caterpillar 320 Excavator", overdueDays: 3, custodian: "Muskan (EMP-1082)", zone: "Depot Sector C", severity: "high" },
  { id: "AF-405", name: "Cummins Power Generator", overdueDays: 2, custodian: "Rajesh Kumar (EMP-0921)", zone: "Transit Zone A", severity: "medium" },
  { id: "AF-112", name: "Hyster H190 Forklift", overdueDays: 1, custodian: "Elena Rossi (EMP-1002)", zone: "Processing Fac B", severity: "low" },
];

const INITIAL_ACTIVITIES = [
  { time: "11:42", type: "allocation", desc: "Assigned Caterpillar Excavator (AF-902) to Sector C", asset: "AF-902", operator: "Aarav Mehta (EMP-0402)", status: "COMPLETED", statusColor: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" },
  { time: "10:15", type: "maintenance", desc: "Reported hydraulic leak on F-250 Truck (AF-302)", asset: "AF-302", operator: "Rajesh Kumar (EMP-0921)", status: "IN INSPECTION", statusColor: "text-blue-500 bg-blue-500/5 border-blue-500/10" },
  { time: "09:30", type: "registration", desc: "Registered new Mobile Generator (AF-084) at Depot 3", asset: "AF-084", operator: "Elena Rossi (EMP-1002)", status: "ONLINE", statusColor: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" },
  { time: "08:12", type: "transfer", desc: "Dispatched Electric Pump (AF-502) to Sector B", asset: "AF-502", operator: "Chloe Dubois (EMP-0881)", status: "IN TRANSIT", statusColor: "text-amber-500 bg-amber-500/5 border-amber-500/10" },
  { time: "07:45", type: "booking", desc: "Booked Precision Calibrator (AF-198) for July 15-18", asset: "AF-198", operator: "Muskan (EMP-1082)", status: "SCHEDULED", statusColor: "text-indigo-500 bg-indigo-500/5 border-indigo-500/10" },
  { time: "Yesterday", type: "maintenance", desc: "Completed routine inspection on Crane Node (AF-611)", asset: "AF-611", operator: "Musa (EMP-0012)", status: "RESOLVED", statusColor: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" },
];

export default function DashboardPage() {
  const [activeDrawer, setActiveDrawer] = useState<"register" | "book" | "maintenance" | null>(null);
  const [activityFilter, setActivityFilter] = useState<"all" | "allocation" | "booking" | "maintenance">("all");
  const [dashboardError, setDashboardError] = useState("");
  const [metrics, setMetrics] = useState({
    availableAssets: 1482,
    allocatedAssets: 1104,
    maintenanceToday: 14,
    criticalMaintenance: 3,
    activeBookings: 84,
    pendingTransfers: 9,
    upcomingReturns: 32,
    overdueReturns: 5,
  });
  const [overdueReturns, setOverdueReturns] = useState(OVERDUE_RETURNS);
  
  // Form submission simulated states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Form Field States
  const [regName, setRegName] = useState("");
  const [regSerial, setRegSerial] = useState("");
  const [regCategory, setRegCategory] = useState("Heavy Machinery");
  const [regDepot, setRegDepot] = useState("Sector C");
  const [regCost, setRegCost] = useState("");

  const [bookAsset, setBookAsset] = useState("AF-902");
  const [bookEmpId, setBookEmpId] = useState("");
  const [bookZone, setBookZone] = useState("Sector C");
  const [bookStart, setBookStart] = useState("");
  const [bookEnd, setBookEnd] = useState("");

  const [maintAsset, setMaintAsset] = useState("");
  const [maintPriority, setMaintPriority] = useState("Standard");
  const [maintLogs, setMaintLogs] = useState("");

  // Activity list logs state to append new mock submissions in real-time
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load dashboard data");
        const data = await response.json();

        if (!isMounted) return;

        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.overdueReturns)) setOverdueReturns(data.overdueReturns);
        if (Array.isArray(data.activities)) setActivities(data.activities);
        setDashboardError("");
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setDashboardError("Database dashboard data could not be loaded. Showing local fallback data.");
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
    setFormErrors({});
    
    // Clear fields
    setRegName("");
    setRegSerial("");
    setRegCost("");
    setBookEmpId("");
    setBookStart("");
    setBookEnd("");
    setMaintAsset("");
    setMaintLogs("");
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    if (!regName.trim()) return setFormErrors({ name: "Asset nomenclature name is required" });
    if (!regSerial.trim()) return setFormErrors({ serial: "Hardware serial number is required" });
    if (!regCost.trim() || isNaN(Number(regCost))) return setFormErrors({ cost: "Valid cost value is required" });

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: regName,
          category: regCategory,
          serial: regSerial,
          acquisitionDate: new Date().toISOString().slice(0, 10),
          acquisitionCost: Number(regCost),
          condition: "Good",
          location: regDepot,
          bookable: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Asset registration failed");
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      const newLog = {
        time: "Just Now",
        type: "registration",
        desc: `Registered asset ${regName} (${regSerial}) at ${regDepot}`,
        asset: regSerial.substring(0, 6).toUpperCase(),
        operator: "Jane Doe (EMP-0012)",
        status: "ONLINE",
        statusColor: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
      };
      setActivities((currentActivities) => [newLog, ...currentActivities]);
      setMetrics((currentMetrics) => ({
        ...currentMetrics,
        availableAssets: currentMetrics.availableAssets + 1,
      }));
    } catch (error) {
      setIsSubmitting(false);
      setFormErrors({
        submit: error instanceof Error ? error.message : "Asset registration failed",
      });
    }
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    if (!bookEmpId.trim()) return setFormErrors({ empId: "Custodian Employee ID is required" });
    if (!bookStart || !bookEnd) return setFormErrors({ dates: "Valid date range bounds are required" });

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      const newLog = {
        time: "Just Now",
        type: "booking",
        desc: `Booked asset ${bookAsset} for employee ${bookEmpId}`,
        asset: bookAsset,
        operator: "Musa (EMP-0012)",
        status: "SCHEDULED",
        statusColor: "text-indigo-500 bg-indigo-500/5 border-indigo-500/10"
      };
      setActivities([newLog, ...activities]);
    }, 1200);
  };

  const handleMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    if (!maintAsset.trim()) return setFormErrors({ asset: "Asset system code identifier is required" });
    if (!maintLogs.trim()) return setFormErrors({ logs: "Fault details description is required" });

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      const newLog = {
        time: "Just Now",
        type: "maintenance",
        desc: `Raised ${maintPriority} maintenance request for ${maintAsset}`,
        asset: maintAsset,
        operator: "Musa (EMP-0012)",
        status: maintPriority === "Critical" ? "CRITICAL" : "QUEUED",
        statusColor: maintPriority === "Critical" 
          ? "text-red-500 bg-red-500/5 border-red-500/10" 
          : "text-blue-500 bg-blue-500/5 border-blue-500/10"
      };
      setActivities([newLog, ...activities]);
    }, 1200);
  };

  const filteredActivities = activities.filter(act => {
    if (activityFilter === "all") return true;
    return act.type === activityFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      {dashboardError && (
        <div className="rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          {dashboardError}
        </div>
      )}

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Assets Available", value: metrics.availableAssets.toLocaleString(), icon: <Package className="h-4 w-4 text-zinc-500" />, sub: "Ready for deployment" },
          { label: "Assets Allocated", value: metrics.allocatedAssets.toLocaleString(), icon: <UserCheck className="h-4 w-4 text-zinc-500" />, sub: "Currently in use" },
          { label: "Maintenance Today", value: metrics.maintenanceToday.toLocaleString(), icon: <Wrench className="h-4 w-4 text-zinc-500" />, sub: `${metrics.criticalMaintenance} Critical Tickets`, warning: metrics.criticalMaintenance > 0 },
          { label: "Active Bookings", value: metrics.activeBookings.toLocaleString(), icon: <CalendarDays className="h-4 w-4 text-zinc-500" />, sub: "Upcoming or ongoing" },
          { label: "Pending Transfers", value: metrics.pendingTransfers.toLocaleString(), icon: <ArrowLeftRight className="h-4 w-4 text-zinc-500" />, sub: "Open allocation flows" },
          { label: "Upcoming Returns", value: metrics.upcomingReturns.toLocaleString(), icon: <History className="h-4 w-4 text-zinc-500" />, sub: `${metrics.overdueReturns} Overdue items`, alert: metrics.overdueReturns > 0 }
        ].map((item, idx) => (
          <Card key={idx} className="relative hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors">
            <CardHeader className="p-3 border-b-0 pb-0 flex flex-row items-center justify-between text-muted-foreground select-none">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{item.label}</span>
              {item.icon}
            </CardHeader>
            <CardContent className="p-3 pt-1 flex flex-col gap-0.5">
              <span className="text-xl font-bold tracking-tight text-foreground">{item.value}</span>
              <span className={`text-[10px] font-mono leading-none ${
                item.alert 
                  ? "text-danger font-semibold" 
                  : item.warning 
                  ? "text-amber-600 dark:text-amber-400 font-semibold" 
                  : "text-muted-foreground"
              }`}>
                {item.sub}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area - Split Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Alerts & Activities */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Overdue Returns Alert Container */}
          <Card className="border-red-500/20 bg-red-500/[0.01]">
            <CardHeader className="p-4 border-b border-red-500/10 bg-red-500/5 flex flex-row items-center justify-between text-danger">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Critical Intervention Required // Overdue Returns
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                {metrics.overdueReturns} ITEMS OVERDUE
              </span>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-2.5">
              {overdueReturns.length === 0 ? (
                <div className="p-3 rounded border border-border bg-background text-xs text-muted-foreground">
                  No overdue returns in the database.
                </div>
              ) : overdueReturns.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded border border-border bg-background hover:bg-muted/10 transition-colors font-mono text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                      {item.id}
                    </span>
                    <div className="flex flex-col font-sans">
                      <span className="font-semibold text-foreground">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.zone} — Custodian: {item.custodian}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-[10px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded font-bold border border-red-500/15">
                      {item.overdueDays} DAYS OVERDUE
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activities List */}
          <Card>
            <CardHeader className="p-4 bg-muted/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4 w-4" /> System Audit Activity Feed
              </span>
              
              {/* Feed Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { label: "All Logs", value: "all" },
                    { label: "Allocations", value: "allocation" },
                    { label: "Bookings", value: "booking" },
                    { label: "Maintenance", value: "maintenance" },
                  ] as const
                ).map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivityFilter(tab.value)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                      activityFilter === tab.value
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 font-mono text-[10px] text-muted-foreground uppercase tracking-wider select-none">
                      <th className="p-3 pl-4">Time</th>
                      <th className="p-3">Action Details</th>
                      <th className="p-3">Asset Code</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3 pr-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {filteredActivities.map((act, idx) => (
                        <motion.tr 
                          key={idx}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="border-b border-border/60 hover:bg-muted/10 transition-colors"
                        >
                          <td className="p-3 pl-4 font-mono text-muted-foreground whitespace-nowrap">{act.time}</td>
                          <td className="p-3 text-foreground leading-snug">{act.desc}</td>
                          <td className="p-3 font-mono">
                            <span className="bg-muted px-1.5 py-0.5 rounded border border-border text-[10px] font-semibold text-foreground">
                              {act.asset}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground whitespace-nowrap">{act.operator}</td>
                          <td className="p-3 pr-4 text-right whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${act.statusColor}`}>
                              {act.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Quick Action Triggers & System Status */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="p-4 bg-muted/10 border-b border-border select-none">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </span>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              <Button 
                onClick={() => setActiveDrawer("register")}
                variant="outline" 
                className="w-full justify-start text-xs font-mono uppercase tracking-wider gap-2.5 h-10 border-border hover:border-indigo-500/20 hover:bg-indigo-500/5 text-foreground"
              >
                <PlusCircle className="h-4 w-4 text-indigo-500" /> Register New Asset
              </Button>
              <Button 
                onClick={() => setActiveDrawer("book")}
                variant="outline" 
                className="w-full justify-start text-xs font-mono uppercase tracking-wider gap-2.5 h-10 border-border hover:border-indigo-500/20 hover:bg-indigo-500/5 text-foreground"
              >
                <BookOpen className="h-4 w-4 text-indigo-500" /> Book Sector Resource
              </Button>
              <Button 
                onClick={() => setActiveDrawer("maintenance")}
                variant="outline" 
                className="w-full justify-start text-xs font-mono uppercase tracking-wider gap-2.5 h-10 border-border hover:border-indigo-500/20 hover:bg-indigo-500/5 text-foreground"
              >
                <Wrench className="h-4 w-4 text-indigo-500" /> Raise Maintenance Request
              </Button>
            </CardContent>
          </Card>

          {/* Quick System Telemetry info block */}
          <Card className="font-mono text-[10px]">
            <CardHeader className="p-4 bg-muted/10 border-b border-border select-none">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Telemetry Overview
              </span>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-2.5 text-zinc-500">
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span>GATEWAY HANDSHAKE</span>
                <span className="text-foreground font-bold">ESTABLISHED</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span>ACTIVE SHARDS</span>
                <span className="text-foreground font-bold">3/3 COMPLIANT</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span>TELEMETRY SYNC RATE</span>
                <span className="text-foreground font-bold">120 Hz // REALTIME</span>
              </div>
              <div className="flex items-center justify-between">
                <span>LOG SHARD VERSION</span>
                <span className="text-foreground font-bold">V1.0.8-ALPHA</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drawer Components overlay using Framer Motion */}
      <AnimatePresence>
        {activeDrawer && (
          <>
            {/* Dark backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs"
            />

            {/* Sliding Drawer Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col justify-between border-l border-border bg-background shadow-xl p-6 font-sans text-foreground"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                    Operator Workflow
                  </span>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {activeDrawer === "register" && <>Register New Asset</>}
                    {activeDrawer === "book" && <>Book Sector Resource</>}
                    {activeDrawer === "maintenance" && <>Raise Maintenance Request</>}
                  </h3>
                </div>
                <button 
                  onClick={handleCloseDrawer}
                  className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Central Content (Forms or Success state) */}
              <div className="flex-1 overflow-y-auto py-6">
                {submitSuccess ? (
                  /* Success Frame */
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 animate-bounce" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Transaction Registered</h4>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        The operation log was logged in the active ledger and distributed to online telemetry shards.
                      </p>
                    </div>
                    <Button onClick={handleCloseDrawer} size="sm" variant="outline" className="mt-2">
                      Dismiss Console
                    </Button>
                  </div>
                ) : (
                  /* Drawer Forms Render */
                  <div className="flex flex-col gap-4">
                    {activeDrawer === "register" && (
                      <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                        <Input 
                          label="Asset Name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Caterpillar Excavator 320"
                          error={formErrors.name}
                          required
                          disabled={isSubmitting}
                        />
                        
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Asset Category
                          </label>
                          <select
                            value={regCategory}
                            onChange={(e) => setRegCategory(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Heavy Machinery">Heavy Machinery</option>
                            <option value="Electrical">Electrical Equipment</option>
                            <option value="Logistics">Logistics Vehicles</option>
                            <option value="Hand Tools">Hand Tools</option>
                          </select>
                        </div>

                        <Input 
                          label="Asset Code / Serial"
                          value={regSerial}
                          onChange={(e) => setRegSerial(e.target.value)}
                          placeholder="e.g. AF-992"
                          error={formErrors.serial}
                          required
                          disabled={isSubmitting}
                        />

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Target Depot Location
                          </label>
                          <select
                            value={regDepot}
                            onChange={(e) => setRegDepot(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Sector A">Depot Sector A</option>
                            <option value="Sector B">Depot Sector B</option>
                            <option value="Sector C">Depot Sector C</option>
                          </select>
                        </div>

                        <Input 
                          label="Acquisition Cost ($)"
                          value={regCost}
                          onChange={(e) => setRegCost(e.target.value)}
                          placeholder="e.g. 85000"
                          error={formErrors.cost}
                          required
                          disabled={isSubmitting}
                        />

                        <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
                          Submit Registration
                        </Button>
                        {formErrors.submit && (
                          <span className="text-xs text-danger font-medium text-center">{formErrors.submit}</span>
                        )}
                      </form>
                    )}

                    {activeDrawer === "book" && (
                      <form onSubmit={handleBookSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Select Target Asset
                          </label>
                          <select
                            value={bookAsset}
                            onChange={(e) => setBookAsset(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="AF-902">Caterpillar 320 Excavator (AF-902)</option>
                            <option value="AF-405">Cummins Power Generator (AF-405)</option>
                            <option value="AF-112">Hyster H190 Forklift (AF-112)</option>
                          </select>
                        </div>

                        <Input 
                          label="Custodian Employee ID"
                          value={bookEmpId}
                          onChange={(e) => setBookEmpId(e.target.value)}
                          placeholder="e.g. EMP-1082"
                          error={formErrors.empId}
                          required
                          disabled={isSubmitting}
                        />

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Operational Zone
                          </label>
                          <select
                            value={bookZone}
                            onChange={(e) => setBookZone(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Sector A">Sector A Depot</option>
                            <option value="Sector B">Sector B Storage</option>
                            <option value="Sector C">Sector C Field</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            label="Start Date"
                            type="date"
                            value={bookStart}
                            onChange={(e) => setBookStart(e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                          <Input 
                            label="End Date"
                            type="date"
                            value={bookEnd}
                            onChange={(e) => setBookEnd(e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        {formErrors.dates && (
                          <span className="text-xs text-danger font-medium">{formErrors.dates}</span>
                        )}

                        <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
                          Submit Allocation Booking
                        </Button>
                      </form>
                    )}

                    {activeDrawer === "maintenance" && (
                      <form onSubmit={handleMaintSubmit} className="flex flex-col gap-4">
                        <Input 
                          label="Asset Code Identifier"
                          value={maintAsset}
                          onChange={(e) => setMaintAsset(e.target.value)}
                          placeholder="e.g. AF-302"
                          error={formErrors.asset}
                          required
                          disabled={isSubmitting}
                        />

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Urgency / Severity Level
                          </label>
                          <select
                            value={maintPriority}
                            onChange={(e) => setMaintPriority(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Standard">Standard (Routine check)</option>
                            <option value="Medium">Medium (Affecting efficiency)</option>
                            <option value="Urgent">Urgent (Breakdown warning)</option>
                            <option value="Critical">Critical (Immediate safety risk)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Log Fault Details
                          </label>
                          <textarea
                            value={maintLogs}
                            onChange={(e) => setMaintLogs(e.target.value)}
                            disabled={isSubmitting}
                            rows={4}
                            placeholder="Describe exact operational faults or symptoms..."
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden focus:ring-1 focus:ring-ring focus:border-ring resize-y"
                          />
                          {formErrors.logs && (
                            <span className="text-xs text-danger font-medium mt-0.5">{formErrors.logs}</span>
                          )}
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
                          Submit Ticket
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border pt-4 text-[10px] font-mono text-muted-foreground flex justify-between select-none">
                <span>SECURED WORKFLOW</span>
                <span>ASSETFLOW ERP // TELEM</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
