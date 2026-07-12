"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { loginUser } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrors({});

    if (!validate()) return;

    try {
      setIsLoading(true);
      const response = await loginUser({ email, password });
      setIsLoading(false);
      setSuccessMsg(`Handshake successful as ${response.user?.role ?? "Employee"}. Redirecting to terminal dashboard...`);
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } catch (error) {
      setIsLoading(false);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Authentication rejected. Invalid employee credentials or security token expired.",
      });
    }
  };

  const handleDemoLogin = async (role: "admin" | "asset_manager" | "dept_head" | "employee") => {
    setErrors({});
    setSuccessMsg("");
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Demo login failed");
      setIsLoading(false);
      setSuccessMsg(`Demo session started as ${data.user?.name}. Redirecting...`);
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err) {
      setIsLoading(false);
      setErrors({ general: err instanceof Error ? err.message : "Demo login failed" });
    }
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
            {/* Dev Demo Quick-Access Panel */}
            <div className="w-full border-t border-dashed border-border pt-3 flex flex-col gap-2">
              <span className="text-[9px] text-center text-zinc-500 font-mono font-bold uppercase tracking-widest select-none">
                ⚡ Dev Mode — Instant Role Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { role: "admin"        as const, label: "Admin",         color: "text-indigo-500 border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10" },
                  { role: "asset_manager" as const, label: "Asset Manager",  color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10" },
                  { role: "dept_head"    as const, label: "Dept Head",      color: "text-amber-500 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10" },
                  { role: "employee"     as const, label: "Employee",        color: "text-zinc-400 border-zinc-700/40 bg-zinc-800/20 hover:bg-zinc-700/20" },
                ]).map(({ role, label, color }) => (
                  <button
                    key={role}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDemoLogin(role)}
                    className={`py-1.5 px-2 rounded border text-[10px] font-mono font-bold transition-all cursor-pointer disabled:opacity-40 ${color}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
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
