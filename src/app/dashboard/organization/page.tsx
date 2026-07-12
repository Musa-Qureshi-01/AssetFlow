"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Layers, 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck, 
  ArrowLeftRight, 
  X, 
  CheckCircle2, 
  Plus, 
  Info
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Types
type TabType = "departments" | "categories" | "employees";
type DrawerAction = "create_dept" | "edit_dept" | "create_cat" | "edit_cat" | "reassign_emp" | "promote_emp";

interface Department {
  code: string;
  name: string;
  head: string;
  parent: string;
  status: "ACTIVE" | "DEACTIVATED";
}

interface AssetCategory {
  name: string;
  description: string;
  itemCount: number;
  fields: string[];
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: "Admin" | "Head" | "AssetManager" | "Employee";
  status: "ACTIVE" | "INACTIVE";
}

// Initial Mock Data
const INITIAL_DEPARTMENTS: Department[] = [
  { code: "ENG", name: "Engineering", head: "Aarav Mehta", parent: "Operations", status: "ACTIVE" },
  { code: "LOG", name: "Logistics & Transport", head: "Chloe Dubois", parent: "Operations", status: "ACTIVE" },
  { code: "FIN", name: "Finance & Accounting", head: "Elena Rossi", parent: "Administration", status: "ACTIVE" },
  { code: "HR", name: "Human Resources", head: "Rajesh Kumar", parent: "Administration", status: "ACTIVE" },
  { code: "QA", name: "Quality Assurance", head: "None Assigned", parent: "Engineering", status: "DEACTIVATED" },
];

const INITIAL_CATEGORIES: AssetCategory[] = [
  { name: "Heavy Machinery", description: "Large earthmovers, excavators, high-capacity cranes", itemCount: 8, fields: ["Engine Hours", "Hydraulic Pressure Code", "Calibration Period"] },
  { name: "Power Systems", description: "Mobile diesel generators, regional transformer boxes", itemCount: 12, fields: ["Peak Voltage", "Load Factor Max", "Phase Code"] },
  { name: "Logistics Fleet", description: "Flatbed freight trucks, warehouse forklifts", itemCount: 6, fields: ["License Number", "Fuel Class", "Odometer Miles"] },
  { name: "Calibrated Tools", description: "Precision gauges, multi-meters, laser levels", itemCount: 45, fields: ["Certification Date", "Precision Scale", "Case Code"] },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "EMP-0012", name: "Musa", email: "musaqureshi788code@gmail.com", department: "Engineering", role: "Admin", status: "ACTIVE" },
  { id: "EMP-0921", name: "Rajesh Kumar", email: "rajesh.kumar@company.com", department: "Human Resources", role: "Head", status: "ACTIVE" },
  { id: "EMP-1082", name: "Muskan", email: "kawadkarmuskan4@gmail.com", department: "Logistics & Transport", role: "Employee", status: "ACTIVE" },
  { id: "EMP-1002", name: "Elena Rossi", email: "elena.rossi@company.com", department: "Finance & Accounting", role: "AssetManager", status: "ACTIVE" },
  { id: "EMP-0881", name: "Chloe Dubois", email: "chloe.dubois@company.com", department: "Logistics & Transport", role: "Employee", status: "ACTIVE" },
  { id: "EMP-0402", name: "Aarav Mehta", email: "aarav.mehta@company.com", department: "Quality Assurance", role: "Employee", status: "ACTIVE" },
];

export default function OrganizationSetupPage() {
  const [activeTab, setActiveTab] = useState<TabType>("departments");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDrawer, setActiveDrawer] = useState<DrawerAction | null>(null);
  
  // Dynamic State List Handlers
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);

  // Focus Items
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedCat, setSelectedCat] = useState<AssetCategory | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Form Fields State
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptHead, setDeptHead] = useState("None Assigned");
  const [deptParent, setDeptParent] = useState("Operations");
  const [deptStatus, setDeptStatus] = useState<"ACTIVE" | "DEACTIVATED">("ACTIVE");

  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catFields, setCatFields] = useState<string[]>([]);
  const [newFieldTag, setNewFieldTag] = useState("");

  const [empDept, setEmpDept] = useState("Engineering");
  const [empRole, setEmpRole] = useState<Employee["role"]>("Employee");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleOpenDrawer = (action: DrawerAction, context?: Department | AssetCategory | Employee) => {
    setActiveDrawer(action);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});
    
    if (action === "create_dept") {
      setDeptName("");
      setDeptCode("");
      setDeptHead("None Assigned");
      setDeptParent("Operations");
      setDeptStatus("ACTIVE");
      setSelectedDept(null);
    } else if (action === "edit_dept" && context) {
      const d = context as Department;
      setSelectedDept(d);
      setDeptName(d.name);
      setDeptCode(d.code);
      setDeptHead(d.head);
      setDeptParent(d.parent);
      setDeptStatus(d.status);
    } else if (action === "create_cat") {
      setCatName("");
      setCatDesc("");
      setCatFields([]);
      setSelectedCat(null);
    } else if (action === "edit_cat" && context) {
      const c = context as AssetCategory;
      setSelectedCat(c);
      setCatName(c.name);
      setCatDesc(c.description);
      setCatFields([...c.fields]);
    } else if (action === "reassign_emp" && context) {
      const e = context as Employee;
      setSelectedEmp(e);
      setEmpDept(e.department);
    } else if (action === "promote_emp" && context) {
      const e = context as Employee;
      setSelectedEmp(e);
      setEmpRole(e.role);
    }
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setSaveSuccess(false);
    setIsSaving(false);
    setErrors({});
  };

  const handleAddFieldTag = () => {
    if (newFieldTag.trim() && !catFields.includes(newFieldTag.trim())) {
      setCatFields([...catFields, newFieldTag.trim()]);
      setNewFieldTag("");
    }
  };

  const handleRemoveFieldTag = (tag: string) => {
    setCatFields(catFields.filter(f => f !== tag));
  };

  // Submit Operations
  const handleDeptSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!deptName.trim()) return setErrors({ name: "Department nomenclature name is required" });
    if (!deptCode.trim() || deptCode.length < 2) return setErrors({ code: "Unique 2-4 character code is required" });

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      if (selectedDept) {
        // Edit flow
        setDepartments(departments.map(d => d.code === selectedDept.code ? { code: deptCode.toUpperCase(), name: deptName, head: deptHead, parent: deptParent, status: deptStatus } : d));
      } else {
        // Create flow
        setDepartments([...departments, { code: deptCode.toUpperCase(), name: deptName, head: deptHead, parent: deptParent, status: deptStatus }]);
      }
    }, 1200);
  };

  const handleCatSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!catName.trim()) return setErrors({ name: "Category category name is required" });

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      if (selectedCat) {
        setCategories(categories.map(c => c.name === selectedCat.name ? { name: catName, description: catDesc, itemCount: c.itemCount, fields: catFields } : c));
      } else {
        setCategories([...categories, { name: catName, description: catDesc, itemCount: 0, fields: catFields }]);
      }
    }, 1200);
  };

  const handleReassignSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setEmployees(employees.map(emp => emp.id === selectedEmp.id ? { ...emp, department: empDept } : emp));
    }, 1200);
  };

  const handlePromoteSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setEmployees(employees.map(emp => emp.id === selectedEmp.id ? { ...emp, role: empRole } : emp));
    }, 1200);
  };

  const handleDeactivateDept = (code: string) => {
    setDepartments(departments.map(d => d.code === code ? { ...d, status: d.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE" } : d));
  };

  // Filters
  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCats = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmps = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            Administrative Deck
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Organization Setup
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage corporate division departments, register catalog categories, and promote role privileges.
          </p>
        </div>

        {/* Global Tab Controller */}
        <div className="flex items-center gap-1.5 p-1 rounded bg-muted/40 border border-border w-fit sm:w-auto">
          {[
            { id: "departments", label: "Departments", icon: <Building2 className="h-3.5 w-3.5" /> },
            { id: "categories", label: "Asset Categories", icon: <Layers className="h-3.5 w-3.5" /> },
            { id: "employees", label: "Employee Directory", icon: <Users className="h-3.5 w-3.5" /> }
          ].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setSearchTerm("");
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global search and action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="relative flex items-center max-w-xs w-full">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            className="pl-9 py-1.5 pr-3 h-9"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          {activeTab === "departments" && (
            <Button onClick={() => handleOpenDrawer("create_dept")} size="sm" className="gap-1.5 font-mono uppercase tracking-wider text-xs">
              <Plus className="h-4 w-4" /> Create Department
            </Button>
          )}
          {activeTab === "categories" && (
            <Button onClick={() => handleOpenDrawer("create_cat")} size="sm" className="gap-1.5 font-mono uppercase tracking-wider text-xs">
              <Plus className="h-4 w-4" /> Create Category
            </Button>
          )}
        </div>
      </div>

      {/* Main Tab Panels Display */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === "departments" && (
            <motion.div
              key="departments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/20 font-mono text-[10px] text-muted-foreground uppercase tracking-wider select-none">
                          <th className="p-3 pl-4">Dept Code</th>
                          <th className="p-3">Department Name</th>
                          <th className="p-3">Department Head</th>
                          <th className="p-3">Parent Node</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDepts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground font-mono">
                              No active department records found.
                            </td>
                          </tr>
                        ) : (
                          filteredDepts.map((dept, idx) => (
                            <tr key={idx} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                              <td className="p-3 pl-4 font-mono font-bold text-foreground">
                                <span className="bg-muted px-2 py-0.5 rounded border border-border">
                                  {dept.code}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-foreground">{dept.name}</td>
                              <td className="p-3 text-muted-foreground font-mono">{dept.head}</td>
                              <td className="p-3 text-muted-foreground font-mono">{dept.parent}</td>
                              <td className="p-3">
                                <span className={`inline-block px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${
                                  dept.status === "ACTIVE" 
                                    ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" 
                                    : "text-zinc-500 bg-zinc-500/5 border-zinc-500/10"
                                }`}>
                                  {dept.status}
                                </span>
                              </td>
                              <td className="p-3 pr-4 text-right font-mono">
                                <div className="flex items-center justify-end gap-2.5">
                                  <button 
                                    onClick={() => handleOpenDrawer("edit_dept", dept)}
                                    className="text-zinc-500 hover:text-foreground hover:bg-muted p-1 rounded cursor-pointer transition-colors"
                                    title="Edit settings"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeactivateDept(dept.code)}
                                    className={`p-1 rounded cursor-pointer transition-colors ${
                                      dept.status === "ACTIVE" 
                                        ? "text-zinc-400 hover:text-red-500 hover:bg-red-500/5" 
                                        : "text-emerald-500 hover:bg-emerald-500/5"
                                    }`}
                                    title={dept.status === "ACTIVE" ? "Deactivate department" : "Activate department"}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "categories" && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredCats.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-muted-foreground font-mono border border-dashed border-border rounded-lg bg-background">
                    No asset category profiles registered.
                  </div>
                ) : (
                  filteredCats.map((cat, idx) => (
                    <Card key={idx} className="hover:border-zinc-300 dark:hover:border-zinc-800 transition-all duration-150">
                      <CardHeader className="p-4 bg-muted/20 border-b border-border flex flex-row items-center justify-between select-none">
                        <span className="font-bold text-foreground text-xs uppercase tracking-wider">{cat.name}</span>
                        <span className="text-[10px] font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          {cat.itemCount} ITEMS
                        </span>
                      </CardHeader>
                      <CardContent className="p-4 flex flex-col gap-3">
                        <p className="text-xs text-muted-foreground leading-relaxed h-12 overflow-y-auto">
                          {cat.description}
                        </p>
                        
                        {/* Custom attributes list */}
                        <div className="flex flex-col gap-1 border-t border-border/60 pt-3 font-mono text-[9px]">
                          <span className="text-[8px] uppercase text-zinc-500 font-extrabold tracking-wider">Field Indicators</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {cat.fields.map((f, fIdx) => (
                              <span key={fIdx} className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Edit Action link */}
                        <button
                          onClick={() => handleOpenDrawer("edit_cat", cat)}
                          className="mt-2 text-right w-full text-[10px] font-bold font-mono hover:underline text-indigo-600 dark:text-indigo-400 cursor-pointer"
                        >
                          Modify Parameters // Edit
                        </button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "employees" && (
            <motion.div
              key="employees"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/20 font-mono text-[10px] text-muted-foreground uppercase tracking-wider select-none">
                          <th className="p-3 pl-4">Employee ID</th>
                          <th className="p-3">Full Legal Name</th>
                          <th className="p-3">Corporate Email</th>
                          <th className="p-3">Department scope</th>
                          <th className="p-3">Clearance Role</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmps.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                              No matching operator directory records found.
                            </td>
                          </tr>
                        ) : (
                          filteredEmps.map((emp, idx) => (
                            <tr key={idx} className="border-b border-border/60 hover:bg-muted/10 transition-colors">
                              <td className="p-3 pl-4 font-mono text-muted-foreground font-semibold">{emp.id}</td>
                              <td className="p-3 font-semibold text-foreground">{emp.name}</td>
                              <td className="p-3 text-muted-foreground font-mono">{emp.email}</td>
                              <td className="p-3 text-muted-foreground font-sans font-medium">{emp.department}</td>
                              <td className="p-3 font-mono font-bold">
                                <span className={`inline-block px-1.5 py-0.2 rounded border text-[9px] ${
                                  emp.role === "Admin"
                                    ? "text-red-500 bg-red-500/5 border-red-500/10"
                                    : emp.role === "Head"
                                    ? "text-indigo-500 bg-indigo-500/5 border-indigo-500/10"
                                    : emp.role === "AssetManager"
                                    ? "text-amber-600 bg-amber-600/5 border-amber-600/10 dark:text-amber-400"
                                    : "text-zinc-500 bg-zinc-500/5 border-zinc-500/10"
                                }`}>
                                  {emp.role}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="inline-block px-1.5 py-0.2 rounded font-mono text-[9px] font-bold text-emerald-500 bg-emerald-500/5 border-emerald-500/10">
                                  {emp.status}
                                </span>
                              </td>
                              <td className="p-3 pr-4 text-right font-mono text-[10px]">
                                <div className="flex items-center justify-end gap-3.5">
                                  <button
                                    onClick={() => handleOpenDrawer("reassign_emp", emp)}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <ArrowLeftRight className="h-3 w-3" /> Reassign
                                  </button>
                                  <button
                                    onClick={() => handleOpenDrawer("promote_emp", emp)}
                                    className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <UserCheck className="h-3 w-3" /> Promote
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Slide Action Drawer Overlay */}
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

            {/* Slide drawer */}
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
                    {activeDrawer === "create_dept" && <>Create New Department</>}
                    {activeDrawer === "edit_dept" && <>Modify Department Settings</>}
                    {activeDrawer === "create_cat" && <>Create Asset Category</>}
                    {activeDrawer === "edit_cat" && <>Modify Category Settings</>}
                    {activeDrawer === "reassign_emp" && <>Reassign Employee Depot</>}
                    {activeDrawer === "promote_emp" && <>Promote Clearance Level</>}
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
                  /* Success indicator panel */
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 animate-bounce" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Registry Committed</h4>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        The configuration changes were written to local variables and propagated across administrative shards.
                      </p>
                    </div>
                    <Button onClick={handleCloseDrawer} size="sm" variant="outline" className="mt-2">
                      Dismiss Console
                    </Button>
                  </div>
                ) : (
                  /* Forms */
                  <div className="flex flex-col gap-4">
                    {/* Department edit/create form */}
                    {(activeDrawer === "create_dept" || activeDrawer === "edit_dept") && (
                      <form onSubmit={handleDeptSave} className="flex flex-col gap-4">
                        <Input 
                          label="Department Name"
                          value={deptName}
                          onChange={(e) => setDeptName(e.target.value)}
                          placeholder="e.g. Quality Assurance"
                          error={errors.name}
                          required
                          disabled={isSaving}
                        />

                        <Input 
                          label="Department Code"
                          value={deptCode}
                          onChange={(e) => setDeptCode(e.target.value)}
                          placeholder="e.g. QA"
                          error={errors.code}
                          required
                          disabled={isSaving}
                        />

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Department Head Supervisor
                          </label>
                          <select
                            value={deptHead}
                            onChange={(e) => setDeptHead(e.target.value)}
                            disabled={isSaving}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="None Assigned">None Assigned (Queue Vacant)</option>
                            <option value="Aarav Mehta">Aarav Mehta (Engineering)</option>
                            <option value="Chloe Dubois">Chloe Dubois (Logistics)</option>
                            <option value="Elena Rossi">Elena Rossi (Finance)</option>
                            <option value="Rajesh Kumar">Rajesh Kumar (HR)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Parent Division Branch
                          </label>
                          <select
                            value={deptParent}
                            onChange={(e) => setDeptParent(e.target.value)}
                            disabled={isSaving}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Operations">Operations</option>
                            <option value="Administration">Administration</option>
                            <option value="Engineering">Engineering</option>
                            <option value="None (Root Node)">None (Root Node)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Operational Status
                          </label>
                          <select
                            value={deptStatus}
                            onChange={(e) => setDeptStatus(e.target.value as "ACTIVE" | "DEACTIVATED")}
                            disabled={isSaving}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DEACTIVATED">DEACTIVATED</option>
                          </select>
                        </div>

                        <Button type="submit" className="w-full mt-4 animate-scale" isLoading={isSaving}>
                          Save Department
                        </Button>
                      </form>
                    )}

                    {/* Category form */}
                    {(activeDrawer === "create_cat" || activeDrawer === "edit_cat") && (
                      <form onSubmit={handleCatSave} className="flex flex-col gap-4">
                        <Input 
                          label="Category Name"
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          placeholder="e.g. Precision Instruments"
                          error={errors.name}
                          required
                          disabled={isSaving}
                        />

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Category Scope Description
                          </label>
                          <textarea
                            value={catDesc}
                            onChange={(e) => setCatDesc(e.target.value)}
                            disabled={isSaving}
                            rows={3}
                            placeholder="Provide operational boundaries for assets logged under this category..."
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden focus:ring-1 focus:ring-ring focus:border-ring resize-none"
                          />
                        </div>

                        {/* Field Indicator custom tags builder */}
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Category-Specific Field Indicators
                          </label>
                          <div className="flex gap-2">
                            <Input 
                              value={newFieldTag}
                              onChange={(e) => setNewFieldTag(e.target.value)}
                              placeholder="e.g. Engine Temperature"
                              disabled={isSaving}
                            />
                            <button
                              type="button"
                              onClick={handleAddFieldTag}
                              disabled={isSaving}
                              className="px-3 rounded border border-border bg-muted/65 hover:bg-muted text-foreground transition-colors font-mono font-bold text-xs cursor-pointer flex items-center justify-center"
                            >
                              Add
                            </button>
                          </div>
                          
                          {/* Tags list */}
                          <div className="flex flex-wrap gap-1.5 mt-2 p-3.5 rounded border border-dashed border-border bg-muted/15">
                            {catFields.length === 0 ? (
                              <span className="text-[10px] text-muted-foreground font-mono">No custom field parameters mapped.</span>
                            ) : (
                              catFields.map((f, idx) => (
                                <span key={idx} className="flex items-center gap-1 bg-background text-foreground px-2 py-0.5 rounded border border-border font-mono text-[10px]">
                                  {f}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFieldTag(f)}
                                    className="text-muted-foreground hover:text-red-500 rounded cursor-pointer"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
                          Save Asset Category
                        </Button>
                      </form>
                    )}

                    {/* Employee reassign department form */}
                    {activeDrawer === "reassign_emp" && selectedEmp && (
                      <form onSubmit={handleReassignSave} className="flex flex-col gap-4">
                        <div className="rounded border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-700 dark:text-indigo-400 flex items-start gap-3 select-none">
                          <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-1">
                            <span className="font-bold">Custodian Mapping</span>
                            <span>Relocating employee <strong className="text-foreground">{selectedEmp.name}</strong> will update active custodian records.</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Select Target Department
                          </label>
                          <select
                            value={empDept}
                            onChange={(e) => setEmpDept(e.target.value)}
                            disabled={isSaving}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            {departments.map((d, idx) => (
                              <option key={idx} value={d.name}>{d.name} ({d.code})</option>
                            ))}
                          </select>
                        </div>

                        <Button type="submit" className="w-full mt-4" isLoading={isSaving}>
                          Confirm Department Reassignment
                        </Button>
                      </form>
                    )}

                    {/* Employee promote clearance role form */}
                    {activeDrawer === "promote_emp" && selectedEmp && (
                      <form onSubmit={handlePromoteSave} className="flex flex-col gap-4">
                        <div className="rounded border border-red-500/20 bg-red-500/[0.01] p-4 text-xs text-muted-foreground flex items-start gap-3 select-none">
                          <Info className="h-4.5 w-4.5 shrink-0 mt-0.5 text-danger" />
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-foreground">Privileged Credentials Override</span>
                            <span>Changing clearance credentials for <strong className="text-foreground">{selectedEmp.name}</strong> affects system audit accesses.</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                            Select Clearance Level
                          </label>
                          <select
                            value={empRole}
                            onChange={(e) => setEmpRole(e.target.value as Employee["role"])}
                            disabled={isSaving}
                            className="w-full text-sm py-2 px-3 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring"
                          >
                            <option value="Admin">Admin (Full System Access)</option>
                            <option value="Head">Head (Division Supervisor)</option>
                            <option value="AssetManager">AssetManager (Inventory Custodian)</option>
                            <option value="Employee">Employee (Operational Staff)</option>
                          </select>
                        </div>

                        <Button type="submit" className="w-full mt-4 animate-scale" isLoading={isSaving}>
                          Confirm Promotion/Override
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border pt-4 text-[10px] font-mono text-muted-foreground flex justify-between select-none">
                <span>SECURED CORE API</span>
                <span>ASSETFLOW ERP // ADMIN</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
