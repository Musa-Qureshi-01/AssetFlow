"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  Cpu,
  ShieldCheck,
  ChevronDown,
  Server,
  Network,
} from "lucide-react";
import Logo from "@/components/ui/logo";
import Button from "@/components/ui/button";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How are employee access clearances authorized?",
      a: "New registrations must be verified and mapped to specific department roles by an active System Administrator before terminal gate access is unlocked.",
    },
    {
      q: "What telemetry streams are ingested?",
      a: "The platform natively interfaces with standard industrial telemetry channels (MQTT, OPC UA), tracking temperature scales, structural load stress, and real-time transit telemetry.",
    },
    {
      q: "Are the telemetry networks encrypted?",
      a: "Yes, all data streams are bound by end-to-end cryptographic protocols between physical hardware transponders and regional processing shards.",
    },
  ];

  const capabilities = [
    {
      icon: <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: "Active Telemetry Streams",
      desc: "Live monitoring of temperature shifts, load capacities, vibration metrics, and physical location coordinates across all active nodes.",
    },
    {
      icon: <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: "Lifecycle Gantt Sequencing",
      desc: "Track asset phases through procurement, installation, calibration, active deployment, and scheduled maintenance schedules.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: "Role-Based Control Clearances",
      desc: "Manage personnel clearance protocols, log system handshakes, and verify audit records for compliance standards.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo showText={true} size="sm" />
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#capabilities"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-colors hover:text-foreground"
            >
              Capabilities
            </a>
            <a
              href="#faq"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-colors hover:text-foreground"
            >
              FAQ
            </a>
            <a
              href="mailto:support@assetflow.com"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-colors hover:text-foreground"
            >
              Support Desk
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Portal Sign In
              </Button>
            </Link>
            <Link href="/auth/signup" className="hidden sm:inline-block">
              <Button size="sm">Request Onboarding</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60 py-16 md:py-24">
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-15" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] text-muted-foreground select-none">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              GLOBAL NETWORKS ONLINE (3/3 REGIONS)
            </div>

            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Odoo Asset
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Real-time telemetry streams, automated lifecycle procurement tracking,
              and hardware resource coordination for global enterprise systems.
            </p>

            <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button className="w-full justify-center gap-1.5" size="md">
                  Access Terminal Gate <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full justify-center" size="md">
                  Request Employee Access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section
          id="capabilities"
          className="border-b border-border/60 bg-muted/20 py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col gap-1.5 text-center md:text-left">
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                System Features
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Engineered for High-Density Resource Telemetry
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {capabilities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-background p-6 shadow-2xs transition-colors hover:border-zinc-300 dark:hover:border-zinc-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-muted/65">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col items-center gap-1.5 text-center">
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                Common Inquiries
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;

                return (
                  <div key={idx} className="overflow-hidden rounded-lg border border-border bg-background">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full cursor-pointer items-center justify-between p-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/10"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border bg-muted/15 p-4 text-xs leading-relaxed text-muted-foreground">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-zinc-950 py-10 text-xs font-mono text-zinc-400 select-none">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Logo showText={true} size="sm" className="brightness-150" />
            <span className="text-[10px] text-zinc-500">
              © {new Date().getFullYear()} AssetFlow Systems Inc. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-wider text-zinc-500">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Server className="h-3 w-3" />
              <span>GATEWAY ONLINE // US-EAST</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Network className="h-3 w-3" />
              <span>SHARD REPL: NOMINAL</span>
            </div>
            <Link href="/auth/login" className="transition-colors hover:text-zinc-200">
              Operator Terminal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}