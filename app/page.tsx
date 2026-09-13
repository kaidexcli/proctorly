"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  QrCode,
  Link as LinkIcon,
  Maximize,
  Video,
  Mic,
  Copy,
  Eye,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Lock,
  FileCheck,
  Printer,
  Share2,
  CheckCircle2,
  XCircle,
  Activity,
  Award,
} from "lucide-react";
import ExamJoinCard from "@/components/student/ExamJoinCard";
import AntiCheatSandbox from "@/components/common/AntiCheatSandbox";
import { examStore } from "@/lib/examStore";
import { soundEffects } from "@/lib/soundEffects";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Hero Section with Ambient Diffuse Auras */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-zinc-200 dark:border-zinc-800/80 bg-linear-to-b from-white via-slate-50 to-slate-100/80 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 mesh-gradient-light dark:mesh-gradient-dark">
        {/* Glow Auras */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-100 bg-indigo-500/10 dark:bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-100 h-87.5 bg-emerald-500/10 dark:bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/80 dark:bg-indigo-950/70 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 backdrop-blur-md mb-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Zero-Trust Academic Assessment & AI Surveillance Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-900 dark:text-white max-w-5xl mx-auto leading-[1.12]">
            Secure Online Exams with{" "}
            <span className="bg-linear-to-r from-indigo-600 via-teal-500 to-emerald-600 dark:from-indigo-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              Ironclad Anti-Cheating
            </span>{" "}
            & Omnichannel Sharing
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Built for modern universities and certifications. A dual-sided
            platform: candidates take assessments in a strictly locked-down
            environment with biometric tracking, while instructors manage live
            multi-stream surveillance grids and omnichannel sharing via dynamic
            QR, access codes, and LMS embeds.
          </p>

          {/* Institutional Trust Metrics Strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-sm" />
              <span>100% Client-Side Lockdown</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-sm" />
              <span>SHA-256 Verified Certificates</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-sm" />
              <span>Real-Time Tab Synchronization</span>
            </div>
          </div>

          {/* Side-by-Side Dual Portals Container */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left max-w-6xl mx-auto items-start">
            {/* LEFT: STUDENT ACCESS CARD */}
            <div id="join" className="lg:col-span-7">
              <div className="relative">
                <div className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-black text-white dark:text-zinc-950 uppercase tracking-wider z-20 shadow-md">
                  Student Portal
                </div>
                <Suspense
                  fallback={
                    <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                      Loading student portal...
                    </div>
                  }
                >
                  <ExamJoinCard />
                </Suspense>
              </div>
            </div>

            {/* RIGHT: PROFESSOR COMMAND HUB PREVIEW */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="rounded-3xl border border-zinc-200 dark:border-indigo-800/60 bg-white/90 dark:bg-linear-to-b dark:from-indigo-950/30 dark:via-zinc-900/90 dark:to-zinc-900/95 p-6 sm:p-7 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/15 blur-2xl pointer-events-none" />

                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-700/50 px-3 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                    Professor & Proctor Suite
                  </span>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                  Instructor Command Center
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Create proctored assessments, distribute instantly via dynamic
                  QR or access PIN, and supervise all active candidates in the
                  real-time surveillance grid.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/professor?tab=create"
                    onClick={() => soundEffects.playClick()}
                    className="flex items-center justify-between rounded-2xl border border-indigo-200 dark:border-indigo-700/50 bg-indigo-50/80 dark:bg-indigo-600/20 p-3.5 text-xs sm:text-sm font-semibold text-indigo-950 dark:text-white hover:bg-indigo-100 dark:hover:bg-indigo-600/30 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Create New Proctored Exam</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/professor?tab=monitor"
                    onClick={() => soundEffects.playClick()}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Live Proctoring Grid & Feeds</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/professor?tab=exams"
                    onClick={() => soundEffects.playClick()}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Share2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Exam Library & Sharing Tools</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/professor?tab=results"
                    onClick={() => soundEffects.playClick()}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3.5 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span>Integrity Audit Reports & Grades</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Quick Status Stats Card */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 grid grid-cols-2 gap-3 text-center shadow-sm">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    100%
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Browser Lockdown
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    Zero-Trust
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    AI Presence Track
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Interactive Anti-Cheat Sandbox Playground */}
      <section className="py-20 bg-slate-50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800/50 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Interactive Live Demonstration
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white mt-3">
              Experience the Defense Heuristics
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Test how Proctorly reacts to cheating attempts in real-time right
              in your browser.
            </p>
          </div>

          <AntiCheatSandbox />
        </div>
      </section>

      {/* Feature Section 1: Complete Anti-Cheating Defense Matrix */}
      <section className="py-20 bg-white/70 dark:bg-zinc-950/60 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="rounded-full bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800/50 px-3.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Military-Grade Defense Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white mt-3">
              Every Dimension of Anti-Cheating Covered
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Proctorly implements active hardware, browser, and AI heuristics
              to guarantee absolute academic integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Fullscreen */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 hover:border-indigo-400 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Maximize className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                True Fullscreen Lock
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Browser is locked into fullscreen. Exiting triggers an emergency
                alarm, logs a violation, and starts a 10s auto-disqualification
                countdown.
              </p>
            </div>

            {/* 2. Tab Switch */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 hover:border-rose-400 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Tab Switch & Dual-Screen Guard
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tracks Page Visibility and window blur. Moving to another
                window, browser tab, or second display records an immediate
                security strike.
              </p>
            </div>

            {/* 3. Clipboard & DevTools */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 hover:border-amber-400 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Copy className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Clipboard & Shortcut Blocker
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Copy, cut, and paste are strictly intercepted. F12, DevTools
                shortcuts, PrintScreen, and right-click context menus are
                completely neutralized.
              </p>
            </div>

            {/* 4. AI Face Tracking */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 hover:border-emerald-400 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                AI Face & Presence Tracking
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Live webcam analysis continuously verifies single-candidate
                presence. Detects candidate looking away, covering the camera,
                or multiple people in frame.
              </p>
            </div>

            {/* 5. Audio Decibels */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 hover:border-cyan-400 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Audio & Speech Decibel Meter
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Web Audio API monitors ambient decibels in real time, detecting
                whispering, room voices, or background coaching audio spikes.
              </p>
            </div>

            {/* 6. Dynamic Watermark */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 hover:border-purple-400 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Forensic Anti-Leak Watermark
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                A semi-transparent diagonal watermark containing candidate name,
                ID, and timestamp overlays the entire exam to prevent phone
                photos or screenshot leaks.
              </p>
            </div>

            {/* 7. Auto Disqualification */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 hover:border-rose-400 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Auto-Disqualification Limit
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Exceeding the specified strike threshold automatically
                terminates the test session and flags it for academic
                dishonesty.
              </p>
            </div>

            {/* 8. Forensic Audit Certificate */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 hover:border-teal-400 dark:hover:border-zinc-700 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                Integrity Rating & Audit Log
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Generates a timestamped chronological audit trail of all actions
                with a certified academic integrity score and printable digital
                credential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Omnichannel Sharing Suite for Professors */}
      <section className="py-20 bg-slate-50/80 dark:bg-zinc-900/40 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/50 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              Omnichannel Distribution Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white mt-3">
              Distribute Exams Anywhere in Seconds
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              The professor has access to every modern sharing channel: direct
              URL, dynamic QR code, 6-character PIN, printable test slips, and
              LMS embeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Direct Link */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 flex flex-col justify-between shadow-lg">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <LinkIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Direct Link & Custom Slugs
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Generate clean URLs (e.g.{" "}
                  <code className="text-indigo-600 dark:text-indigo-300 font-mono">
                    /exam/cs350-midterm
                  </code>
                  ) with one-click copy and built-in credentials.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-500">
                1-Click Copy • Google Classroom & Teams deep links
              </div>
            </div>

            {/* 2. Dynamic QR */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 flex flex-col justify-between shadow-lg">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  High-Res Dynamic QR Codes
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Project on hall screens or download PNGs. Students scan on
                  their devices to launch the secure exam check-in without
                  typing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-500">
                Download PNG • Mobile Fast-Scan
              </div>
            </div>

            {/* 3. PIN & Desk Vouchers */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 flex flex-col justify-between shadow-lg">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Printer className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  PINs & Printable Desk Vouchers
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Unique 6-character PIN (e.g.{" "}
                  <code className="text-amber-600 dark:text-amber-300 font-mono">
                    OS-8821
                  </code>
                  ) plus one-click printable admission tickets with
                  instructions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-500">
                Print Vouchers • Randomized PIN Generator
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Comparison Matrix (Traditional vs Proctorly) */}
      <section className="py-20 bg-white/50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="rounded-full bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800/50 px-3.5 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">
              Zero-Trust Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white mt-3">
              Why Proctorly Outclasses Traditional Testing
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              A direct comparison between invasive legacy desktop software and
              Proctorly's zero-install web architecture.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <tr>
                    <th className="px-6 py-4">Capability / Defense</th>
                    <th className="px-6 py-4 text-rose-600 dark:text-rose-400">
                      Legacy Proctoring
                    </th>
                    <th className="px-6 py-4 text-emerald-600 dark:text-emerald-400">
                      Proctorly Zero-Trust
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                      Installation Requirement
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      Heavy OS drivers & kernel rootkits
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-300 font-bold">
                      100% Zero-Install (Pure Web)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                      Live Multi-Cam Grid
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      Single video playback hours later
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-300 font-bold">
                      Instant live synchronized matrix
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                      Distribution Flexibility
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      LMS-locked or custom app only
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-300 font-bold">
                      QR codes, 6-char PINs, links, desk slips
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                      Screen Leak Prevention
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      No protection against phone photos
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-300 font-bold">
                      Forensic dynamic candidate watermark
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                      Student Utilities
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      External paper (security vulnerability)
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-300 font-bold">
                      Built-in scratchpad & calculator
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                      Integrity Certification
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      Binary pass/fail without audit trail
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-300 font-bold">
                      SHA-256 hash & printable diploma slip
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-10 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-zinc-900 dark:text-white">
              Proctorly
            </span>
            <span>— Zero-Trust Online Examination & Anti-Cheat Platform</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
            <Link
              href="/"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Student Portal
            </Link>
            <Link
              href="/professor"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Professor Dashboard
            </Link>
            <Link
              href="/professor?tab=monitor"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Live Proctoring Feed
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
