"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldAlert,
  Hammer,
  UserCheck,
  CheckSquare,
  UploadCloud
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Types
type TicketStage = "Pending" | "Approved" | "Tech Assigned" | "In Progress" | "Resolved";
type PriorityType = "Critical" | "Urgent" | "Standard";

interface MaintenanceTicket {
  id: string;
  tag: string;
  assetName: string;
  issue: string;
  priority: PriorityType;
  requester: string;
  loggedTime: string;
  stage: TicketStage;
  technician?: string;
  notes?: string;
  history: string[];
}

// Initial Mock Tickets Database
const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: "WO-801",
    tag: "AF-0001",
    assetName: "Caterpillar 320 Excavator",
    issue: "Hydraulic fluid leak on primary lift cylinders",
    priority: "Critical",
    requester: "John Green",
    loggedTime: "2 hours ago",
    stage: "Pending",
    history: ["Logged by Operator John Green // 2 hours ago"]
  },
  {
    id: "WO-802",
    tag: "AF-0002",
    assetName: "Cummins Power Generator",
    issue: "Radiator fluid temperature spike under load tests",
    priority: "Urgent",
    requester: "Mark Davis",
    loggedTime: "5 hours ago",
    stage: "Tech Assigned",
    technician: "Alex Rivera",
    history: [
      "Logged by Operator Mark Davis // 5 hours ago",
      "Authorized by Admin Jane Doe // 4 hours ago",
      "Technician Alex Rivera assigned // 3 hours ago"
    ]
  },
  {
    id: "WO-803",
    tag: "AF-0004",
    assetName: "Precision Multi-Meter Box",
    issue: "NIST calibration certification lookup failed",
    priority: "Standard",
    requester: "Charlie Brown",
    loggedTime: "1 day ago",
    stage: "In Progress",
    technician: "Sarah Jenkins",
    history: [
      "Logged by Operator Charlie Brown // 1 day ago",
      "Authorized by Admin Jane Doe // 18 hours ago",
      "Technician Sarah Jenkins assigned // 16 hours ago",
      "Repair work initiated by Sarah Jenkins // 4 hours ago"
    ]
  },
  {
    id: "WO-804",
    tag: "AF-0003",
    assetName: "Hyster H190 Forklift",
    issue: "Scheduled engine oil change and safety review",
    priority: "Standard",
    requester: "Bob Vance",
    loggedTime: "2 days ago",
    stage: "Resolved",
    technician: "Michael Chang",
    notes: "Oil replaced. All lift sensors inspected and passed guidelines.",
    history: [
      "Logged by Operator Bob Vance // 2 days ago",
      "Authorized by Admin Jane Doe // 2 days ago",
      "Technician Michael Chang assigned // 1 day ago",
      "Repair work initiated by Michael Chang // 1 day ago",
      "Marked resolved by Michael Chang // 4 hours ago"
    ]
  }
];

const MOCK_ASSETS = [
  { tag: "AF-0001", name: "Caterpillar 320 Excavator" },
  { tag: "AF-0002", name: "Cummins Power Generator" },
  { tag: "AF-0003", name: "Hyster H190 Forklift" },
  { tag: "AF-0004", name: "Precision Multi-Meter Box" },
];

const TECHNICIANS = ["Alex Rivera", "Sarah Jenkins", "Michael Chang"];

export default function MaintenanceLogsPage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  // Drawer states
  const [activeDrawer, setActiveDrawer] = useState<"raise" | "detail" | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);

  // Form Fields
  const [reqAssetTag, setReqAssetTag] = useState("AF-0001");
  const [reqIssue, setReqIssue] = useState("");
  const [reqPriority, setReqPriority] = useState<PriorityType>("Standard");
  
  const [assignee, setAssignee] = useState(TECHNICIANS[0]);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleOpenDrawer = (action: "raise" | "detail", ticket?: MaintenanceTicket) => {
    setActiveDrawer(action);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});

    if (action === "raise") {
      setReqAssetTag("AF-0001");
      setReqIssue("");
      setReqPriority("Standard");
      setSelectedTicket(null);
    } else if (action === "detail" && ticket) {
      setSelectedTicket(ticket);
      setResolutionNotes("");
      setAssignee(ticket.technician || TECHNICIANS[0]);
    }
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});
  };

  // Submit Operations
  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!reqIssue.trim()) return setErrors({ issue: "Issue details description is required" });

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      const targetAsset = MOCK_ASSETS.find(a => a.tag === reqAssetTag) || MOCK_ASSETS[0];
      const newTicket: MaintenanceTicket = {
        id: `WO-${Math.floor(805 + Math.random() * 95)}`,
        tag: reqAssetTag,
        assetName: targetAsset.name,
        issue: reqIssue,
        priority: reqPriority,
        requester: "Jane Doe",
        loggedTime: "Just logged",
        stage: "Pending",
        history: ["Logged by Operator Jane Doe // Just logged"]
      };

      setTickets([newTicket, ...tickets]);
    }, 1200);
  };

  // Lifecycle transition handlers (simulated in state)
  const handleApprove = () => {
    if (!selectedTicket) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      setTickets(tickets.map(t => t.id === selectedTicket.id ? { 
        ...t, 
        stage: "Approved", 
        history: [...t.history, "Authorized by Admin Jane Doe // Just now"] 
      } : t));
    }, 800);
  };

  const handleReject = () => {
    if (!selectedTicket) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      // Simple status deletion or resolution state simulation
      setTickets(tickets.filter(t => t.id !== selectedTicket.id));
    }, 800);
  };

  const handleAssignTech = () => {
    if (!selectedTicket) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      setTickets(tickets.map(t => t.id === selectedTicket.id ? { 
        ...t, 
        stage: "Tech Assigned", 
        technician: assignee,
        history: [...t.history, `Technician ${assignee} assigned // Just now`] 
      } : t));
    }, 800);
  };

  const handleStartWork = () => {
    if (!selectedTicket) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      setTickets(tickets.map(t => t.id === selectedTicket.id ? { 
        ...t, 
        stage: "In Progress", 
        history: [...t.history, `Repair work initiated by ${t.technician} // Just now`] 
      } : t));
    }, 800);
  };

  const handleResolveWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      setTickets(tickets.map(t => t.id === selectedTicket.id ? { 
        ...t, 
        stage: "Resolved", 
        notes: resolutionNotes || "Repairs complete.",
        history: [...t.history, `Marked resolved by ${t.technician} // Just now`] 
      } : t));
    }, 800);
  };

  // Priority color helpers
  const getPriorityStyle = (p: PriorityType) => {
    const styles = {
      "Critical": "text-red-500 bg-red-500/5 border-red-500/10",
      "Urgent": "text-amber-500 bg-amber-500/5 border-amber-500/10",
      "Standard": "text-zinc-500 bg-zinc-500/5 border-zinc-500/10"
    };
    return styles[p] || "text-zinc-500 bg-zinc-500/5 border-zinc-500/10";
  };

  // Filters application
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.issue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Kanban Stage groups selector
  const getStageTickets = (stage: TicketStage) => {
    return filteredTickets.filter(t => t.stage === stage);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            Maintenance & Repairs // Kanban
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Maintenance Logs
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitor asset calibration logs, assign technicians, and track active work order tickets.
          </p>
        </div>

        <div>
          <Button onClick={() => handleOpenDrawer("raise")} size="sm" className="gap-1.5 font-mono uppercase tracking-wider text-xs">
            <Plus className="h-4 w-4" /> Raise Request
          </Button>
        </div>
      </div>

      {/* Filter and Search row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="relative flex items-center max-w-xs w-full">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            className="pl-9 py-1.5 pr-3 h-9"
            placeholder="Search tickets, assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded bg-muted/40 border border-border w-fit">
          {[
            { id: "all", label: "All Priority" },
            { id: "Critical", label: "Critical" },
            { id: "Urgent", label: "Urgent" },
            { id: "Standard", label: "Standard" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setFilterPriority(item.id)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                filterPriority === item.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start select-none">
        {(["Pending", "Approved", "Tech Assigned", "In Progress", "Resolved"] as TicketStage[]).map((stage, sIdx) => {
          const stageTickets = getStageTickets(stage);
          return (
            <div key={sIdx} className="flex flex-col gap-3.5 bg-muted/10 p-3 rounded-lg border border-border/60 min-h-[450px]">
              
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider">
                  {stage}
                </span>
                <span className="text-[9px] font-mono font-bold bg-muted px-1.5 py-0.2 rounded border border-border text-muted-foreground">
                  {stageTickets.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex flex-col gap-3">
                {stageTickets.length === 0 ? (
                  <span className="text-[10px] font-mono text-muted-foreground text-center py-6 border border-dashed border-border/40 rounded bg-background/45">
                    No tickets
                  </span>
                ) : (
                  stageTickets.map((ticket, tIdx) => (
                    <Card 
                      key={tIdx} 
                      onClick={() => handleOpenDrawer("detail", ticket)}
                      className="hover:border-zinc-300 dark:hover:border-zinc-800 transition-all cursor-pointer bg-background"
                    >
                      <CardContent className="p-3.5 flex flex-col gap-2">
                        
                        {/* Upper row: Asset tag and Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-bold bg-muted px-1.5 py-0.2 rounded border border-border text-foreground">
                            {ticket.tag}
                          </span>
                          <span className={`inline-block px-1.5 py-0.2 rounded font-mono text-[8px] font-bold border ${getPriorityStyle(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>

                        {/* Title details */}
                        <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-relaxed">
                          {ticket.assetName}
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                          {ticket.issue}
                        </p>

                        {/* Footer details */}
                        <div className="flex items-center justify-between border-t border-border/50 pt-2 font-mono text-[8px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ticket.requester}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {ticket.loggedTime}</span>
                        </div>

                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

            </div>
          );
        })}
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
                    Work Order Panel
                  </span>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {activeDrawer === "raise" && <>Raise Maintenance Request</>}
                    {activeDrawer === "detail" && selectedTicket && (
                      <span className="flex items-center gap-2">
                        <span>Work Order Detail</span>
                        <span className="bg-muted text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-border text-foreground">
                          {selectedTicket.id}
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
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Ledger Sync Successful</h4>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        The ticket state changes were safely committed and propagated across local calibration channels.
                      </p>
                    </div>
                    <Button onClick={handleCloseDrawer} size="sm" variant="outline" className="mt-2">
                      Dismiss Console
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* 1. Raise Request Form */}
                    {activeDrawer === "raise" && (
                      <form onSubmit={handleRaiseSubmit} className="flex flex-col gap-4">
                        
                        <div className="flex flex-col gap-1.5 w-full select-none">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Choose Target Hardware Asset
                          </label>
                          <select
                            value={reqAssetTag}
                            onChange={(e) => setReqAssetTag(e.target.value)}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            {MOCK_ASSETS.map((a, idx) => (
                              <option key={idx} value={a.tag}>{a.tag} — {a.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full select-none">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Incident Urgency Priority
                          </label>
                          <select
                            value={reqPriority}
                            onChange={(e) => setReqPriority(e.target.value as PriorityType)}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Standard">Standard (Non-operational impact)</option>
                            <option value="Urgent">Urgent (Restricting sector timelines)</option>
                            <option value="Critical">Critical (Immediate operational failure)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Detailed Issue Description
                          </label>
                          <textarea
                            value={reqIssue}
                            onChange={(e) => setReqIssue(e.target.value)}
                            disabled={isSaving}
                            rows={4}
                            placeholder="Provide exact failure descriptions or error codes logged..."
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden focus:ring-1 focus:ring-ring focus:border-ring resize-y"
                            required
                          />
                          {errors.issue && (
                            <span className="text-xs text-danger font-medium mt-0.5">{errors.issue}</span>
                          )}
                        </div>

                        {/* Photo attachment UI */}
                        <div className="flex flex-col gap-1.5 w-full mt-2 select-none">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Upload fault Photo Attachment
                          </span>
                          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-indigo-500/20 bg-muted/10 p-5 rounded-lg text-center cursor-pointer transition-colors">
                            <UploadCloud className="h-7 w-7 text-muted-foreground mb-1.5" />
                            <span className="text-xs font-semibold text-foreground">Click to upload photo references</span>
                            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">PNG, JPG up to 8MB</span>
                          </div>
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
                          Submit Ticket Request
                        </Button>
                      </form>
                    )}

                    {/* 2. Detailed Work Order View & transitions */}
                    {activeDrawer === "detail" && selectedTicket && (
                      <div className="flex flex-col gap-5">
                        
                        {/* Selected Asset details info */}
                        <div className="rounded border border-border bg-muted/10 p-3.5 font-mono text-[11px] flex flex-col gap-2">
                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-zinc-500 select-none">Audit Context</span>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Asset Mapped:</span>
                            <span className="text-foreground font-bold">{selectedTicket.tag} {"//"} {selectedTicket.assetName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Urgency level:</span>
                            <span className={`inline-block px-1.5 py-0.2 rounded border text-[8px] font-bold ${getPriorityStyle(selectedTicket.priority)}`}>
                              {selectedTicket.priority.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Active Stage:</span>
                            <span className="text-foreground font-bold uppercase">{selectedTicket.stage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Assigned Tech:</span>
                            <span className="text-foreground font-bold">{selectedTicket.technician || "None"}</span>
                          </div>
                        </div>

                        {/* Issue description box */}
                        <div className="flex flex-col gap-1 w-full">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">Issue Summary</span>
                          <p className="text-xs text-foreground bg-muted/20 p-3 rounded border border-border/60 leading-relaxed leading-normal">
                            {selectedTicket.issue}
                          </p>
                        </div>

                        {/* Resolution notes if resolved */}
                        {selectedTicket.stage === "Resolved" && selectedTicket.notes && (
                          <div className="flex flex-col gap-1 w-full">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider select-none">Resolution Notes</span>
                            <p className="text-xs text-foreground bg-emerald-500/[0.02] p-3 rounded border border-emerald-500/20 leading-relaxed font-sans">
                              {selectedTicket.notes}
                            </p>
                          </div>
                        )}

                        {/* Action controllers dynamically rendered by stage */}
                        <div className="border-t border-border pt-4 flex flex-col gap-3">
                          
                          {/* A. Pending Stage actions */}
                          {selectedTicket.stage === "Pending" && (
                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none mb-1">Administrative Authorization</span>
                              <div className="flex gap-3">
                                <Button 
                                  onClick={handleApprove} 
                                  className="flex-1 gap-1.5 font-mono uppercase tracking-wider text-xs" 
                                  size="sm"
                                  isLoading={isSaving}
                                >
                                  <UserCheck className="h-4 w-4" /> Approve
                                </Button>
                                <Button 
                                  onClick={handleReject} 
                                  variant="danger" 
                                  className="flex-1 gap-1.5 font-mono uppercase tracking-wider text-xs" 
                                  size="sm"
                                  isLoading={isSaving}
                                >
                                  <ShieldAlert className="h-4 w-4" /> Reject
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* B. Approved Stage actions */}
                          {selectedTicket.stage === "Approved" && (
                            <div className="flex flex-col gap-2 w-full">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">Technician Assignment</span>
                              <div className="flex flex-col gap-3">
                                <select
                                  value={assignee}
                                  onChange={(e) => setAssignee(e.target.value)}
                                  disabled={isSaving}
                                  className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                                >
                                  {TECHNICIANS.map((t, idx) => (
                                    <option key={idx} value={t}>{t}</option>
                                  ))}
                                </select>
                                <Button 
                                  onClick={handleAssignTech} 
                                  className="w-full gap-1.5 font-mono uppercase tracking-wider text-xs" 
                                  size="sm"
                                  isLoading={isSaving}
                                >
                                  <Hammer className="h-4 w-4" /> Assign Work Order
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* C. Tech Assigned actions */}
                          {selectedTicket.stage === "Tech Assigned" && (
                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none mb-1">Technician Dispatch</span>
                              <Button 
                                onClick={handleStartWork} 
                                className="w-full gap-1.5 font-mono uppercase tracking-wider text-xs" 
                                size="sm"
                                isLoading={isSaving}
                              >
                                <Clock className="h-4 w-4" /> Initiate Repair Work
                              </Button>
                            </div>
                          )}

                          {/* D. In Progress actions */}
                          {selectedTicket.stage === "In Progress" && (
                            <form onSubmit={handleResolveWork} className="flex flex-col gap-3">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">Log Ticket Resolution</span>
                              <textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                disabled={isSaving}
                                rows={3}
                                placeholder="Add calibration metrics or repair summary details..."
                                className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden focus:ring-1 focus:ring-ring focus:border-ring resize-none"
                                required
                              />
                              <Button 
                                type="submit"
                                className="w-full gap-1.5 font-mono uppercase tracking-wider text-xs" 
                                size="sm"
                                isLoading={isSaving}
                              >
                                <CheckSquare className="h-4 w-4" /> Resolve Work Order
                              </Button>
                            </form>
                          )}

                        </div>

                        {/* Audit timeline logs list */}
                        <div className="border-t border-border pt-4 flex flex-col gap-2.5">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">Audit Timeline</span>
                          <div className="flex flex-col gap-2 font-mono text-[10px] text-zinc-500">
                            {selectedTicket.history.map((log, idx) => (
                              <div key={idx} className="flex items-start gap-2 border-l border-border/80 pl-3.5 relative">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 absolute -left-[4px] mt-1" />
                                <span className="leading-snug">{log}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border pt-4 text-[10px] font-mono text-muted-foreground flex justify-between select-none">
                <span>SECURED CORE TELEM</span>
                <span>ASSETFLOW ERP // REPAIR</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
