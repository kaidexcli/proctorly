'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ShieldAlert, GraduationCap, Laptop, Share2, Eye, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const isProfessorRoute = pathname.startsWith('/professor');
  const isExamActive = pathname.startsWith('/exam/') && !pathname.includes('/preview');

  // If in active fullscreen exam, keep navbar minimal or hidden to maximize exam space
  if (isExamActive && pathname.includes('/room')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Proctorly</span>
              <span className="rounded-md bg-indigo-950 border border-indigo-700/50 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                AI Secure
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Zero-Trust Online Assessment Platform</p>
          </div>
        </Link>

        {/* Navigation Switcher */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Laptop className="h-4 w-4 text-emerald-400" />
            <span>Student Portal</span>
          </Link>

          <Link
            href="/professor"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              isProfessorRoute
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            <span>Professor Hub</span>
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {isProfessorRoute ? (
            <Link
              href="/professor?tab=create"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Create Exam</span>
            </Link>
          ) : (
            <Link
              href="/#join"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <span>Enter Access Code</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
