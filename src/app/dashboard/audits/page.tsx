"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  FileSpreadsheet,
  AlertOctagon,
  Check
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Types
type TabType = "active" | "completed" | "draft";
type AssetVerifyState = "Verified" | "Missing" | "Damaged";

interface AuditAssetItem {
  tag: string;
  name: string;
  verifyState: AssetVerifyState;
  notes: string;
}

interface AuditCycle {
  id: string;
  dbId?: string;
  scope: string;
  targetType: "Department" | "Location";
  targetValue: string;
  startDate: string;
  endDate: string;
  auditors: string[];
  status: "Active" | "Completed" | "Draft";
  progress: number; // 0 - 100
  checklist: AuditAssetItem[];
}

// Initial Mock Audit Cycles
const INITIAL_AUDITS: AuditCycle[] = [
  {
    id: "AC-101",
    scope: "Q3 Heavy Machinery Audit",
    targetType: "Location",
    targetValue: "Depot Sector C",
    startDate: "2026-07-01",
    endDate: "2026-07-15",
    auditors: ["Jane Doe", "Alex Rivera"],
    status: "Active",
    progress: 50,
    checklist: [
      { tag: "AF-0001", name: "Caterpillar 320 Excavator", verifyState: "Verified", notes: "Operational wear normal." },
      { tag: "AF-0003", name: "Hyster H190 Forklift", verifyState: "Verified", notes: "Calibration tag complete." },
      { tag: "AF-0002", name: "Cummins Power Generator", verifyState: "Damaged", notes: "Radiator valve leak detected." },
      { tag: "AF-0005", name: "Ford F-250 Duty Truck", verifyState: "Missing", notes: "" } // Awaiting check
    ]
  },
  {
    id: "AC-102",
    scope: "Logistics Fleet Check-in",
    targetType: "Department",
    targetValue: "Logistics & Transport",
    startDate: "2026-06-15",
    endDate: "2026-06-25",
    auditors: ["Sarah Jenkins"],
    status: "Completed",
    progress: 100,
    checklist: [
      { tag: "AF-0003", name: "Hyster H190 Forklift", verifyState: "Verified", notes: "Audit check clear." },
      { tag: "AF-0005", name: "Ford F-250 Duty Truck", verifyState: "Damaged", notes: "Transmission diagnostic fails." }
    ]
  },
  {
    id: "AC-103",
    scope: "Calibration Chamber Annual Cert",
    targetType: "Location",
    targetValue: "Depot Sector A",
    startDate: "2026-08-01",
    endDate: "2026-08-10",
    auditors: ["Michael Chang"],
    status: "Draft",
    progress: 0,
    checklist: [
      { tag: "AF-0004", name: "Precision Multi-Meter Box", verifyState: "Verified", notes: "" }
    ]
  }
];

const MOCK_DEPARTMENTS = ["Engineering", "Logistics & Transport", "Finance & Accounting", "Quality Assurance"];
const MOCK_LOCATIONS = ["Depot Sector A", "Depot Sector B", "Depot Sector C", "Transit Zone A", "Processing Fac B"];
const MOCK_AUDITORS = ["Jane Doe", "Alex Rivera", "Sarah Jenkins", "Michael Chang"];

export default function AuditCyclesPage() {
  const [audits, setAudits] = useState<AuditCycle[]>(INITIAL_AUDITS);
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [locations, setLocations] = useState(MOCK_LOCATIONS);
  const [auditors, setAuditors] = useState(MOCK_AUDITORS);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("active");

  // Drawer overlays
  const [activeDrawer, setActiveDrawer] = useState<"create" | "conduct" | "report" | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<AuditCycle | null>(null);

  // Form Fields: Create Cycle
  const [scopeTitle, setScopeTitle] = useState("");
  const [targetType, setTargetType] = useState<"Department" | "Location">("Location");
  const [targetValue, setTargetValue] = useState(MOCK_LOCATIONS[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignedAuditor, setAssignedAuditor] = useState(MOCK_AUDITORS[0]);

  // Form Fields: Conduct Checksheet
  const [focusedAssetIdx, setFocusedAssetIdx] = useState<number>(0);
  const [activeAssetNote, setActiveAssetNote] = useState("");
  const [activeAssetState, setActiveAssetState] = useState<AssetVerifyState>("Verified");

  // Loaders
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    let isMounted = true;

    async function loadAudits() {
      try {
        const response = await fetch("/api/dashboard/audits", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load audits");
        const data = await response.json();
        if (!isMounted) return;

        if (Array.isArray(data.audits)) setAudits(data.audits);
        if (Array.isArray(data.departments) && data.departments.length > 0) setDepartments(data.departments);
        if (Array.isArray(data.locations) && data.locations.length > 0) setLocations(data.locations);
        if (Array.isArray(data.auditors) && data.auditors.length > 0) setAuditors(data.auditors);
        setLoadError("");
      } catch (error) {
        console.error(error);
        if (isMounted) setLoadError("Database audit data could not be loaded. Showing local fallback data.");
      }
    }

    loadAudits();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenDrawer = (action: "create" | "conduct" | "report", audit?: AuditCycle) => {
    setActiveDrawer(action);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});

    if (action === "create") {
      setScopeTitle("");
      setTargetType("Location");
      setTargetValue(locations[0] || MOCK_LOCATIONS[0]);
      setStartDate("");
      setEndDate("");
      setAssignedAuditor(auditors[0] || MOCK_AUDITORS[0]);
      setSelectedAudit(null);
    } else if (action === "conduct" && audit) {
      setSelectedAudit(audit);
      setFocusedAssetIdx(0);
      const firstCheckItem = audit.checklist[0];
      setActiveAssetState(firstCheckItem ? firstCheckItem.verifyState : "Verified");
      setActiveAssetNote(firstCheckItem ? firstCheckItem.notes : "");
    } else if (action === "report" && audit) {
      setSelectedAudit(audit);
    }
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});
  };

  // Submit Operations
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!scopeTitle.trim()) return setErrors({ scope: "Audit scope title is required" });
    if (!startDate || !endDate) return setErrors({ dates: "Active date range is required" });

    try {
      setIsSaving(true);
      const response = await fetch("/api/dashboard/audits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scope: scopeTitle,
          targetType,
          targetValue,
          startDate,
          endDate,
          assignedAuditor,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Audit cycle creation failed");
      }

      setIsSaving(false);
      setSaveSuccess(true);
      if (data.audit) setAudits((currentAudits) => [data.audit, ...currentAudits]);
    } catch (error) {
      setIsSaving(false);
      setErrors({
        submit: error instanceof Error ? error.message : "Audit cycle creation failed",
      });
    }
  };

  // Handle Asset Checklist Update (in state progress)
  const handleSaveAssetProgress = async () => {
    if (!selectedAudit) return;
    const focusedAsset = selectedAudit.checklist[focusedAssetIdx];
    if (!focusedAsset) return;
    
    const updatedChecklist = selectedAudit.checklist.map((item, idx) => {
      if (idx === focusedAssetIdx) {
        return { ...item, verifyState: activeAssetState, notes: activeAssetNote };
      }
      return item;
    });

    const updatedAudit: AuditCycle = {
      ...selectedAudit,
      checklist: updatedChecklist,
      progress: Math.min(Math.round(((focusedAssetIdx + 1) / updatedChecklist.length) * 100), 100),
      status: "Active",
    };

    setAudits(audits.map(a => a.id === selectedAudit.id ? updatedAudit : a));
    setSelectedAudit(updatedAudit);

    try {
      setIsSaving(true);
      const response = await fetch("/api/dashboard/audits", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          auditId: selectedAudit.dbId,
          assetTag: focusedAsset.tag,
          verifyState: activeAssetState,
          notes: activeAssetNote,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Audit progress save failed");
      }

      setIsSaving(false);
      if (data.audit) {
        setAudits((currentAudits) => currentAudits.map((audit) => (audit.id === selectedAudit.id ? data.audit : audit)));
        setSelectedAudit(data.audit);
      }
      // Advance focus to next asset if available
      if (focusedAssetIdx < selectedAudit.checklist.length - 1) {
        const nextIdx = focusedAssetIdx + 1;
        setFocusedAssetIdx(nextIdx);
        const nextItem = selectedAudit.checklist[nextIdx];
        setActiveAssetState(nextItem ? nextItem.verifyState : "Verified");
        setActiveAssetNote(nextItem ? nextItem.notes : "");
      }
    } catch (error) {
      setIsSaving(false);
      setErrors({
        submit: error instanceof Error ? error.message : "Audit progress save failed",
      });
    }
  };

  const handleCloseAuditCycle = async () => {
    if (!selectedAudit) return;
    try {
      setIsSaving(true);
      const response = await fetch("/api/dashboard/audits", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          auditId: selectedAudit.dbId,
          action: "close",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Audit close failed");
      }

      setIsSaving(false);
      setSaveSuccess(true);
      if (data.audit) {
        setAudits((currentAudits) => currentAudits.map((audit) => (audit.id === selectedAudit.id ? data.audit : audit)));
        setSelectedAudit(data.audit);
      }
    } catch (error) {
      setIsSaving(false);
      setErrors({
        submit: error instanceof Error ? error.message : "Audit close failed",
      });
    }
  };

  const handleFocusAssetChange = (idx: number) => {
    if (!selectedAudit) return;
    setFocusedAssetIdx(idx);
    const item = selectedAudit.checklist[idx];
    setActiveAssetState(item ? item.verifyState : "Verified");
    setActiveAssetNote(item ? item.notes : "");
  };

  // Filters application
  const filteredAudits = audits.filter(a => {
    const matchesSearch = 
      a.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.targetValue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = a.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            Asset Verification // Governance
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Audit Cycles
          </h2>
          <p className="text-xs text-muted-foreground">
            Initiate discrepancy audits, verify inventories, and compile compliance reports.
          </p>
        </div>

        <div>
          <Button onClick={() => handleOpenDrawer("create")} size="sm" className="gap-1.5 font-mono uppercase tracking-wider text-xs">
            <Plus className="h-4 w-4" /> Create Cycle
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          {loadError}
        </div>
      )}

      {/* Global Tab Controller and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="relative flex items-center max-w-xs w-full">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            className="pl-9 py-1.5 pr-3 h-9"
            placeholder="Search audits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded bg-muted/40 border border-border w-fit">
          {[
            { id: "active", label: "Active Cycles" },
            { id: "completed", label: "Completed Audits" },
            { id: "draft", label: "Draft Schedules" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Cycles Table Listings */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 font-mono text-[10px] text-muted-foreground uppercase tracking-wider select-none">
                  <th className="p-3 pl-4">Audit ID</th>
                  <th className="p-3">Audit Scope Purpose</th>
                  <th className="p-3">Audit Target</th>
                  <th className="p-3 font-mono">Date Range</th>
                  <th className="p-3 font-mono">Auditors</th>
                  <th className="p-3">Verification Progress</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                      No audit cycle logs found under this tab.
                    </td>
                  </tr>
                ) : (
                  filteredAudits.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                      <td className="p-3 pl-4 font-mono font-bold text-zinc-500">{item.id}</td>
                      <td className="p-3 font-semibold text-foreground">{item.scope}</td>
                      <td className="p-3 leading-tight font-sans">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{item.targetValue}</span>
                          <span className="text-[9px] text-muted-foreground font-mono uppercase">{item.targetType}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{item.startDate} to {item.endDate}</td>
                      <td className="p-3 leading-tight font-mono text-zinc-500">
                        {item.auditors.join(", ")}
                      </td>
                      <td className="p-3 max-w-[140px]">
                        <div className="flex items-center gap-2.5 w-full">
                          <div className="w-full h-1.5 rounded-full bg-muted border border-border/60 overflow-hidden relative select-none">
                            <motion.div 
                              className="h-full bg-indigo-500" 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <span className="font-mono text-[9px] font-bold text-foreground">
                            {item.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 pr-4 text-right font-mono text-[10px]">
                        {item.status === "Active" && (
                          <button
                            onClick={() => handleOpenDrawer("conduct", item)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                          >
                            Conduct Verification
                          </button>
                        )}
                        {item.status === "Completed" && (
                          <button
                            onClick={() => handleOpenDrawer("report", item)}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer flex items-center justify-end gap-1 ml-auto"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" /> Discrepancy Report
                          </button>
                        )}
                        {item.status === "Draft" && (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Slide drawers */}
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
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col justify-between border-l border-border bg-background shadow-xl p-6 font-sans text-foreground"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                    Audit Workflow console
                  </span>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {activeDrawer === "create" && <>Create New Audit Cycle</>}
                    {activeDrawer === "conduct" && selectedAudit && (
                      <span className="flex items-center gap-2">
                        <span>Conducting Verification Checklist</span>
                        <span className="bg-muted text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-border text-foreground">
                          {selectedAudit.id}
                        </span>
                      </span>
                    )}
                    {activeDrawer === "report" && selectedAudit && (
                      <span className="flex items-center gap-2">
                        <span>Discrepancy Report Summary</span>
                        <span className="bg-muted text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-border text-foreground">
                          {selectedAudit.id}
                        </span>
                      </span>
                    )}
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
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Audit Cycle Synchronized</h4>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        Audit details were successfully logged inside local arrays and compiled.
                      </p>
                    </div>
                    <Button onClick={handleCloseDrawer} size="sm" variant="outline" className="mt-2">
                      Dismiss Console
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* A. Create Cycle Form */}
                    {activeDrawer === "create" && (
                      <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                        
                        <Input 
                          label="Audit Scope Purpose"
                          value={scopeTitle}
                          onChange={(e) => setScopeTitle(e.target.value)}
                          placeholder="e.g. Q3 Heavy Machinery Audit"
                          error={errors.scope}
                          required
                          disabled={isSaving}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5 w-full select-none">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                              Auditing Target Scope
                            </label>
                            <select
                              value={targetType}
                              onChange={(e) => {
                                const val = e.target.value as "Department" | "Location";
                                setTargetType(val);
                                setTargetValue(val === "Department" ? departments[0] || "" : locations[0] || "");
                              }}
                              className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                            >
                              <option value="Location">Location Coordinate</option>
                              <option value="Department">Department Scope</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5 w-full select-none">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                              Select Target Scope Value
                            </label>
                            <select
                              value={targetValue}
                              onChange={(e) => setTargetValue(e.target.value)}
                              className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                            >
                              {targetType === "Location" ? (
                                locations.map((loc, idx) => (
                                  <option key={idx} value={loc}>{loc}</option>
                                ))
                              ) : (
                                departments.map((dept, idx) => (
                                  <option key={idx} value={dept}>{dept}</option>
                                ))
                              )}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            label="Start Date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            disabled={isSaving}
                          />
                          <Input 
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            disabled={isSaving}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 w-full select-none">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Assigned Lead Auditor
                          </label>
                          <select
                            value={assignedAuditor}
                            onChange={(e) => setAssignedAuditor(e.target.value)}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            {auditors.map((auditor, idx) => (
                              <option key={idx} value={auditor}>{auditor}</option>
                            ))}
                          </select>
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
                          Initialize Audit Cycle
                        </Button>
                        {errors.submit && (
                          <span className="text-xs text-danger font-medium text-center">{errors.submit}</span>
                        )}
                      </form>
                    )}

                    {/* B. Conduct Active Checklist Board */}
                    {activeDrawer === "conduct" && selectedAudit && (
                      <div className="flex flex-col gap-5">
                        
                        {/* Summary Scope progress bar */}
                        <div className="flex flex-col gap-2 rounded border border-border bg-muted/10 p-4 font-mono text-[11px]">
                          <div className="flex justify-between font-bold">
                            <span className="text-zinc-500 uppercase">Scope:</span>
                            <span className="text-foreground">{selectedAudit.scope}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Target Area:</span>
                            <span className="text-foreground">{selectedAudit.targetValue}</span>
                          </div>
                          <div className="flex flex-col gap-1.5 mt-2">
                            <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                              <span>PROGRESS STATUS</span>
                              <span>{selectedAudit.progress}% COMPLETE</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted border border-border/60 overflow-hidden relative">
                              <div className="h-full bg-indigo-500" style={{ width: `${selectedAudit.progress}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Two Pane Checklist Board Layout */}
                        <div className="grid grid-cols-5 gap-4 items-start border-t border-border/80 pt-4">
                          
                          {/* Asset Tag side list menu */}
                          <div className="col-span-2 flex flex-col gap-1.5 max-h-[350px] overflow-y-auto pr-1">
                            <span className="text-[8px] font-mono font-extrabold text-zinc-500 uppercase select-none mb-1">Checklist Assets</span>
                            {selectedAudit.checklist.map((item, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleFocusAssetChange(idx)}
                                className={`w-full text-left p-2.5 rounded border font-mono text-[10px] cursor-pointer transition-colors ${
                                  idx === focusedAssetIdx
                                    ? "bg-indigo-500 border-indigo-500 text-white shadow-xs font-bold"
                                    : "bg-background border-border/60 hover:bg-muted text-foreground"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{item.tag}</span>
                                  {item.notes !== "" && <Check className="h-3 w-3" />}
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Verification active form inputs */}
                          <div className="col-span-3 flex flex-col gap-4 p-4 rounded-lg border border-border/80 bg-muted/[0.04]">
                            {selectedAudit.checklist[focusedAssetIdx] ? (
                              <div className="flex flex-col gap-3 font-sans">
                                
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-mono text-[9px] font-bold text-zinc-500 uppercase">Focused Tag: {selectedAudit.checklist[focusedAssetIdx]?.tag}</span>
                                  <h4 className="text-xs font-bold text-foreground leading-snug">{selectedAudit.checklist[focusedAssetIdx]?.name}</h4>
                                </div>

                                {/* Toggle verified buttons */}
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">Verify State Check</label>
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {(["Verified", "Damaged", "Missing"] as AssetVerifyState[]).map((state, sIdx) => (
                                      <button
                                        type="button"
                                        key={sIdx}
                                        onClick={() => setActiveAssetState(state)}
                                        className={`py-1.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all border text-center ${
                                          activeAssetState === state
                                            ? state === "Verified"
                                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                              : state === "Damaged"
                                              ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                                              : "bg-red-500/10 border-red-500 text-red-500"
                                            : "bg-background border-border text-muted-foreground hover:bg-muted"
                                        }`}
                                      >
                                        {state}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5 w-full">
                                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none font-sans">Verification notes</label>
                                  <textarea
                                    value={activeAssetNote}
                                    onChange={(e) => setActiveAssetNote(e.target.value)}
                                    rows={3}
                                    placeholder="Add notes about physical integrity check..."
                                    className="w-full text-xs py-2 px-3 rounded border border-border bg-background text-foreground transition-all outline-hidden resize-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>

                                <Button 
                                  onClick={handleSaveAssetProgress} 
                                  size="sm" 
                                  className="w-full mt-1"
                                  isLoading={isSaving}
                                >
                                  Commit Checksheet Entry
                                </Button>
                                {errors.submit && (
                                  <span className="text-xs text-danger font-medium text-center">{errors.submit}</span>
                                )}

                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground text-center py-6 font-mono">No asset selected.</span>
                            )}
                          </div>

                        </div>

                        {/* Bottom close action */}
                        <div className="border-t border-border pt-4 flex flex-col gap-3 mt-4">
                          <div className="rounded border border-red-500/20 bg-red-500/[0.01] p-4 text-xs text-muted-foreground flex items-start gap-3 select-none font-sans">
                            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-danger" />
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-foreground">Compile Compliance discrepancies</span>
                              <span>Closing this audit cycle locks checklist entries and generates discrepancy logs for repair queues.</span>
                            </div>
                          </div>

                          <Button 
                            onClick={handleCloseAuditCycle} 
                            variant="danger" 
                            className="w-full gap-1.5 font-mono uppercase tracking-wider text-xs"
                            isLoading={isSaving}
                          >
                            Close Audit Cycle & Compile Report
                          </Button>
                          {errors.submit && (
                            <span className="text-xs text-danger font-medium text-center">{errors.submit}</span>
                          )}
                        </div>

                      </div>
                    )}

                    {/* C. Generated Discrepancy report view */}
                    {activeDrawer === "report" && selectedAudit && (
                      <div className="flex flex-col gap-6">
                        
                        {/* Report Header stats */}
                        <div className="grid grid-cols-3 gap-3 text-center select-none">
                          {[
                            { label: "inspected", value: selectedAudit.checklist.length, color: "text-foreground bg-muted/30" },
                            { label: "Damaged Items", value: selectedAudit.checklist.filter(c => c.verifyState === "Damaged").length, color: "text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/10" },
                            { label: "Missing Items", value: selectedAudit.checklist.filter(c => c.verifyState === "Missing").length, color: "text-red-500 bg-red-500/5 border border-red-500/10" }
                          ].map((stat, idx) => (
                            <div key={idx} className={`p-3 rounded-lg flex flex-col gap-0.5 ${stat.color}`}>
                              <span className="text-[18px] font-extrabold tracking-tight font-mono">{stat.value}</span>
                              <span className="text-[8px] font-mono font-bold uppercase text-zinc-500">{stat.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* List of Flagged Discrepancies */}
                        <div className="flex flex-col gap-3 font-sans">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">Flagged Discrepancies Directory</span>
                          
                          {selectedAudit.checklist.filter(c => c.verifyState !== "Verified").length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-xs font-mono border border-dashed border-border rounded">
                              No discrepancies flagged. System audit remains 100% compliant.
                            </div>
                          ) : (
                            selectedAudit.checklist.filter(c => c.verifyState !== "Verified").map((item, idx) => (
                              <div 
                                key={idx} 
                                className={`p-4 rounded-lg border flex items-start gap-3.5 ${
                                  item.verifyState === "Missing"
                                    ? "border-red-500/20 bg-red-500/[0.01]"
                                    : "border-amber-500/20 bg-amber-500/[0.01]"
                                }`}
                              >
                                {item.verifyState === "Missing" ? (
                                  <AlertOctagon className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-500" />
                                ) : (
                                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-500" />
                                )}
                                
                                <div className="flex flex-col gap-1 leading-snug">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-foreground text-xs">{item.tag}</span>
                                    <span className={`inline-block px-1.5 py-0.2 rounded font-mono text-[8px] font-bold border ${
                                      item.verifyState === "Missing"
                                        ? "text-red-500 bg-red-500/5 border-red-500/10"
                                        : "text-amber-500 bg-amber-500/5 border-amber-500/10"
                                    }`}>{item.verifyState.toUpperCase()}</span>
                                  </div>
                                  <span className="text-xs font-bold text-foreground">{item.name}</span>
                                  {item.notes ? (
                                    <span className="text-xs text-muted-foreground mt-1">Audit Notes: &quot;{item.notes}&quot;</span>
                                  ) : (
                                    <span className="text-xs text-zinc-400 mt-1 italic">No detailed notes logged.</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Close actions */}
                        <div className="border-t border-border pt-4 text-right">
                          <Button onClick={handleCloseDrawer} size="sm">
                            Close Report View
                          </Button>
                        </div>

                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border pt-4 text-[10px] font-mono text-muted-foreground flex justify-between select-none">
                <span>SECURED CORE COMPLIANCE</span>
                <span>ASSETFLOW ERP // GOVERN</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
