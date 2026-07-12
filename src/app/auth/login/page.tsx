"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Shield, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [successMsg, setSuccessMsg] = useState("");

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = "Employee email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid corporate email address";
    }

    if (!password) {
      newErrors.password = "Security credential password is required";
    } else if (password.length < 6) {
      newErrors.password = "Credentials must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);
    // Simulate auth token API handshake
    setTimeout(() => {
      setIsLoading(false);
      if (email === "demo@assetflow.com" && password === "password123") {
        setSuccessMsg(`Handshake successful as ${role}. Redirecting to terminal dashboard...`);
      } else {
        setErrors({
          general: "Authentication rejected. Invalid employee credentials or security token expired.",
        });
      }
    }, 1500);
  };

  const handleQuickDemoFill = () => {
    setEmail("demo@assetflow.com");
    setPassword("password123");
    setErrors({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1.5 text-center sm:text-left">
        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
          Gate Access // Portal
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Employee Portal Sign In
        </h1>
        <p className="text-sm text-muted-foreground">
          Provide your enterprise keys below to access the management interface.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-muted/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
                Credentials Verification
              </span>
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 mt-4">
            {/* General form feedback state */}
            {errors.general && (
              <div className="flex items-start gap-2.5 rounded border border-danger/20 bg-danger/5 p-3 text-xs text-danger">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">Security Alert</span>
                  <span>{errors.general}</span>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2.5 rounded border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 animate-bounce" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">Verified</span>
                  <span>{successMsg}</span>
                </div>
              </div>
            )}

            {/* Role / RBAC Clearance Selection */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="role-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
                Clearance Role Scope
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-muted-foreground pointer-events-none flex items-center justify-center h-4 w-4">
                  <Shield className="h-4 w-4" />
                </div>
                <select
                  id="role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                  className="w-full text-sm py-2 pl-9 pr-8 rounded border border-border bg-background text-foreground transition-all duration-150 outline-hidden cursor-pointer focus:ring-1 focus:ring-ring focus:border-ring appearance-none"
                >
                  <option value="Admin">Admin (System Administrator)</option>
                  <option value="Head">Head (Division Lead)</option>
                  <option value="AssetManager">AssetManager (Asset Manager)</option>
                  <option value="Employee">Employee (Operational Staff)</option>
                </select>
                <div className="absolute right-3 pointer-events-none flex items-center justify-center text-muted-foreground">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. employee@company.com"
              error={errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              required
              disabled={isLoading}
            />

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <Input
                label="Security Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={errors.password}
                leftIcon={<Lock className="h-4 w-4" />}
                required
                disabled={isLoading}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground focus:outline-hidden p-0.5 rounded cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
              <div className="flex items-center justify-between mt-1">
                <label className="flex items-center gap-2 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 accent-indigo-600"
                    disabled={isLoading}
                  />
                  <span className="text-xs text-muted-foreground">Keep terminal session active</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign In to Terminal
            </Button>

            {/* Quick Demo Assist Block */}
            <div className="w-full text-center border-t border-dashed border-border pt-3">
              <span className="text-[10px] text-muted-foreground font-mono">
                DEVELOPER DEMO CREDENTIALS:
              </span>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="mt-1 block mx-auto text-xs font-mono py-1 px-2.5 rounded bg-muted hover:bg-muted-foreground/15 border border-border text-foreground transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                demo@assetflow.com // password123
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        First day on shift?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-foreground hover:underline"
        >
          Request Employee Account
        </Link>
      </div>
    </motion.div>
  );
}
