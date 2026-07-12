"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Layers, 
  MapPin, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  AlertTriangle,
  Info,
  CheckCircle2
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Types
interface UtilizationItem {
  tag: string;
  name: string;
  category: string;
  utilization: number;
  status: string;
}

// Mock Data
const MOST_USED_ASSETS: UtilizationItem[] = [
  { tag: "AF-0001", name: "Caterpillar 320 Excavator", category: "Heavy Machinery", utilization: 94.2, status: "Deployed - Active" },
  { tag: "AF-0003", name: "Hyster H190 Forklift", category: "Logistics Fleet", utilization: 91.8, status: "Deployed - Active" },
  { tag: "AF-0006", name: "Mack Granite Freight Truck", category: "Logistics Fleet", utilization: 88.5, status: "Deployed - Active" }
];

const LEAST_USED_ASSETS: UtilizationItem[] = [
  { tag: "AF-0005", name: "Ford F-250 Duty Truck", category: "Logistics Fleet", utilization: 0.0, status: "Retired - Offline" },
  { tag: "AF-0004", name: "Precision Multi-Meter Box", category: "Calibrated Tools", utilization: 12.4, status: "Available - Idle" },
  { tag: "AF-0007", name: "High-Capacity Transformer", category: "Power Systems", utilization: 18.2, status: "Under Maintenance" }
];

const HEATMAP_DATA = [
  { day: "Monday", slots: [15, 30, 65, 85, 45, 10] },
  { day: "Tuesday", slots: [20, 45, 90, 75, 60, 15] },
  { day: "Wednesday", slots: [10, 35, 70, 95, 50, 20] },
  { day: "Thursday", slots: [25, 40, 80, 80, 55, 30] },
  { day: "Friday", slots: [30, 50, 60, 40, 20, 5] }
];

const HOUR_LABELS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

export default function AnalyticsPage() {
  // Filter states
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [filterDept, setFilterDept] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterLoc, setFilterLoc] = useState("all");

  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; val: string } | null>(null);

  // Mock export triggers
  const handleExport = (format: "PDF" | "CSV") => {
    alert(`Generating ${format} report ledger file...`);
  };

  const getHeatmapColor = (value: number) => {
    if (value < 15) return "bg-indigo-500/10 text-indigo-500/50";
    if (value < 40) return "bg-indigo-500/30 text-indigo-600/70 dark:text-indigo-400";
    if (value < 75) return "bg-indigo-500/60 text-white";
    return "bg-indigo-600 text-white font-extrabold";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            Telemetry Analytics // Operational Metrics
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Reports & Analytics
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitor real-time equipment utilization levels, maintenance histories, and allocation weights.
          </p>
        </div>

        {/* Export CTAs */}
        <div className="flex items-center gap-2">
          <Button onClick={() => handleExport("PDF")} variant="outline" size="sm" className="gap-1.5 font-mono uppercase tracking-wider text-[10px] h-8.5">
            <Download className="h-3.5 w-3.5" /> PDF Ledger
          </Button>
          <Button onClick={() => handleExport("CSV")} variant="outline" size="sm" className="gap-1.5 font-mono uppercase tracking-wider text-[10px] h-8.5">
            <Download className="h-3.5 w-3.5" /> CSV Report
          </Button>
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/20 select-none">
        <span className="text-[9px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
          Filter telemetry window
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Date range filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Calendar className="h-3 w-3" /> Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full text-xs py-1 px-2.5 h-8 rounded border border-border bg-background text-foreground outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="Today">Today (Realtime)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Q2 Review">Q2 Review (Q2-2026)</option>
              <option value="Full Year">Full Year (CY-2026)</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Building2 className="h-3 w-3" /> Department</label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full text-xs py-1 px-2.5 h-8 rounded border border-border bg-background text-foreground outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="all">All Departments</option>
              <option value="ENG">Engineering</option>
              <option value="LOG">Logistics</option>
              <option value="QA">Quality Assurance</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Layers className="h-3 w-3" /> Category</label>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="w-full text-xs py-1 px-2.5 h-8 rounded border border-border bg-background text-foreground outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="all">All Categories</option>
              <option value="Heavy Machinery">Heavy Machinery</option>
              <option value="Power Systems">Power Systems</option>
              <option value="Logistics Fleet">Logistics Fleet</option>
              <option value="Calibrated Tools">Calibrated Tools</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</label>
            <select
              value={filterLoc}
              onChange={(e) => setFilterLoc(e.target.value)}
              className="w-full text-xs py-1 px-2.5 h-8 rounded border border-border bg-background text-foreground outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
            >
              <option value="all">All Depot Locations</option>
              <option value="Depot Sector A">Depot Sector A</option>
              <option value="Depot Sector B">Depot Sector B</option>
              <option value="Depot Sector C">Depot Sector C</option>
            </select>
          </div>

        </div>
      </div>

      {/* Key Analytical metrics summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Average Utilization", 
            value: "84.2%", 
            sub: "+2.4% vs last Q", 
            trendIcon: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />, 
            icon: <Activity className="h-4 w-4 text-zinc-400" /> 
          },
          { 
            label: "Idle Asset count", 
            value: "18 items", 
            sub: "Ready in storage", 
            trendIcon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, 
            icon: <Info className="h-4 w-4 text-zinc-400" /> 
          },
          { 
            label: "Maintenance Cycle", 
            value: "3.2 reqs/mo", 
            sub: "-12% improvement", 
            trendIcon: <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />, 
            icon: <Clock className="h-4 w-4 text-zinc-400" /> 
          },
          { 
            label: "Nearing Retirement", 
            value: "4 items", 
            sub: "Requires Q4 replace", 
            trendIcon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />, 
            icon: <BarChart3 className="h-4 w-4 text-zinc-400" /> 
          }
        ].map((item, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 flex flex-col gap-1 select-none">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">{item.label}</span>
                {item.icon}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-extrabold tracking-tight text-foreground">{item.value}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                {item.trendIcon}
                <span>{item.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts block splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Utilization Trend Line - 2/3 width */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4 flex flex-col gap-4 select-none">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Asset Utilization Trend</span>
                <span className="text-[10px] text-muted-foreground font-mono">Monthly variance percentages over active duty cycles</span>
              </div>
              <span className="text-[9px] font-mono text-indigo-500 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">AVG // 84.2%</span>
            </div>

            {/* Premium SVG Area line chart */}
            <div className="relative h-60 w-full mt-2">
              <svg className="h-full w-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Guide Grid Lines */}
                <line x1="40" y1="20" x2="580" y2="20" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="40" y1="70" x2="580" y2="70" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="40" y1="120" x2="580" y2="120" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="40" y1="170" x2="580" y2="170" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,3" />

                {/* Chart Area Fill */}
                <path
                  d="M 50 170 C 100 130, 130 90, 160 110 C 230 70, 270 120, 310 80 C 380 50, 420 70, 460 40 C 510 50, 540 30, 570 25 L 570 170 Z"
                  fill="url(#chartGradient)"
                />

                {/* Chart Trend Line */}
                <path
                  d="M 50 170 C 100 130, 130 90, 160 110 C 230 70, 270 120, 310 80 C 380 50, 420 70, 460 40 C 510 50, 540 30, 570 25"
                  fill="none"
                  stroke="rgb(99, 102, 241)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data point Dots with hover trigger simulation */}
                {[
                  { cx: 50, cy: 170, val: "Jan: 70%" },
                  { cx: 160, cy: 110, val: "Feb: 82%" },
                  { cx: 310, cy: 80, val: "Mar: 86%" },
                  { cx: 460, cy: 40, val: "Apr: 91%" },
                  { cx: 570, cy: 25, val: "May: 94%" }
                ].map((pt, pIdx) => (
                  <circle
                    key={pIdx}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="4.5"
                    fill="var(--color-background)"
                    stroke="rgb(99, 102, 241)"
                    strokeWidth="2.5"
                    className="cursor-pointer hover:r-6 hover:fill-indigo-500 transition-all duration-100"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActiveTooltip({ x: rect.left - 240, y: rect.top - 200, val: pt.val });
                    }}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                ))}
              </svg>

              {/* Chart Tooltips */}
              {activeTooltip && (
                <div 
                  className="absolute bg-zinc-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none select-none z-10"
                  style={{ left: activeTooltip.x, top: activeTooltip.y }}
                >
                  {activeTooltip.val}
                </div>
              )}

              {/* Month X Labels */}
              <div className="flex justify-between px-10 text-[9px] font-mono text-muted-foreground mt-1">
                <span>JAN</span>
                <span>FEB</span>
                <span>MAR</span>
                <span>APR</span>
                <span>MAY</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance frequency by Category (vertical CSS columns) */}
        <Card>
          <CardContent className="p-4 flex flex-col gap-4 select-none">
            <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Maintenance by Category</span>
              <span className="text-[10px] text-muted-foreground font-mono">Logged tickets count this quarter</span>
            </div>

            {/* Custom CSS vertical columns */}
            <div className="flex justify-between items-end h-56 pt-6 px-3">
              {[
                { label: "Heavy", value: 14, height: "h-32", color: "bg-indigo-500/80" },
                { label: "Power", value: 8, height: "h-20", color: "bg-zinc-400" },
                { label: "Fleet", value: 21, height: "h-44", color: "bg-indigo-600" },
                { label: "Tools", value: 4, height: "h-12", color: "bg-zinc-300 dark:bg-zinc-700" }
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 group w-12">
                  <span className="text-[9px] font-mono text-foreground font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {bar.value} WO
                  </span>
                  <div className={`w-8 rounded-t ${bar.color} ${bar.height} transition-all duration-300 hover:brightness-95`} />
                  <span className="text-[9px] font-mono font-bold text-zinc-500">{bar.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stacked Dept shares and Hourly Peak Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap Booking grid - 2/3 width */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4 flex flex-col gap-4 select-none">
            <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Peak Usage Heatmap</span>
              <span className="text-[10px] text-muted-foreground font-mono">Hourly resource booking density by weekday</span>
            </div>

            {/* Heatmap Board */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex gap-2">
                <div className="w-18 shrink-0" />
                {/* Hour header labels */}
                <div className="flex-1 grid grid-cols-6 gap-1 text-[9px] font-mono text-muted-foreground text-center">
                  {HOUR_LABELS.map((hr, idx) => <span key={idx}>{hr}</span>)}
                </div>
              </div>

              {HEATMAP_DATA.map((row, rIdx) => (
                <div key={rIdx} className="flex gap-2 items-center">
                  <span className="w-18 shrink-0 text-[10px] font-mono font-bold text-muted-foreground">{row.day}</span>
                  <div className="flex-1 grid grid-cols-6 gap-1 text-center font-mono text-[9px]">
                    {row.slots.map((val, idx) => (
                      <div 
                        key={idx} 
                        className={`py-2.5 rounded transition-all duration-100 hover:scale-102 ${getHeatmapColor(val)}`}
                        title={`Usage Load: ${val}%`}
                      >
                        {val}%
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Heatmap Legend */}
              <div className="flex items-center justify-end gap-3 mt-3 font-mono text-[8px] text-zinc-500">
                <span className="uppercase text-[7px] font-extrabold tracking-wider text-zinc-400">Load Scale:</span>
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-indigo-500/10" /> IDLE</div>
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-indigo-500/30" /> MODERATE</div>
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-indigo-500/60" /> HIGH LOAD</div>
                <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-indigo-600" /> PEAK LIMIT</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department-wise Allocation Shares (CSS Progress ratios) */}
        <Card>
          <CardContent className="p-4 flex flex-col gap-4 select-none">
            <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Department Allocation Share</span>
              <span className="text-[10px] text-muted-foreground font-mono">Asset distribution percentages by division</span>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {[
                { name: "Engineering (ENG)", pct: 45, color: "bg-indigo-500" },
                { name: "Logistics & Transport (LOG)", pct: 30, color: "bg-indigo-600" },
                { name: "Quality Assurance (QA)", pct: 15, color: "bg-zinc-400" },
                { name: "Finance & Accounting (FIN)", pct: 10, color: "bg-zinc-300 dark:bg-zinc-700" }
              ].map((dept, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 font-sans">
                  <div className="flex justify-between text-[11px] font-semibold text-foreground">
                    <span>{dept.name}</span>
                    <span className="font-mono">{dept.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted border border-border/60 overflow-hidden relative">
                    <motion.div
                      className={`h-full ${dept.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side-by-Side comparison table: Most used vs Idle assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        
        {/* Most Used */}
        <Card>
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Top Peak Utilization</span>
              <span className="text-[10px] text-muted-foreground font-mono">Assets logged under maximum operational hours</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                    <th className="pb-2">Tag</th>
                    <th className="pb-2">Asset Model</th>
                    <th className="pb-2 text-right">Utility Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {MOST_USED_ASSETS.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/40 last:border-b-0 hover:bg-muted/10 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-foreground">
                        <span className="bg-muted px-1.5 py-0.2 rounded border border-border">{item.tag}</span>
                      </td>
                      <td className="py-2.5 leading-tight">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{item.name}</span>
                          <span className="text-[9px] text-muted-foreground font-mono uppercase">{item.category}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {item.utilization}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Least Used (Idle) */}
        <Card>
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider text-zinc-500">Idle / Offline Assets</span>
              <span className="text-[10px] text-muted-foreground font-mono">Assets logged under minimum operational hours</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                    <th className="pb-2">Tag</th>
                    <th className="pb-2">Asset Model</th>
                    <th className="pb-2 text-right">Utility Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {LEAST_USED_ASSETS.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/40 last:border-b-0 hover:bg-muted/10 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-foreground">
                        <span className="bg-muted px-1.5 py-0.2 rounded border border-border">{item.tag}</span>
                      </td>
                      <td className="py-2.5 leading-tight">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{item.name}</span>
                          <span className="text-[9px] text-muted-foreground font-mono uppercase">{item.status}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-zinc-500">
                        {item.utilization}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
