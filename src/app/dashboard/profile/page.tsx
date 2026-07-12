"use client";

import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Lock,
  Edit2
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface AssignedAsset {
  tag: string;
  name: string;
  category: string;
  condition: string;
  assignedDate: string;
}

export default function ProfilePage() {
  // Mock logged-in user profile parameters (Musa)
  const [fullName, setFullName] = useState("Musa");
  const [email, setEmail] = useState("musaqureshi788code@gmail.com");
  const [phone, setPhone] = useState("+91 90123 45678");

  // Read-only system administrative blocks
  const systemRole = "System Administrator";
  const systemDept = "Engineering";
  const systemStatus = "Active / Verified";
  const systemClearance = "Level 5 (Full Access)";

  // Currently assigned assets to Musa
  const assignedAssets: AssignedAsset[] = [
    { 
      tag: "AF-0001", 
      name: "Caterpillar 320 Excavator", 
      category: "Heavy Machinery", 
      condition: "Good", 
      assignedDate: "2026-07-10" 
    },
    { 
      tag: "AF-0003", 
      name: "Hyster H190 Forklift", 
      category: "Logistics Fleet", 
      condition: "Good", 
      assignedDate: "2026-07-12" 
    }
  ];

  // Simulated save progress
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      // Hide success notification after 3s
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1 select-none border-b border-border pb-4">
        <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
          Identity // Credentials Directory
        </span>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          User Profile
        </h2>
        <p className="text-xs text-muted-foreground">
          Manage your personal contact info, view clearance credentials, and monitor checked-out assets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Panel: Profile Avatar Details card */}
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4 select-none">
            <div className="h-20 w-20 rounded-full bg-zinc-800 border-2 border-indigo-500/30 flex items-center justify-center text-zinc-100 shadow-inner relative group">
              <User className="h-10 w-10 text-indigo-400" />
              <div className="absolute inset-0 bg-zinc-950/70 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Edit2 className="h-4 w-4 text-zinc-300" />
              </div>
            </div>

            <div className="flex flex-col gap-0.5 leading-snug">
              <h3 className="text-sm font-bold text-foreground">{fullName}</h3>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">{systemRole}</span>
            </div>

            <div className="w-full border-t border-border/80 pt-4 flex flex-col gap-3 font-mono text-[10px] text-left">
              <div className="flex justify-between">
                <span className="text-zinc-500">CLEARANCE:</span>
                <span className="text-foreground font-bold">{systemClearance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">STATUS:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">{systemStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Form Fields and System Info */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Personal Info Form */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider select-none">
                Contact Information
              </span>

              <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isSaving}
                    leftIcon={<User className="h-4 w-4" />}
                  />
                  <Input 
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={isSaving}
                    leftIcon={<Phone className="h-4 w-4" />}
                  />
                </div>

                <Input 
                  label="Corporate Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSaving}
                  leftIcon={<Mail className="h-4 w-4" />}
                />

                <div className="flex items-center justify-between mt-2 select-none border-t border-border pt-4">
                  {saveSuccess ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      <CheckCircle2 className="h-4.5 w-4.5 animate-bounce" /> PROFILE DETAILS SAVED
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-zinc-500">
                      Changes affect display strings only.
                    </div>
                  )}

                  <Button type="submit" size="sm" isLoading={isSaving} className="font-mono uppercase tracking-wider text-xs">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* System Control Blocks (Read Only / Locked info) */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-3 select-none">
              <div className="flex justify-between items-center border-b border-border/60 pb-2.5">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Administrative System Settings
                </span>
                <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-zinc-500">
                  <Lock className="h-3 w-3" /> Managed by Administrator
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-1 font-sans text-xs">
                <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/20 p-3 leading-snug">
                  <span className="text-[8px] font-mono font-bold uppercase text-zinc-500">Assigned Role Scope</span>
                  <span className="font-semibold text-foreground">{systemRole}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/20 p-3 leading-snug">
                  <span className="text-[8px] font-mono font-bold uppercase text-zinc-500">Assigned Department</span>
                  <span className="font-semibold text-foreground">{systemDept}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checked Out Assets Ledger */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider select-none">
                Currently Checked-out Equipment
              </span>

              <div className="overflow-x-auto border border-border/60 rounded-md">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 font-mono text-[9px] text-muted-foreground uppercase tracking-wider select-none">
                      <th className="p-3 pl-4">Tag</th>
                      <th className="p-3">Asset Details</th>
                      <th className="p-3">Condition</th>
                      <th className="p-3 pr-4 text-right">Date Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedAssets.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground font-mono">
                          No checked-out assets assigned to your profile ledger.
                        </td>
                      </tr>
                    ) : (
                      assignedAssets.map((asset, idx) => (
                        <tr key={idx} className="border-b border-border/40 last:border-b-0 hover:bg-muted/10 transition-colors">
                          <td className="p-3 pl-4 font-mono font-bold text-zinc-500">
                            <span className="bg-muted px-1.5 py-0.2 rounded border border-border">{asset.tag}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col leading-snug">
                              <span className="font-semibold text-foreground">{asset.name}</span>
                              <span className="text-[9px] text-muted-foreground font-mono uppercase">{asset.category}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="inline-block px-1.5 py-0.2 rounded border text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10">
                              {asset.condition.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 pr-4 text-right font-mono text-zinc-500">
                            {asset.assignedDate}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
