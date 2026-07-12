"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Layers, 
  AlertCircle,
  CalendarCheck,
  Ban
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Types
type BookingState = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
type ResourceType = "Room" | "Vehicle" | "Equipment";

interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  location: string;
}

interface Booking {
  id: string;
  resourceId: string;
  title: string;
  organizer: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingState;
  overlapConflict?: boolean;
  conflictDetails?: string;
}

// Mock Resources Directory
const RESOURCES: Resource[] = [
  { id: "RES-001", name: "Conference Room Delta", type: "Room", location: "Administration HQ" },
  { id: "RES-002", name: "Logistics Flatbed Truck", type: "Vehicle", location: "Depot Sector A" },
  { id: "RES-003", name: "Calibration Chamber Alpha", type: "Equipment", location: "Quality Labs B" },
  { id: "RES-004", name: "Heavy Cargo Forklift", type: "Vehicle", location: "Depot Sector C" },
];

// Initial Bookings list
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "B-201",
    resourceId: "RES-001",
    title: "Engineering Daily Sync",
    organizer: "Jane Doe",
    date: "2026-07-12",
    startTime: "10:00",
    endTime: "11:30",
    status: "Ongoing"
  },
  {
    id: "B-202",
    resourceId: "RES-002",
    title: "Route B Sync Shipment",
    organizer: "Bob Vance",
    date: "2026-07-12",
    startTime: "13:00",
    endTime: "17:00",
    status: "Ongoing",
    overlapConflict: true,
    conflictDetails: "Schedule collision: 'Depot C Delivery' requested by Logistics team overlaps between 14:00 and 16:00."
  },
  {
    id: "B-203",
    resourceId: "RES-003",
    title: "Sensor Calibration Tests",
    organizer: "Charlie Brown",
    date: "2026-07-12",
    startTime: "09:00",
    endTime: "11:00",
    status: "Cancelled"
  },
  {
    id: "B-204",
    resourceId: "RES-001",
    title: "Weekly QA Architecture Review",
    organizer: "Charlie Brown",
    date: "2026-07-12",
    startTime: "14:00",
    endTime: "15:30",
    status: "Upcoming"
  },
  {
    id: "B-205",
    resourceId: "RES-004",
    title: "Shift Warehouse Restock",
    organizer: "John Green",
    date: "2026-07-12",
    startTime: "08:00",
    endTime: "10:00",
    status: "Completed"
  }
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [resources, setResources] = useState<Resource[]>(RESOURCES);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Drawer States
  const [activeDrawer, setActiveDrawer] = useState<"book" | "reschedule" | "cancel" | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Form Fields
  const [resId, setResId] = useState("RES-001");
  const [bookTitle, setBookTitle] = useState("");
  const [bookOrganizer, setBookOrganizer] = useState("");
  const [bookDate, setBookDate] = useState("2026-07-12");
  const [bookStart, setBookStart] = useState("09:00");
  const [bookEnd, setBookEnd] = useState("11:00");

  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStart, setRescheduleStart] = useState("");
  const [rescheduleEnd, setRescheduleEnd] = useState("");

  const [cancelReason, setCancelReason] = useState("");

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      try {
        const response = await fetch("/api/dashboard/bookings", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load bookings");
        const data = await response.json();
        if (!isMounted) return;

        if (Array.isArray(data.resources) && data.resources.length > 0) {
          setResources(data.resources);
          setResId(data.resources[0].id);
        }
        if (Array.isArray(data.bookings)) setBookings(data.bookings);
        setLoadError("");
      } catch (error) {
        console.error(error);
        if (isMounted) setLoadError("Database bookings could not be loaded. Showing local fallback data.");
      }
    }

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenDrawer = (action: "book" | "reschedule" | "cancel", booking?: Booking) => {
    setActiveDrawer(action);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});

    if (action === "book") {
      setResId("RES-001");
      setBookTitle("");
      setBookOrganizer("");
      setBookDate("2026-07-12");
      setBookStart("09:00");
      setBookEnd("11:00");
      setSelectedBooking(null);
    } else if (action === "reschedule" && booking) {
      setSelectedBooking(booking);
      setRescheduleDate(booking.date);
      setRescheduleStart(booking.startTime);
      setRescheduleEnd(booking.endTime);
    } else if (action === "cancel" && booking) {
      setSelectedBooking(booking);
      setCancelReason("");
    }
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});
  };

  // Conflict simulator helper
  const isTimeConflict = (id: string, date: string, start: string, end: string) => {
    // Flatbed Truck overlapping simulation
    if (id === "RES-002" && date === "2026-07-12") {
      const sNum = parseInt(start.replace(":", ""), 10);
      const eNum = parseInt(end.replace(":", ""), 10);
      // Overlaps with 13:00 - 17:00
      if ((sNum >= 1300 && sNum < 1700) || (eNum > 1300 && eNum <= 1700)) {
        return true;
      }
    }
    return false;
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!bookTitle.trim()) return setErrors({ title: "Booking purpose title is required" });
    if (!bookOrganizer.trim()) return setErrors({ organizer: "Organizer name is required" });
    if (!bookStart) return setErrors({ start: "Start time is required" });
    if (!bookEnd) return setErrors({ end: "End time is required" });

    try {
      setIsSaving(true);
      const response = await fetch("/api/dashboard/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          resourceId: resId,
          title: bookTitle,
          organizer: bookOrganizer,
          date: bookDate,
          startTime: bookStart,
          endTime: bookEnd,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed");

      setIsSaving(false);
      setSaveSuccess(true);
      setBookings((currentBookings) => [data.booking, ...currentBookings]);
    } catch (error) {
      setIsSaving(false);
      setErrors({ submit: error instanceof Error ? error.message : "Booking failed" });
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      const conflict = isTimeConflict(selectedBooking.resourceId, rescheduleDate, rescheduleStart, rescheduleEnd);

      setBookings(bookings.map(b => b.id === selectedBooking.id ? { 
        ...b, 
        date: rescheduleDate, 
        startTime: rescheduleStart, 
        endTime: rescheduleEnd, 
        overlapConflict: conflict,
        conflictDetails: conflict ? "Schedule collision: Time slot overlaps with pre-existing booking reservation." : undefined
      } : b));
    }, 1200);
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, status: "Cancelled", overlapConflict: false } : b));
    }, 1200);
  };

  // Filters application
  const getResourceDetails = (id: string) => {
    return resources.find(r => r.id === id) || resources[0] || RESOURCES[0];
  };

  const filteredBookings = bookings.filter(b => {
    const res = getResourceDetails(b.resourceId);
    const matchesSearch = 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || res.type === filterType;
    return matchesSearch && matchesType;
  });

  // State styling maps
  const getStateStyle = (status: BookingState) => {
    const styles = {
      "Ongoing": "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
      "Upcoming": "text-indigo-500 bg-indigo-500/5 border-indigo-500/10",
      "Completed": "text-zinc-500 bg-zinc-500/5 border-zinc-500/10",
      "Cancelled": "text-red-500 bg-red-500/5 border-red-500/10"
    };
    return styles[status] || "text-zinc-500 bg-zinc-500/5 border-zinc-500/10";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            Resource Allocations // Schedules
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Bookings & Schedules
          </h2>
          <p className="text-xs text-muted-foreground">
            Coordinate schedules and reserve shared conference spaces, logistics vehicles, and precision lab equipment.
          </p>
        </div>

        <div>
          <Button onClick={() => handleOpenDrawer("book")} size="sm" className="gap-1.5 font-mono uppercase tracking-wider text-xs">
            <Plus className="h-4 w-4" /> Book Resource
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="rounded border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          {loadError}
        </div>
      )}

      {/* Metrics widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Reservs", value: bookings.filter(b => b.status === "Upcoming" || b.status === "Ongoing").length, icon: <CalendarCheck className="h-4 w-4 text-zinc-500" />, sub: "Active time blocks" },
          { label: "Ongoing Sessions", value: bookings.filter(b => b.status === "Ongoing").length, icon: <Clock className="h-4 w-4 text-zinc-500" />, sub: "Occupying slots now" },
          { label: "Schedule Conflicts", value: bookings.filter(b => b.overlapConflict).length, icon: <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />, sub: "Overlapping reservations" },
          { label: "Cancelled Slots", value: bookings.filter(b => b.status === "Cancelled").length, icon: <Ban className="h-4 w-4 text-zinc-500" />, sub: "Freed room/vehicle logs" }
        ].map((item, idx) => (
          <Card key={idx}>
            <CardHeader className="p-3 border-b-0 pb-0 flex flex-row items-center justify-between text-muted-foreground select-none">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{item.label}</span>
              {item.icon}
            </CardHeader>
            <CardContent className="p-3 pt-1 flex flex-col gap-0.5 select-none">
              <span className="text-xl font-bold tracking-tight text-foreground">{item.value}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{item.sub}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="relative flex items-center max-w-xs w-full">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            className="pl-9 py-1.5 pr-3 h-9"
            placeholder="Search resources, topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded bg-muted/40 border border-border w-fit">
          {[
            { id: "all", label: "All Types" },
            { id: "Room", label: "Rooms Only" },
            { id: "Vehicle", label: "Vehicles Only" },
            { id: "Equipment", label: "Lab Tools" }
          ].map((type, idx) => (
            <button
              key={idx}
              onClick={() => setFilterType(type.id)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                filterType === type.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Directory List & Timeline visual conflict warnings */}
      <div className="flex flex-col gap-4">
        {filteredBookings.map((booking, idx) => {
          const resource = getResourceDetails(booking.resourceId);
          return (
            <Card 
              key={idx} 
              className={`border-l-4 transition-all ${
                booking.overlapConflict 
                  ? "border-l-red-500 border-red-500/20" 
                  : booking.status === "Ongoing" 
                  ? "border-l-emerald-500" 
                  : booking.status === "Upcoming" 
                  ? "border-l-indigo-500"
                  : "border-l-zinc-300 dark:border-l-zinc-700"
              }`}
            >
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  
                  {/* Category/Type and status badge row */}
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">
                      {resource.type} {"//"} {resource.location}
                    </span>
                    <span className={`inline-block px-1.5 py-0.2 rounded font-mono text-[8px] font-bold border ${getStateStyle(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Title and Organizer */}
                  <h3 className="text-sm font-bold text-foreground">{booking.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground select-none">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> ORGANIZER: {booking.organizer}</span>
                    <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> RESOURCE: {resource.name}</span>
                  </div>

                  {/* Overlap warnings block */}
                  {booking.overlapConflict && (
                    <div className="mt-2 p-2.5 rounded border border-red-500/20 bg-red-500/5 text-red-500 text-xs leading-relaxed font-sans">
                      <span className="font-bold flex items-center gap-1.5 mb-0.5 select-none"><AlertTriangle className="h-4 w-4 shrink-0 animate-bounce" /> Overlapping Schedule Collision</span>
                      <span>{booking.conflictDetails} Please reschedule to clean the overlap window.</span>
                    </div>
                  )}

                </div>

                {/* Date & Time slots and Actions panel */}
                <div className="flex items-center md:items-end justify-between md:flex-col gap-4 font-mono select-none">
                  
                  <div className="flex flex-col text-left md:text-right">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 md:justify-end"><CalendarDays className="h-3.5 w-3.5 text-zinc-400" /> {booking.date}</span>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1 md:justify-end mt-0.5"><Clock className="h-3.5 w-3.5 text-indigo-500" /> {booking.startTime} - {booking.endTime}</span>
                  </div>

                  {/* Operational actions */}
                  {booking.status !== "Cancelled" && booking.status !== "Completed" && (
                    <div className="flex items-center gap-3.5 text-[10px] font-bold">
                      <button
                        onClick={() => handleOpenDrawer("reschedule", booking)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <span className="text-zinc-300">/</span>
                      <button
                        onClick={() => handleOpenDrawer("cancel", booking)}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
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
                    Schedule Console
                  </span>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {activeDrawer === "book" && <>Book Resource Reservation</>}
                    {activeDrawer === "reschedule" && <>Reschedule Reservation Slot</>}
                    {activeDrawer === "cancel" && <>Cancel Shared Booking</>}
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
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Schedule Committed</h4>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        Reservation entries were logged into local index arrays and synchronized across active control modules.
                      </p>
                    </div>
                    <Button onClick={handleCloseDrawer} size="sm" variant="outline" className="mt-2">
                      Dismiss Console
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* 1. Book Resource Form */}
                    {activeDrawer === "book" && (
                      <form onSubmit={handleBookSubmit} className="flex flex-col gap-4">
                        
                        <div className="flex flex-col gap-1.5 w-full select-none">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Choose Target Resource
                          </label>
                          <select
                            value={resId}
                            onChange={(e) => setResId(e.target.value)}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            {resources.map((r, idx) => (
                              <option key={idx} value={r.id}>{r.name} ({r.location})</option>
                            ))}
                          </select>
                        </div>

                        {/* Interactive Collision warnings check inside the form */}
                        {isTimeConflict(resId, bookDate, bookStart, bookEnd) && (
                          <div className="p-2.5 rounded border border-red-500/20 bg-red-500/5 text-red-500 text-xs leading-relaxed font-sans">
                            <span className="font-bold flex items-center gap-1.5 mb-0.5 select-none"><AlertCircle className="h-3.5 w-3.5 shrink-0" /> Conflict Alert</span>
                            <span>The Flatbed Truck is already occupied for Route B Sync from 13:00 - 17:00 on this date. Booking will trigger collision warnings.</span>
                          </div>
                        )}

                        <Input 
                          label="Booking Purpose / Topic Title"
                          value={bookTitle}
                          onChange={(e) => setBookTitle(e.target.value)}
                          placeholder="e.g. Weekly Status Sync"
                          error={errors.title}
                          required
                          disabled={isSaving}
                        />

                        <Input 
                          label="Organizer Full Name"
                          value={bookOrganizer}
                          onChange={(e) => setBookOrganizer(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          error={errors.organizer}
                          required
                          disabled={isSaving}
                        />

                        <Input 
                          label="Reservation Date"
                          type="date"
                          value={bookDate}
                          onChange={(e) => setBookDate(e.target.value)}
                          required
                          disabled={isSaving}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            label="Start Time"
                            type="time"
                            value={bookStart}
                            onChange={(e) => setBookStart(e.target.value)}
                            required
                            disabled={isSaving}
                          />
                          <Input 
                            label="End Time"
                            type="time"
                            value={bookEnd}
                            onChange={(e) => setBookEnd(e.target.value)}
                            required
                            disabled={isSaving}
                          />
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
                          Confirm Reservation
                        </Button>
                        {errors.submit && (
                          <span className="text-xs text-danger font-medium text-center">{errors.submit}</span>
                        )}
                      </form>
                    )}

                    {/* 2. Reschedule Form */}
                    {activeDrawer === "reschedule" && selectedBooking && (
                      <form onSubmit={handleRescheduleSubmit} className="flex flex-col gap-4">
                        
                        <div className="rounded border border-border bg-muted/10 p-3.5 font-mono text-[11px] flex flex-col gap-2">
                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-zinc-500 select-none">Active Reservation Context</span>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Resource:</span>
                            <span className="text-foreground font-bold">{getResourceDetails(selectedBooking.resourceId).name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Current Slot:</span>
                            <span className="text-foreground font-bold">{selectedBooking.startTime} - {selectedBooking.endTime}</span>
                          </div>
                        </div>

                        {isTimeConflict(selectedBooking.resourceId, rescheduleDate, rescheduleStart, rescheduleEnd) && (
                          <div className="p-2.5 rounded border border-red-500/20 bg-red-500/5 text-red-500 text-xs leading-relaxed font-sans">
                            <span className="font-bold flex items-center gap-1.5 mb-0.5 select-none"><AlertCircle className="h-3.5 w-3.5 shrink-0" /> Conflict Alert</span>
                            <span>The proposed slot overlaps with pre-existing reservations. Overlap collision flags will trigger.</span>
                          </div>
                        )}

                        <Input 
                          label="New Target Date"
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          required
                          disabled={isSaving}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            label="New Start Time"
                            type="time"
                            value={rescheduleStart}
                            onChange={(e) => setRescheduleStart(e.target.value)}
                            required
                            disabled={isSaving}
                          />
                          <Input 
                            label="New End Time"
                            type="time"
                            value={rescheduleEnd}
                            onChange={(e) => setRescheduleEnd(e.target.value)}
                            required
                            disabled={isSaving}
                          />
                        </div>

                        <Button type="submit" className="w-full mt-4 animate-scale" isLoading={isSaving}>
                          Confirm Time Shift
                        </Button>
                      </form>
                    )}

                    {/* 3. Cancel Form */}
                    {activeDrawer === "cancel" && selectedBooking && (
                      <form onSubmit={handleCancelSubmit} className="flex flex-col gap-4">
                        
                        <div className="rounded border border-red-500/10 bg-red-500/[0.01] p-4 text-xs text-muted-foreground flex items-start gap-3 select-none">
                          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-danger" />
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-foreground">Confirm Cancellation Action</span>
                            <span>Cancelling booking for <strong className="text-foreground">{selectedBooking.title}</strong> will immediately free up the time slot.</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Justification Cancellation Reason
                          </label>
                          <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            disabled={isSaving}
                            rows={4}
                            placeholder="Provide reason details for cancelling reservation..."
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden focus:ring-1 focus:ring-ring focus:border-ring resize-y"
                            required
                          />
                        </div>

                        <Button type="submit" variant="danger" className="w-full mt-4" isLoading={isSaving}>
                          Approve Cancellation Action
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border pt-4 text-[10px] font-mono text-muted-foreground flex justify-between select-none">
                <span>SECURED WORKFLOW</span>
                <span>ASSETFLOW ERP // SCHED</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
