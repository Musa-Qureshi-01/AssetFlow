"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeftRight, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ClipboardList,
  AlertCircle
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Types
type TabType = "active" | "transfers" | "overdue";
type DrawerAction = "transfer" | "return" | null;
type AssetStatus = "Available" | "Allocated" | "Reserved" | "Under Maintenance";

interface MockAssetLookup {
  tag: string;
  name: string;
  status: AssetStatus;
  holder: string;
  department: string;
  location: string;
}

interface ActiveAllocation {
  tag: string;
  name: string;
  custodian: string;
  department: string;
  startDate: string;
  dueDate: string;
}

interface PendingTransfer {
  id: string;
  tag: string;
  name: string;
  fromHolder: string;
  toHolder: string;
  reason: string;
  priority: "Standard" | "High" | "Critical";
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
}

interface OverdueReturn {
  tag: string;
  name: string;
  custodian: string;
  dueDate: string;
  overdueDays: number;
}

// Initial Mock Assets Database lookup
const ASSET_LOOKUPS: MockAssetLookup[] = [
  { tag: "AF-0001", name: "Caterpillar 320 Excavator", status: "Allocated", holder: "Muskan", department: "Engineering", location: "Depot Sector C" },
  { tag: "AF-0002", name: "Cummins Power Generator", status: "Under Maintenance", holder: "Chloe Dubois", department: "Logistics", location: "Transit Zone A" },
  { tag: "AF-0003", name: "Hyster H190 Forklift", status: "Available", holder: "None Assigned", department: "Logistics", location: "Processing Fac B" },
  { tag: "AF-0004", name: "Precision Multi-Meter Box", status: "Reserved", holder: "Aarav Mehta", department: "Quality Assurance", location: "Depot Sector A" },
  { tag: "AF-0005", name: "Ford F-250 Duty Truck", status: "Available", holder: "None Assigned", department: "Logistics & Transport", location: "Depot Sector B" },
];

const INITIAL_ALLOCATIONS: ActiveAllocation[] = [
  { tag: "AF-0001", name: "Caterpillar 320 Excavator", custodian: "Muskan (EMP-1082)", department: "Engineering", startDate: "2026-07-10", dueDate: "2026-07-24" },
  { tag: "AF-0004", name: "Precision Multi-Meter Box", custodian: "Aarav Mehta (EMP-0402)", department: "Quality Assurance", startDate: "2026-07-05", dueDate: "2026-07-19" },
];

const INITIAL_TRANSFERS: PendingTransfer[] = [
  { id: "TR-2041", tag: "AF-0002", name: "Cummins Power Generator", fromHolder: "Chloe Dubois", toHolder: "Rajesh Kumar (EMP-0921)", reason: "Temporary backup power node failure at Depot B", priority: "High", status: "PENDING_APPROVAL" },
];

const INITIAL_OVERDUES: OverdueReturn[] = [
  { tag: "AF-0005", name: "Ford F-250 Duty Truck", custodian: "Elena Rossi (EMP-1002)", dueDate: "2026-07-09", overdueDays: 3 },
];

export default function AllocationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [activeDrawer, setActiveDrawer] = useState<DrawerAction>(null);

  // Database lists states to allow mock adding/deleting in real-time
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS);
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [overdues, setOverdues] = useState(INITIAL_OVERDUES);

  // Form Field States
  const [selectedTag, setSelectedTag] = useState("AF-0003");
  const [targetEmp, setTargetEmp] = useState("");
  const [targetDept, setTargetDept] = useState("Engineering");
  const [expectedDate, setExpectedDate] = useState("");
  
  // Drawer Specific States
  const [transferReason, setTransferReason] = useState("");
  const [transferPriority, setTransferPriority] = useState<PendingTransfer["priority"]>("Standard");
  
  const [returnCondition, setReturnCondition] = useState<"Excellent" | "Good" | "Fair" | "Poor">("Good");
  const [returnNotes, setReturnNotes] = useState("");
  const [selectedActiveRow, setSelectedActiveRow] = useState<ActiveAllocation | null>(null);

  // Loading / Success Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Active Lookup item context
  const selectedAssetContext = ASSET_LOOKUPS.find(a => a.tag === selectedTag) || ASSET_LOOKUPS[2];

  const handleOpenDrawer = (action: DrawerAction, context?: ActiveAllocation) => {
    setActiveDrawer(action);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});
    
    if (action === "transfer") {
      setTransferReason("");
      setTransferPriority("Standard");
    } else if (action === "return" && context) {
      setSelectedActiveRow(context as ActiveAllocation);
      setReturnNotes("");
      setReturnCondition("Good");
    }
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});
  };

  // Submit operations
  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (selectedAssetContext.status !== "Available") return; // Blocked by UI anyway
    if (!targetEmp.trim()) return setErrors({ emp: "Target Employee ID code is required" });
    if (!expectedDate) return setErrors({ date: "Expected return date bound is required" });

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      
      const newAllocation: ActiveAllocation = {
        tag: selectedAssetContext.tag,
        name: selectedAssetContext.name,
        custodian: `${targetEmp.toUpperCase()} (EMP-${Math.floor(1000 + Math.random() * 9000)})`,
        department: targetDept,
        startDate: new Date().toISOString().substring(0, 10),
        dueDate: expectedDate
      };
      
      setAllocations([newAllocation, ...allocations]);
      
      // Update lookup mock status to Allocated
      selectedAssetContext.status = "Allocated";
      selectedAssetContext.holder = targetEmp;
      selectedAssetContext.department = targetDept;
      
      // Reset form fields
      setTargetEmp("");
      setExpectedDate("");
      
      // Force success check overlay briefly
      setSaveSuccess(true);
    }, 1200);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!transferReason.trim()) return setErrors({ reason: "Justification details are required for transfer" });

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      const newTransfer: PendingTransfer = {
        id: `TR-${Math.floor(2000 + Math.random() * 8000)}`,
        tag: selectedAssetContext.tag,
        name: selectedAssetContext.name,
        fromHolder: selectedAssetContext.holder,
        toHolder: `${targetEmp || "Requested Custodian"} (Pending)`,
        reason: transferReason,
        priority: transferPriority,
        status: "PENDING_APPROVAL"
      };

      setTransfers([newTransfer, ...transfers]);
    }, 1200);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActiveRow) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      // Remove from active allocations list
      setAllocations(allocations.filter(a => a.tag !== selectedActiveRow.tag));

      // Reset asset context lookup to Available
      const lookup = ASSET_LOOKUPS.find(a => a.tag === selectedActiveRow.tag);
      if (lookup) {
        lookup.status = "Available";
        lookup.holder = "None Assigned";
        lookup.location = "Processing Fac B";
      }

      // Check if it was overdue, clean it from overdue list
      setOverdues(overdues.filter(o => o.tag !== selectedActiveRow.tag));
    }, 1200);
  };

  const handleTransferAction = (id: string, action: "APPROVED" | "REJECTED") => {
    setTransfers(transfers.map(tr => {
      if (tr.id === id) {
        if (action === "APPROVED") {
          // Relocate asset allocation
          const lookup = ASSET_LOOKUPS.find(a => a.tag === tr.tag);
          if (lookup) {
            lookup.holder = tr.toHolder.split(" ")[0];
            lookup.status = "Allocated";
          }
          // Remove or update allocation dates
          setAllocations(allocations.map(al => al.tag === tr.tag ? { ...al, custodian: tr.toHolder } : al));
        }
        return { ...tr, status: action };
      }
      return tr;
    }));
  };

  const handleSendPing = (tag: string) => {
    // Simulated ping alert trigger
    alert(`Emergency return notification dispatched for asset ${tag} under clearance channels.`);
  };

  // Status style maps
  const getAssetStatusStyle = (status: AssetStatus) => {
    const styles = {
      "Available": "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
      "Allocated": "text-indigo-500 bg-indigo-500/5 border-indigo-500/10 animate-pulse",
      "Reserved": "text-amber-500 bg-amber-500/5 border-amber-500/10",
      "Under Maintenance": "text-blue-500 bg-blue-500/5 border-blue-500/10"
    };
    return styles[status] || "text-zinc-500 bg-zinc-500/5 border-zinc-500/10";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 select-none">
        <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
          Asset Handshakes // Control
        </span>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Asset Allocation & Relocations
        </h2>
        <p className="text-xs text-muted-foreground">
          Deploy hardware nodes, negotiate inter-sector transfer requests, and inspect returned equipment conditions.
        </p>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2/3 width) - Tabbed tables of Allocations & Transfers */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="p-4 bg-muted/10 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
              {/* Tab options */}
              <div className="flex items-center gap-1.5 p-1 rounded bg-background border border-border w-fit">
                {[
                  { id: "active", label: "Active Deployments", icon: <ClipboardList className="h-3.5 w-3.5" /> },
                  { id: "transfers", label: "Transfer Requests", icon: <ArrowLeftRight className="h-3.5 w-3.5" /> },
                  { id: "overdue", label: "Overdue Items", icon: <AlertCircle className="h-3.5 w-3.5" /> }
                ].map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                Ledger Logs
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                
                {/* 1. Active Allocations */}
                {activeTab === "active" && (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="overflow-x-auto"
                  >
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/10 font-mono text-[10px] text-muted-foreground uppercase tracking-wider select-none">
                          <th className="p-3 pl-4">Asset Tag</th>
                          <th className="p-3">Asset Model Name</th>
                          <th className="p-3">Active Custodian</th>
                          <th className="p-3 font-mono">Assigned Date</th>
                          <th className="p-3 font-mono">Due Date</th>
                          <th className="p-3 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allocations.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                              No active allocations recorded.
                            </td>
                          </tr>
                        ) : (
                          allocations.map((item, idx) => (
                            <tr key={idx} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                              <td className="p-3 pl-4 font-mono font-bold text-foreground">
                                <span className="bg-muted px-2 py-0.5 rounded border border-border">
                                  {item.tag}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-foreground">{item.name}</td>
                              <td className="p-3 leading-tight">
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">{item.custodian}</span>
                                  <span className="text-[9px] text-muted-foreground font-mono uppercase">{item.department}</span>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-muted-foreground">{item.startDate}</td>
                              <td className="p-3 font-mono font-semibold text-foreground">{item.dueDate}</td>
                              <td className="p-3 pr-4 text-right font-mono">
                                <button
                                  onClick={() => handleOpenDrawer("return", item)}
                                  className="text-emerald-600 dark:text-emerald-400 hover:underline text-[10px] font-bold cursor-pointer"
                                >
                                  Return Asset // Check-in
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {/* 2. Pending Transfers */}
                {activeTab === "transfers" && (
                  <motion.div
                    key="transfers"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="overflow-x-auto"
                  >
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/10 font-mono text-[10px] text-muted-foreground uppercase tracking-wider select-none">
                          <th className="p-3 pl-4">Request ID</th>
                          <th className="p-3">Asset</th>
                          <th className="p-3">From (Holder)</th>
                          <th className="p-3">To (Target)</th>
                          <th className="p-3">Reason Summary</th>
                          <th className="p-3 font-mono">Priority</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 pr-4 text-right">Decisions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfers.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-muted-foreground font-mono">
                              No relocation or transfer requests pending.
                            </td>
                          </tr>
                        ) : (
                          transfers.map((item, idx) => (
                            <tr key={idx} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                              <td className="p-3 pl-4 font-mono font-bold text-zinc-500">{item.id}</td>
                              <td className="p-3 leading-tight">
                                <div className="flex flex-col font-sans">
                                  <span className="font-semibold text-foreground">{item.name}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">{item.tag}</span>
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground font-medium">{item.fromHolder}</td>
                              <td className="p-3 text-foreground font-semibold">{item.toHolder}</td>
                              <td className="p-3 text-muted-foreground max-w-xs truncate" title={item.reason}>{item.reason}</td>
                              <td className="p-3 font-mono font-bold">
                                <span className={`inline-block px-1.5 py-0.2 rounded border text-[9px] ${
                                  item.priority === "Critical"
                                    ? "text-red-500 bg-red-500/5 border-red-500/10"
                                    : item.priority === "High"
                                    ? "text-amber-600 bg-amber-600/5 border-amber-600/10 dark:text-amber-400"
                                    : "text-zinc-500 bg-zinc-500/5 border-zinc-500/10"
                                }`}>{item.priority.toUpperCase()}</span>
                              </td>
                              <td className="p-3">
                                <span className={`inline-block px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${
                                  item.status === "PENDING_APPROVAL"
                                    ? "text-indigo-500 bg-indigo-500/5 border-indigo-500/10"
                                    : item.status === "APPROVED"
                                    ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
                                    : "text-red-500 bg-red-500/5 border-red-500/10"
                                }`}>{item.status}</span>
                              </td>
                              <td className="p-3 pr-4 text-right font-mono text-[10px]">
                                {item.status === "PENDING_APPROVAL" ? (
                                  <div className="flex items-center justify-end gap-2.5">
                                    <button
                                      onClick={() => handleTransferAction(item.id, "APPROVED")}
                                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <span className="text-zinc-300">/</span>
                                    <button
                                      onClick={() => handleTransferAction(item.id, "REJECTED")}
                                      className="text-red-500 hover:underline font-bold cursor-pointer"
                                    >
                                      Deny
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-zinc-400">—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {/* 3. Overdue Returns */}
                {activeTab === "overdue" && (
                  <motion.div
                    key="overdue"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="overflow-x-auto"
                  >
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/10 font-mono text-[10px] text-muted-foreground uppercase tracking-wider select-none">
                          <th className="p-3 pl-4">Asset Tag</th>
                          <th className="p-3">Asset Model Name</th>
                          <th className="p-3">Custodian</th>
                          <th className="p-3 font-mono">Return Deadline</th>
                          <th className="p-3">Days Delay</th>
                          <th className="p-3 pr-4 text-right">Direct Alerts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overdues.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                              No overdue assets currently flagged.
                            </td>
                          </tr>
                        ) : (
                          overdues.map((item, idx) => (
                            <tr key={idx} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                              <td className="p-3 pl-4 font-mono font-bold text-foreground">
                                <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/15">
                                  {item.tag}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-foreground">{item.name}</td>
                              <td className="p-3 text-muted-foreground font-medium">{item.custodian}</td>
                              <td className="p-3 font-mono text-red-500 font-bold">{item.dueDate}</td>
                              <td className="p-3 font-mono text-red-500 font-bold">
                                {item.overdueDays} DAYS LATE
                              </td>
                              <td className="p-3 pr-4 text-right font-mono">
                                <button
                                  onClick={() => handleSendPing(item.tag)}
                                  className="text-red-500 hover:text-red-400 font-bold hover:underline cursor-pointer text-[10px] uppercase tracking-wider flex items-center justify-end gap-1.5 ml-auto"
                                >
                                  <AlertCircle className="h-3.5 w-3.5" /> Send Alert Ping
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) - Allocation Control deck Form */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="p-4 bg-muted/10 border-b border-border select-none flex flex-row items-center justify-between">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Allocation Controller
              </span>
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4">
              <form onSubmit={handleAllocateSubmit} className="flex flex-col gap-4">
                
                {/* Select Asset */}
                <div className="flex flex-col gap-1.5 w-full select-none">
                  <label htmlFor="asset-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Target Asset Code
                  </label>
                  <select
                    id="asset-select"
                    value={selectedTag}
                    onChange={(e) => {
                      setSelectedTag(e.target.value);
                      setErrors({});
                    }}
                    className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                  >
                    {ASSET_LOOKUPS.map((a, idx) => (
                      <option key={idx} value={a.tag}>{a.tag} — {a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Real-time Context Status Check Panel */}
                <div className="rounded border border-border bg-muted/10 p-3 flex flex-col gap-2 font-mono text-[11px]">
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-zinc-500 select-none">Asset Context Telemetry</span>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-semibold">Active Status:</span>
                    <span className={`inline-block px-1.5 py-0.2 rounded border text-[9px] font-bold ${getAssetStatusStyle(selectedAssetContext.status)}`}>
                      {selectedAssetContext.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-semibold">Current Holder:</span>
                    <span className="text-foreground font-bold">{selectedAssetContext.holder}</span>
                  </div>

                  {/* Warning Alerts / Block checkers */}
                  {selectedAssetContext.status === "Allocated" && (
                    <div className="mt-1.5 p-2 rounded border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-sans leading-snug">
                      <span className="font-bold flex items-center gap-1 mb-0.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Allocation Locked</span>
                      <span>Asset is already active. Allocate action is disabled. Click below to raise an Inter-Sector Transfer Request.</span>
                    </div>
                  )}

                  {(selectedAssetContext.status === "Under Maintenance" || selectedAssetContext.status === "Reserved") && (
                    <div className="mt-1.5 p-2 rounded border border-red-500/20 bg-red-500/5 text-red-500 font-sans leading-snug">
                      <span className="font-bold flex items-center gap-1 mb-0.5"><AlertCircle className="h-3.5 w-3.5 shrink-0" /> Hardware Offline</span>
                      <span>This node is currently undergoing calibration check or has a reservation lock. Deployment is disabled.</span>
                    </div>
                  )}

                  {selectedAssetContext.status === "Available" && (
                    <div className="mt-1.5 p-2 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-sans leading-snug">
                      <span className="font-bold flex items-center gap-1 mb-0.5"><CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Operations Clear</span>
                      <span>Asset is in storage facilities. Handshake allocation action is completely clear.</span>
                    </div>
                  )}
                </div>

                {/* Form fields */}
                <Input 
                  label="Custodian Employee ID"
                  value={targetEmp}
                  onChange={(e) => setTargetEmp(e.target.value)}
                  placeholder="e.g. EMP-0881"
                  error={errors.emp}
                  required
                  disabled={isSaving || selectedAssetContext.status !== "Available"}
                />

                <div className="flex flex-col gap-1.5 w-full select-none">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Target Allocation Department
                  </label>
                  <select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    disabled={isSaving || selectedAssetContext.status !== "Available"}
                    className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                  >
                    <option value="Engineering">Engineering (ENG)</option>
                    <option value="Logistics & Transport">Logistics & Transport (LOG)</option>
                    <option value="Finance & Accounting">Finance & Accounting (FIN)</option>
                    <option value="Quality Assurance">Quality Assurance (QA)</option>
                  </select>
                </div>

                <Input 
                  label="Expected Return Date"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  error={errors.date}
                  required
                  disabled={isSaving || selectedAssetContext.status !== "Available"}
                />

                {/* Swapping Action buttons */}
                {selectedAssetContext.status === "Available" ? (
                  <Button 
                    type="submit" 
                    className="w-full mt-2" 
                    isLoading={isSaving}
                    disabled={isSaving}
                  >
                    Commit Asset Allocation
                  </Button>
                ) : selectedAssetContext.status === "Allocated" ? (
                  <Button 
                    type="button"
                    onClick={() => handleOpenDrawer("transfer")}
                    variant="outline"
                    className="w-full mt-2 gap-1.5 font-mono uppercase tracking-wider text-xs border-indigo-500/20 hover:bg-indigo-500/5 text-foreground"
                  >
                    <ArrowLeftRight className="h-4 w-4 text-indigo-500" /> Request Inter-Sector Transfer
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    className="w-full mt-2" 
                    disabled
                  >
                    Allocation Blocked
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dynamic Slide Drawer consoles */}
      <AnimatePresence>
        {activeDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs"
            />

            {/* Slide Drawer */}
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
                    Admin Workflow console
                  </span>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {activeDrawer === "transfer" && <>Inter-Sector Transfer Request</>}
                    {activeDrawer === "return" && <>Asset Check-in Return</>}
                  </h3>
                </div>
                <button 
                  onClick={handleCloseDrawer}
                  className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto py-6">
                {saveSuccess ? (
                  /* Success Frame */
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 animate-bounce" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Transaction Logged</h4>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        The transfer request or return check-in was safely written to the local audit shard and distributed.
                      </p>
                    </div>
                    <Button onClick={handleCloseDrawer} size="sm" variant="outline" className="mt-2">
                      Dismiss Console
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* 1. Transfer Request Drawer */}
                    {activeDrawer === "transfer" && (
                      <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4">
                        
                        {/* Selected Asset details info */}
                        <div className="rounded border border-border bg-muted/10 p-3.5 font-mono text-[11px] flex flex-col gap-2">
                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-zinc-500 select-none">Conflict Details</span>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Conflict Asset:</span>
                            <span className="text-foreground font-bold">{selectedAssetContext.tag} — {selectedAssetContext.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Current Custodian:</span>
                            <span className="text-foreground font-bold">{selectedAssetContext.holder}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Current Zone:</span>
                            <span className="text-foreground font-bold">{selectedAssetContext.location}</span>
                          </div>
                        </div>

                        <Input 
                          label="Target Custodian Operator ID"
                          value={targetEmp}
                          onChange={(e) => setTargetEmp(e.target.value)}
                          placeholder="e.g. EMP-0881"
                          required
                          disabled={isSaving}
                        />

                        <div className="flex flex-col gap-1.5 w-full select-none">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Request Urgency Priority
                          </label>
                          <select
                            value={transferPriority}
                            onChange={(e) => setTransferPriority(e.target.value as PendingTransfer["priority"])}
                            disabled={isSaving}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Standard">Standard (Low priority)</option>
                            <option value="High">High (Impacting timeline)</option>
                            <option value="Critical">Critical (Halting operations)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Justification / Reason for Transfer
                          </label>
                          <textarea
                            value={transferReason}
                            onChange={(e) => setTransferReason(e.target.value)}
                            disabled={isSaving}
                            rows={4}
                            placeholder="Describe exact justifications to expedite this relocation..."
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden focus:ring-1 focus:ring-ring focus:border-ring resize-y"
                          />
                          {errors.reason && (
                            <span className="text-xs text-danger font-medium mt-0.5">{errors.reason}</span>
                          )}
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
                          Dispatch Transfer Request
                        </Button>
                      </form>
                    )}

                    {/* 2. Return Check-in Drawer */}
                    {activeDrawer === "return" && selectedActiveRow && (
                      <form onSubmit={handleReturnSubmit} className="flex flex-col gap-4 font-sans">
                        
                        <div className="rounded border border-border bg-muted/10 p-3.5 font-mono text-[11px] flex flex-col gap-2">
                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-zinc-500 select-none">Return Asset Context</span>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Asset Tag:</span>
                            <span className="text-foreground font-bold">{selectedActiveRow.tag}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Asset Name:</span>
                            <span className="text-foreground font-bold">{selectedActiveRow.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Returning Custodian:</span>
                            <span className="text-foreground font-bold">{selectedActiveRow.custodian}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full select-none">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Returned Hardware Condition
                          </label>
                          <select
                            value={returnCondition}
                            onChange={(e) => setReturnCondition(e.target.value as "Excellent" | "Good" | "Fair" | "Poor")}
                            disabled={isSaving}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Excellent">Excellent (No defects)</option>
                            <option value="Good">Good (Minor wear)</option>
                            <option value="Fair">Fair (Needs inspection check)</option>
                            <option value="Poor">Poor (Major defects logged)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Check-in Return Logs / Notes
                          </label>
                          <textarea
                            value={returnNotes}
                            onChange={(e) => setReturnNotes(e.target.value)}
                            disabled={isSaving}
                            rows={4}
                            placeholder="Add calibration records or wear details here..."
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden focus:ring-1 focus:ring-ring focus:border-ring resize-y"
                          />
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
                          Log Check-in Return
                        </Button>
                      </form>
                    )}
                  </>
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
