"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-background font-sans text-foreground overflow-hidden">
      {/* Subtle grid background covering the page for premium enterprise ERP look */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex w-full items-center justify-between p-6 sm:px-10">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo showText={true} size="md" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
      </header>

      {/* Centered Form Wrapper */}
      <main className="relative z-10 mx-auto my-auto flex w-full max-w-md flex-col justify-center gap-6 p-6 sm:p-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-6 text-center text-xs text-muted-foreground/60 select-none">
        Secured with end-to-end operational encryption protocols. // © {new Date().getFullYear()} ASSETFLOW ERP
      </footer>
    </div>
  );
}
