"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  Calendar,
  History,
  Wrench,
  User,
  MapPin,
  Tag,
  DollarSign,
  Layers,
  ShieldCheck,
  UploadCloud
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Types
type StatusType = "Available" | "Allocated" | "Reserved" | "Under Maintenance" | "Lost" | "Retired" | "Disposed";
type ConditionType = "Excellent" | "Good" | "Fair" | "Poor";

interface AllocationRecord {
  date: string;
  holder: string;
  action: "DISPATCHED" | "RETURNED";
  location: string;
}

interface MaintenanceRecord {
  date: string;
  issue: string;
  priority: "Critical" | "Urgent" | "Standard";
  status: "RESOLVED" | "IN INSPECTION" | "QUEUED";
}

interface Asset {
  tag: string;
  name: string;
  category: string;
  status: StatusType;
  condition: ConditionType;
  department: string;
  holder: string;
  location: string;
  serial: string;
  acqDate: string;
  acqCost: number;
  bookable: boolean;
  allocationHistory: AllocationRecord[];
  maintenanceHistory: MaintenanceRecord[];
}

// Initial Mock Assets Data
const INITIAL_ASSETS: Asset[] = [
  {
    tag: "AF-0001",
    name: "Caterpillar 320 Excavator",
    category: "Heavy Machinery",
    status: "Allocated",
    condition: "Good",
    department: "Engineering",
    holder: "John Green",
    location: "Depot Sector C",
    serial: "CAT-320X-9012",
    acqDate: "2024-03-15",
    acqCost: 125000,
    bookable: true,
    allocationHistory: [
      { date: "2026-07-10", holder: "John Green (EMP-1082)", action: "DISPATCHED", location: "Depot Sector C" },
      { date: "2026-05-12", holder: "Bob Vance (EMP-0881)", action: "RETURNED", location: "Depot Sector A" },
      { date: "2026-02-18", holder: "Bob Vance (EMP-0881)", action: "DISPATCHED", location: "Depot Sector B" }
    ],
    maintenanceHistory: [
      { date: "2026-06-02", issue: "Hydraulic oil filter replacement", priority: "Standard", status: "RESOLVED" },
      { date: "2025-11-14", issue: "Engine valve calibration", priority: "Urgent", status: "RESOLVED" }
    ]
  },
  {
    tag: "AF-0002",
    name: "Cummins Power Generator",
    category: "Power Systems",
    status: "Under Maintenance",
    condition: "Fair",
    department: "Logistics",
    holder: "Mark Davis",
    location: "Transit Zone A",
    serial: "CUM-GEN-4050",
    acqDate: "2024-06-20",
    acqCost: 45000,
    bookable: true,
    allocationHistory: [
      { date: "2026-07-08", holder: "Mark Davis (EMP-0921)", action: "DISPATCHED", location: "Transit Zone A" },
      { date: "2025-12-04", holder: "Charlie Brown (EMP-0402)", action: "RETURNED", location: "Depot Sector A" }
    ],
    maintenanceHistory: [
      { date: "2026-07-11", issue: "Radiator fluid leak inspection", priority: "Urgent", status: "IN INSPECTION" },
      { date: "2026-04-18", issue: "Battery terminals clean up", priority: "Standard", status: "RESOLVED" }
    ]
  },
  {
    tag: "AF-0003",
    name: "Hyster H190 Forklift",
    category: "Logistics Fleet",
    status: "Available",
    condition: "Excellent",
    department: "Logistics & Transport",
    holder: "None Assigned",
    location: "Processing Fac B",
    serial: "HYS-FORK-1120",
    acqDate: "2025-01-10",
    acqCost: 32000,
    bookable: true,
    allocationHistory: [
      { date: "2026-06-15", holder: "Bob Vance (EMP-0881)", action: "RETURNED", location: "Processing Fac B" },
      { date: "2026-04-01", holder: "Bob Vance (EMP-0881)", action: "DISPATCHED", location: "Depot Sector C" }
    ],
    maintenanceHistory: [
      { date: "2026-01-05", issue: "Fork arm safety inspection", priority: "Standard", status: "RESOLVED" }
    ]
  },
  {
    tag: "AF-0004",
    name: "Precision Multi-Meter Calibration Box",
    category: "Calibrated Tools",
    status: "Reserved",
    condition: "Excellent",
    department: "Quality Assurance",
    holder: "Charlie Brown",
    location: "Depot Sector A",
    serial: "FLK-87V-1980",
    acqDate: "2025-08-22",
    acqCost: 3500,
    bookable: false,
    allocationHistory: [
      { date: "2026-07-05", holder: "Charlie Brown (EMP-0402)", action: "DISPATCHED", location: "Depot Sector A" }
    ],
    maintenanceHistory: [
      { date: "2026-05-10", issue: "Annual NIST traceability calibration", priority: "Standard", status: "RESOLVED" }
    ]
  },
  {
    tag: "AF-0005",
    name: "Ford F-250 Duty Truck",
    category: "Logistics Fleet",
    status: "Retired",
    condition: "Poor",
    department: "Logistics & Transport",
    holder: "None Assigned",
    location: "Depot Sector B",
    serial: "FRD-F250-3021",
    acqDate: "2022-02-18",
    acqCost: 55000,
    bookable: false,
    allocationHistory: [
      { date: "2026-03-12", holder: "Mark Davis (EMP-0921)", action: "RETURNED", location: "Depot Sector B" }
    ],
    maintenanceHistory: [
      { date: "2026-03-01", issue: "Transmission failure diagnostic", priority: "Critical", status: "RESOLVED" },
      { date: "2025-09-14", issue: "Tire tread replacement", priority: "Standard", status: "RESOLVED" }
    ]
  }
];

export default function AssetRegistryPage() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDrawer, setActiveDrawer] = useState<"register" | "detail" | null>(null);
  
  // Selected Asset for detail view
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailTab, setDetailTab] = useState<"allocation" | "maintenance">("allocation");

  // Form Fields State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [assetName, setAssetName] = useState("");
  const [assetCat, setAssetCat] = useState("Heavy Machinery");
  const [assetSerial, setAssetSerial] = useState("");
  const [assetDate, setAssetDate] = useState("");
  const [assetCost, setAssetCost] = useState("");
  const [assetCondition, setAssetCondition] = useState<ConditionType>("Excellent");
  const [assetLoc, setAssetLoc] = useState("Depot Sector C");
  const [assetBookable, setAssetBookable] = useState(true);

  // Filters State
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  const handleOpenDrawer = (action: "register" | "detail", asset?: Asset) => {
    setActiveDrawer(action);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});
    
    if (action === "register") {
      setAssetName("");
      setAssetCat("Heavy Machinery");
      setAssetSerial("");
      setAssetDate("");
      setAssetCost("");
      setAssetCondition("Excellent");
      setAssetLoc("Depot Sector C");
      setAssetBookable(true);
      setSelectedAsset(null);
    } else if (action === "detail" && asset) {
      setSelectedAsset(asset);
      setDetailTab("allocation");
    }
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!assetName.trim()) return setErrors({ name: "Asset nomenclature name is required" });
    if (!assetSerial.trim()) return setErrors({ serial: "Hardware serial number is required" });
    if (!assetDate) return setErrors({ date: "Acquisition date stamp is required" });
    if (!assetCost.trim() || isNaN(Number(assetCost))) return setErrors({ cost: "Valid cost value is required" });

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      const newTag = `AF-${String(assets.length + 1).padStart(4, "0")}`;
      const newAsset: Asset = {
        tag: newTag,
        name: assetName,
        category: assetCat,
        status: "Available",
        condition: assetCondition,
        department: "Operations",
        holder: "None Assigned",
        location: assetLoc,
        serial: assetSerial.toUpperCase(),
        acqDate: assetDate,
        acqCost: Number(assetCost),
        bookable: assetBookable,
        allocationHistory: [
          { date: assetDate, holder: "System Initialize", action: "RETURNED", location: assetLoc }
        ],
        maintenanceHistory: []
      };
      setAssets([newAsset, ...assets]);
    }, 1200);
  };

  // Status badge style helper
  const getStatusBadge = (status: StatusType) => {
    const styles = {
      "Available": "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
      "Allocated": "text-indigo-500 bg-indigo-500/5 border-indigo-500/10",
      "Reserved": "text-amber-500 bg-amber-500/5 border-amber-500/10",
      "Under Maintenance": "text-blue-500 bg-blue-500/5 border-blue-500/10",
      "Lost": "text-red-500 bg-red-500/5 border-red-500/10",
      "Retired": "text-zinc-500 bg-zinc-500/5 border-zinc-500/10",
      "Disposed": "text-zinc-400 bg-zinc-400/5 border-zinc-400/10 line-through"
    };
    return styles[status] || "text-zinc-500 bg-zinc-500/5 border-zinc-500/10";
  };

  // Condition style helper
  const getConditionStyle = (cond: ConditionType) => {
    const styles = {
      "Excellent": "text-emerald-600 dark:text-emerald-400 font-bold",
      "Good": "text-indigo-600 dark:text-indigo-400 font-medium",
      "Fair": "text-amber-600 dark:text-amber-400 font-medium",
      "Poor": "text-red-600 dark:text-red-400 font-bold"
    };
    return styles[cond] || "text-foreground";
  };

  // Filters application
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === "all" || asset.category === filterCategory;
    const matchesStatus = filterStatus === "all" || asset.status === filterStatus;
    const matchesCondition = filterCondition === "all" || asset.condition === filterCondition;
    const matchesLocation = filterLocation === "all" || asset.location === filterLocation;

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition && matchesLocation;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            Asset Inventory // Directory
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Asset Registry
          </h2>
          <p className="text-xs text-muted-foreground">
            Audit, track, and log physical hardware resources across global deployment sectors.
          </p>
        </div>

        <div>
          <Button onClick={() => handleOpenDrawer("register")} size="sm" className="gap-1.5 font-mono uppercase tracking-wider text-xs">
            <Plus className="h-4 w-4" /> Register Asset
          </Button>
        </div>
      </div>

      {/* Metric Cards Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assets Active", value: assets.length, icon: <Package className="h-4 w-4 text-zinc-500" />, sub: "All system profiles logged" },
          { label: "Assets Available", value: assets.filter(a => a.status === "Available").length, icon: <CheckCircle2 className="h-4 w-4 text-zinc-500" />, sub: "Ready for deployment" },
          { label: "Under Maintenance", value: assets.filter(a => a.status === "Under Maintenance").length, icon: <Wrench className="h-4 w-4 text-zinc-500" />, sub: "Offline for calibration" },
          { label: "Bookable Resources", value: assets.filter(a => a.bookable).length, icon: <ShieldCheck className="h-4 w-4 text-zinc-500" />, sub: "Reservation-ready nodes" }
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

      {/* Directory High-Density Filters Row */}
      <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20 select-none">
        <span className="text-[9px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
          Filter Options
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative flex items-center col-span-1 md:col-span-1">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search Tag, Name, S/N..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs py-1.5 pl-8 pr-3 h-8 rounded border border-border bg-background text-foreground outline-hidden focus:ring-1 focus:ring-ring focus:border-ring placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-0.5">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs py-1 px-2.5 h-8 rounded border border-border bg-background text-foreground outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="all">All Categories</option>
              <option value="Heavy Machinery">Heavy Machinery</option>
              <option value="Power Systems">Power Systems</option>
              <option value="Logistics Fleet">Logistics Fleet</option>
              <option value="Calibrated Tools">Calibrated Tools</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-0.5">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs py-1 px-2.5 h-8 rounded border border-border bg-background text-foreground outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Reserved">Reserved</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Lost">Lost</option>
              <option value="Retired">Retired</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>

          {/* Condition Filter */}
          <div className="flex flex-col gap-0.5">
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="w-full text-xs py-1 px-2.5 h-8 rounded border border-border bg-background text-foreground outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="all">All Conditions</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex flex-col gap-0.5">
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full text-xs py-1 px-2.5 h-8 rounded border border-border bg-background text-foreground outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="all">All Locations</option>
              <option value="Depot Sector A">Depot Sector A</option>
              <option value="Depot Sector B">Depot Sector B</option>
              <option value="Depot Sector C">Depot Sector C</option>
              <option value="Transit Zone A">Transit Zone A</option>
              <option value="Processing Fac B">Processing Fac B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Registry Datatable */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 font-mono text-[10px] text-muted-foreground uppercase tracking-wider select-none">
                  <th className="p-3 pl-4">Asset Tag</th>
                  <th className="p-3">Asset Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Dept // Custodian</th>
                  <th className="p-3 pr-4 text-right">Deployment Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                      No asset profiles matching current parameters.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => handleOpenDrawer("detail", asset)}
                      className="border-b border-border/60 hover:bg-muted/15 transition-colors cursor-pointer"
                    >
                      <td className="p-3 pl-4 font-mono font-bold text-foreground">
                        <span className="bg-muted px-2 py-0.5 rounded border border-border">
                          {asset.tag}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-foreground">{asset.name}</td>
                      <td className="p-3 text-muted-foreground font-sans">{asset.category}</td>
                      <td className="p-3">
                        <span className={`inline-block px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${getStatusBadge(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={getConditionStyle(asset.condition)}>
                          {asset.condition}
                        </span>
                      </td>
                      <td className="p-3 font-sans leading-tight">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{asset.holder}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{asset.department}</span>
                        </div>
                      </td>
                      <td className="p-3 pr-4 text-right font-mono font-medium text-muted-foreground">
                        {asset.location}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Sliding Drawer Consoles */}
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
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
                    Asset Workflow console
                  </span>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {activeDrawer === "register" && <>Register New System Asset</>}
                    {activeDrawer === "detail" && selectedAsset && (
                      <span className="flex items-center gap-2">
                        <span>Inspect Asset Details</span>
                        <span className="bg-muted text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-border text-foreground">
                          {selectedAsset.tag}
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

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto py-6">
                {saveSuccess ? (
                  /* Success Frame */
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 animate-bounce" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Asset Logged</h4>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        The physical hardware profile has been cataloged. System tag keys are auto-assigned and mapped in active shards.
                      </p>
                    </div>
                    <Button onClick={handleCloseDrawer} size="sm" variant="outline" className="mt-2">
                      Dismiss Console
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* 1. Register Asset Form */}
                    {activeDrawer === "register" && (
                      <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                        <Input 
                          label="Asset Model Name"
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                          placeholder="e.g. Cummins Power Generator"
                          error={errors.name}
                          required
                          disabled={isSaving}
                        />

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Asset Category
                          </label>
                          <select
                            value={assetCat}
                            onChange={(e) => setAssetCat(e.target.value)}
                            disabled={isSaving}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Heavy Machinery">Heavy Machinery</option>
                            <option value="Power Systems">Power Systems</option>
                            <option value="Logistics Fleet">Logistics Fleet</option>
                            <option value="Calibrated Tools">Calibrated Tools</option>
                          </select>
                        </div>

                        <Input 
                          label="Hardware Serial Key (S/N)"
                          value={assetSerial}
                          onChange={(e) => setAssetSerial(e.target.value)}
                          placeholder="e.g. CUM-GEN-4050"
                          error={errors.serial}
                          required
                          disabled={isSaving}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            label="Acquisition Date"
                            type="date"
                            value={assetDate}
                            onChange={(e) => setAssetDate(e.target.value)}
                            error={errors.date}
                            required
                            disabled={isSaving}
                          />
                          <Input 
                            label="Acquisition Cost ($)"
                            value={assetCost}
                            onChange={(e) => setAssetCost(e.target.value)}
                            placeholder="e.g. 45000"
                            error={errors.cost}
                            required
                            disabled={isSaving}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                              Asset Condition
                            </label>
                            <select
                              value={assetCondition}
                              onChange={(e) => setAssetCondition(e.target.value as ConditionType)}
                              disabled={isSaving}
                              className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                            >
                              <option value="Excellent">Excellent</option>
                              <option value="Good">Good</option>
                              <option value="Fair">Fair</option>
                              <option value="Poor">Poor</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                              Depot Target Location
                            </label>
                            <select
                              value={assetLoc}
                              onChange={(e) => setAssetLoc(e.target.value)}
                              disabled={isSaving}
                              className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                            >
                              <option value="Depot Sector A">Depot Sector A</option>
                              <option value="Depot Sector B">Depot Sector B</option>
                              <option value="Depot Sector C">Depot Sector C</option>
                              <option value="Transit Zone A">Transit Zone A</option>
                              <option value="Processing Fac B">Processing Fac B</option>
                            </select>
                          </div>
                        </div>

                        <label className="flex items-start gap-2.5 select-none cursor-pointer mt-1 font-sans">
                          <input
                            type="checkbox"
                            checked={assetBookable}
                            onChange={(e) => setAssetBookable(e.target.checked)}
                            className="h-4 w-4 mt-0.5 rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 accent-indigo-600"
                            disabled={isSaving}
                          />
                          <span className="text-xs text-muted-foreground leading-snug">
                            Make asset available for shared bookings & allocations
                          </span>
                        </label>

                        {/* Document mock upload drops Zone */}
                        <div className="flex flex-col gap-1.5 w-full mt-2 select-none">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Upload Hardware Documents / photos
                          </span>
                          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-indigo-500/20 bg-muted/10 p-5 rounded-lg text-center cursor-pointer transition-colors">
                            <UploadCloud className="h-7 w-7 text-muted-foreground mb-1.5" />
                            <span className="text-xs font-semibold text-foreground">Click to browse or drop files</span>
                            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">PDF, PNG, JPG (Max size 10MB)</span>
                          </div>
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
                          Complete Registration
                        </Button>
                      </form>
                    )}

                    {/* 2. Asset Detail & History View */}
                    {activeDrawer === "detail" && selectedAsset && (
                      <div className="flex flex-col gap-6">
                        
                        {/* Meta Specifications list */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-b border-border pb-5 font-mono text-[11px]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold flex items-center gap-1"><Tag className="h-3.5 w-3.5 text-zinc-400" /> Asset Tag Code</span>
                            <span className="text-foreground font-bold">{selectedAsset.tag}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold flex items-center gap-1"><Layers className="h-3.5 w-3.5 text-zinc-400" /> Category</span>
                            <span className="text-foreground font-bold">{selectedAsset.category}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-zinc-400" /> Serial Key</span>
                            <span className="text-foreground font-bold">{selectedAsset.serial}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-zinc-400" /> Acquisition Cost</span>
                            <span className="text-foreground font-bold">${selectedAsset.acqCost.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-zinc-400" /> Procurement Date</span>
                            <span className="text-foreground font-bold">{selectedAsset.acqDate}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-zinc-400" /> Active Depot Location</span>
                            <span className="text-foreground font-bold">{selectedAsset.location}</span>
                          </div>
                        </div>

                        {/* Detail Tabs Controller */}
                        <div className="flex border-b border-border select-none">
                          <button
                            onClick={() => setDetailTab("allocation")}
                            className={`flex-1 text-center py-2 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
                              detailTab === "allocation"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              <History className="h-3.5 w-3.5" /> Allocation History
                            </span>
                          </button>
                          <button
                            onClick={() => setDetailTab("maintenance")}
                            className={`flex-1 text-center py-2 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
                              detailTab === "maintenance"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              <Wrench className="h-3.5 w-3.5" /> Maintenance Logs
                            </span>
                          </button>
                        </div>

                        {/* History Tables */}
                        <div className="relative">
                          <AnimatePresence mode="wait">
                            {detailTab === "allocation" ? (
                              <motion.div
                                key="allocation"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="flex flex-col gap-2 font-mono text-[11px]"
                              >
                                {selectedAsset.allocationHistory.map((rec, rIdx) => (
                                  <div key={rIdx} className="flex justify-between border-b border-border/40 pb-2 pt-1">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-bold text-foreground flex items-center gap-1"><User className="h-3 w-3 text-zinc-500" /> {rec.holder}</span>
                                      <span className="text-[10px] text-zinc-500 flex items-center gap-1"><MapPin className="h-3 w-3 text-zinc-500" /> {rec.location}</span>
                                    </div>
                                    <div className="flex flex-col text-right items-end gap-0.5">
                                      <span className="text-[10px] text-zinc-500">{rec.date}</span>
                                      <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold border ${
                                        rec.action === "DISPATCHED" 
                                          ? "text-indigo-500 bg-indigo-500/5 border-indigo-500/10" 
                                          : "text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
                                      }`}>{rec.action}</span>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            ) : (
                              <motion.div
                                key="maintenance"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="flex flex-col gap-2 font-mono text-[11px]"
                              >
                                {selectedAsset.maintenanceHistory.length === 0 ? (
                                  <div className="text-center py-6 text-muted-foreground text-[10px]">
                                    No logged maintenance incidents or reports.
                                  </div>
                                ) : (
                                  selectedAsset.maintenanceHistory.map((rec, rIdx) => (
                                    <div key={rIdx} className="flex justify-between border-b border-border/40 pb-2 pt-1">
                                      <div className="flex flex-col gap-1 max-w-[70%] font-sans">
                                        <span className="font-semibold text-foreground text-xs leading-snug">{rec.issue}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">INCIDENT STAMP: {rec.date}</span>
                                      </div>
                                      <div className="flex flex-col text-right items-end gap-1.5">
                                        <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold border ${
                                          rec.priority === "Critical"
                                            ? "text-red-500 bg-red-500/5 border-red-500/10"
                                            : "text-amber-500 bg-amber-500/5 border-amber-500/10"
                                        }`}>{rec.priority.toUpperCase()}</span>
                                        <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold border ${
                                          rec.status === "RESOLVED"
                                            ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
                                            : "text-blue-500 bg-blue-500/5 border-blue-500/10"
                                        }`}>{rec.status}</span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-border pt-4 text-[10px] font-mono text-muted-foreground flex justify-between select-none">
                <span>SECURED WORKFLOW</span>
                <span>ASSETFLOW ERP // CORE</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
