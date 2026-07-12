"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // Countdown timer for mock resend trigger
  useEffect(() => {
    if (!isSubmitted || cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, cooldown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please input your registered corporate email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid corporate email.");
      return;
    }

    setIsLoading(true);
    // Simulate token dispatch handshake
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setCooldown(60);
    }, 1200);
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCooldown(60);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-indigo-500/20 bg-indigo-500/1">
          <CardHeader className="bg-indigo-500/5 pb-4 border-indigo-500/10 flex flex-row items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Token Dispatched
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Clock className="h-3.5 w-3.5" />
              <span>TTL: 15:00m</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 mt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Recovery Link Sent
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We have dispatched a cryptographic temporary recovery link to:
              <br />
              <strong className="text-foreground">{email}</strong>
            </p>
            
            <div className="rounded border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground flex flex-col gap-2 font-mono">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">Security Directives:</span>
              <ul className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Access corporate mailbox from an approved device.</li>
                <li>The security token expires automatically in 15 minutes.</li>
                <li>Ensure email matches employee active directory registry.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || isLoading}
              className="w-full text-xs font-mono py-2 rounded border border-border bg-background hover:bg-accent disabled:opacity-50 text-foreground transition-all duration-150 active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-2"
            >
              {cooldown > 0 ? (
                `Resend Verification Payload (${cooldown}s)`
              ) : (
                "Resend Verification Payload"
              )}
            </button>
            <Link href="/auth/login" className="w-full">
              <Button variant="ghost" className="w-full flex items-center justify-center gap-1">
                Return to Login Gate <ArrowRight className="h-3.5 w-3.5" />
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
          Key Recovery // Portal
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Request Password Reset
        </h1>
        <p className="text-sm text-muted-foreground">
          Initiate system credential recovery by verifying your corporate email node.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-muted/10">
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
              Identity Verification
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 mt-4">
            {error && (
              <div className="flex items-start gap-2.5 rounded border border-danger/20 bg-danger/5 p-3 text-xs text-danger">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">Input Error</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <Input
              label="Registered Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
              required
              disabled={isLoading}
            />
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Verify Identity & Dispatch Link
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        Remembered your credential codes?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-foreground hover:underline"
        >
          Sign In Gate
        </Link>
      </div>
    </motion.div>
  );
}
