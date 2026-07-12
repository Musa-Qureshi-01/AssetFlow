"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, ShieldAlert, Lock, CheckCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { registerUser } from "@/services/auth";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Password criteria checklist
  const criteria = {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full legal name is required";
    }

    if (!email) {
      newErrors.email = "Corporate email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid corporate email";
    }

    if (!employeeId.trim()) {
      newErrors.employeeId = "Company Employee Identifier (ID) is required";
    } else if (!/^[A-Z0-9-]{3,12}$/i.test(employeeId)) {
      newErrors.employeeId = "Format must be alphanumeric (e.g. EMP-1049)";
    }

    if (!password) {
      newErrors.password = "Security password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password does not meet safety standards";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Security passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      setIsLoading(true);
      await registerUser({
        name: fullName,
        email,
        employeeId,
        role: "Employee",
        password,
      });
      setIsLoading(false);
      setIsSubmitted(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (error) {
      setIsLoading(false);
      setErrors({
        general: error instanceof Error ? error.message : "Registration failed",
      });
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-emerald-500/20 bg-emerald-500/[0.01]">
          <CardHeader className="bg-emerald-500/5 pb-4 border-emerald-500/10">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Registration Logged
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 mt-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Account Registration Under Review
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your employee credentials for <strong className="text-foreground">{fullName}</strong> ({employeeId}) have been logged as <strong className="text-foreground">Employee</strong> in the system records.
            </p>
            <div className="rounded border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-700 dark:text-indigo-400 flex items-start gap-3">
              <Info className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">Next Steps for Verification</span>
                <span>An Administrator must assign permissions and authorize your workspace profile. Contact your department lead to expedite security credential onboarding.</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full">
                Return to Sign In Terminal
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
          New Node // Onboarding
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Employee Registration
        </h1>
        <p className="text-sm text-muted-foreground">
          Create your employee account to request system access permissions.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-muted/10">
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
              Security Profile Definition
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 mt-4">
            {errors.general && (
              <div className="rounded border border-danger/20 bg-danger/5 p-3 text-xs text-danger">
                {errors.general}
              </div>
            )}

            {/* Full Name */}
            <Input
              label="Legal Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Musa"
              error={errors.fullName}
              leftIcon={<User className="h-4 w-4" />}
              required
              disabled={isLoading}
            />

            {/* Role — locked to EMPLOYEE for new registrations */}
            <div className="flex flex-col gap-1.5 w-full select-none">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Assigned Role
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded border border-border bg-muted/30 text-xs font-mono text-muted-foreground">
                <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>New accounts are provisioned as <strong className="text-foreground">Employee</strong>. An administrator can elevate your role after approval.</span>
              </div>
            </div>

            {/* Corporate Email */}
            <Input
              label="Corporate Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="musaqureshi788code@gmail.com"
              error={errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              required
              disabled={isLoading}
            />

            {/* Employee ID */}
            <Input
              label="Company Employee ID"
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP-9042"
              error={errors.employeeId}
              leftIcon={<ShieldAlert className="h-4 w-4" />}
              required
              disabled={isLoading}
            />

            {/* Password */}
            <Input
              label="Onboarding Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong security phrase"
              error={errors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              required
              disabled={isLoading}
            />

            {/* Password strength checklist */}
            <div className="rounded border border-border bg-muted/20 p-3 font-mono text-[10px]">
              <span className="block font-semibold text-muted-foreground uppercase mb-1.5 tracking-wider">
                Password Security Checks:
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${criteria.length ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                  <span className={criteria.length ? "text-foreground font-medium" : ""}>Min 8 Characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${criteria.uppercase ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                  <span className={criteria.uppercase ? "text-foreground font-medium" : ""}>Uppercase Letter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${criteria.number ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                  <span className={criteria.number ? "text-foreground font-medium" : ""}>Contains Digit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${criteria.special ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                  <span className={criteria.special ? "text-foreground font-medium" : ""}>Special Symbol</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password selection"
              error={errors.confirmPassword}
              leftIcon={<Lock className="h-4 w-4" />}
              required
              disabled={isLoading}
            />

            <label className="flex items-start gap-2.5 select-none cursor-pointer mt-1">
              <input
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 accent-indigo-600"
                disabled={isLoading}
              />
              <span className="text-xs text-muted-foreground leading-snug">
                I acknowledge company data usage policies and system security protocols.
              </span>
            </label>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Submit Onboarding Request
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        Already have credentials?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-foreground hover:underline"
        >
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}
