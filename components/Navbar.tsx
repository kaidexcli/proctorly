'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  GraduationCap,
  Laptop,
  PlusCircle,
  Volume2,
  VolumeX,
  HelpCircle,
  X,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';
import { useTheme } from '@/lib/themeContext';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);

  useEffect(() => {
    setIsMuted(soundEffects.getMuted());
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ muted: boolean }>;
      setIsMuted(customEvent.detail.muted);
    };
    window.addEventListener('proctorly_sound_toggled', handleToggle);
    return () => window.removeEventListener('proctorly_sound_toggled', handleToggle);
  }, []);

  const handleToggleSound = () => {
    const nextMute = soundEffects.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      soundEffects.playClick();
    }
  };

  const isProfessorRoute = pathname.startsWith('/professor');
  const isExamActive = pathname.startsWith('/exam/') && !pathname.includes('/preview');

  // If in active fullscreen exam room, keep navbar minimal or hidden
  if (isExamActive && pathname.includes('/room')) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            onClick={() => soundEffects.playClick()}
            className="flex items-center gap-3 group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 via-violet-600 to-emerald-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
              <Shield className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  Proctorly
                </span>
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 tracking-wider">
                  AI ZERO-TRUST
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Secure Online Examination & Surveillance Platform
              </p>
            </div>
          </Link>

          {/* Navigation Switcher */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              onClick={() => soundEffects.playClick()}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                pathname === '/'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <span>Student Portal</span>
            </Link>

            <Link
              href="/professor"
              onClick={() => soundEffects.playClick()}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                isProfessorRoute
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Professor Hub</span>
            </Link>
          </nav>

          {/* Action Buttons & Utilities */}
          <div className="flex items-center gap-2">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => {
                soundEffects.playClick();
                toggleTheme();
              }}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600 transition-transform rotate-0 hover:-rotate-12" />
              )}
            </button>

            {/* Audio Sound FX Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs transition-colors"
              title={isMuted ? 'Unmute UI Sound Effects' : 'Mute UI Sound Effects'}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>

            {/* Quick Architecture Guide button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setShowTourModal(true);
              }}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs transition-colors"
              title="Platform Architecture & Tour"
            >
              <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>How It Works</span>
            </button>

            {/* Primary Action Button */}
            {isProfessorRoute ? (
              <Link
                href="/professor?tab=create"
                onClick={() => soundEffects.playClick()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Create Exam</span>
              </Link>
            ) : (
              <Link
                href="/#join"
                onClick={() => soundEffects.playClick()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <span>Enter PIN</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Platform Tour Modal */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">How Proctorly Works</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Two-Sided Academic Zero-Trust Architecture</p>
                </div>
              </div>
              <button
                onClick={() => setShowTourModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              {/* Student Pillar */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  <Laptop className="h-4 w-4" />
                  <span>1. Student Examination Room</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Students access tests via 6-digit PIN, dynamic QR, or link. Before starting, the candidate undergoes hardware diagnostics (webcam framing, decibel check, fullscreen lock, and digital honor oath).
                </p>
                <div className="rounded-xl bg-white dark:bg-zinc-950 p-2.5 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono shadow-xs border border-zinc-200/50 dark:border-zinc-800">
                  <div>✓ True Fullscreen Lockout</div>
                  <div>✓ Anti-Screenshot Forensic Watermark</div>
                  <div>✓ Built-in Scratchpad & Calculator HUD</div>
                  <div>✓ Verified Cryptographic Certificate</div>
                </div>
              </div>

              {/* Professor Pillar */}
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                  <GraduationCap className="h-4 w-4" />
                  <span>2. Professor Command Hub</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Professors create custom assessments, generate omnichannel sharing materials (QR, PINs, slips, LMS embeds), and supervise candidates in a real-time surveillance grid.
                </p>
                <div className="rounded-xl bg-white dark:bg-zinc-950 p-2.5 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono shadow-xs border border-zinc-200/50 dark:border-zinc-800">
                  <div>✓ Live Webcam Feeds & Decibel Meters</div>
                  <div>✓ Real-Time Warning & Remote Intercom</div>
                  <div>✓ 1-Click +5m Time Extension Grant</div>
                  <div>✓ Chronological Forensic Audit & CSV Export</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTourModal(false)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              >
                Got It, Let's Explore
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
