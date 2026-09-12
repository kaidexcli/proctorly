'use client';

import React from 'react';
import Link from 'next/link';
import { Exam, StudentSession } from '@/types/exam';
import {
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Home,
  Clock,
  Award,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

interface ExamSubmissionSuccessProps {
  exam: Exam;
  session: StudentSession;
}

export default function ExamSubmissionSuccess({
  exam,
  session,
}: ExamSubmissionSuccessProps) {
  const isDisqualified = session.status === 'disqualified';
  const earnedScore = session.totalEarnedPoints ?? 0;
  const percentage = Math.round((earnedScore / (exam.totalPoints || 100)) * 100);
  const isPassed = percentage >= exam.passingPercentage;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Printable Certificate Frame */}
      <div className="rounded-3xl border-2 border-zinc-800 bg-zinc-900/90 shadow-2xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden">
        {/* Background ambient lighting */}
        <div
          className={`absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isDisqualified ? 'bg-rose-600' : 'bg-emerald-500'
          }`}
        />

        {/* Status Header */}
        <div className="text-center mb-8">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl mb-4 ${
              isDisqualified
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80 shadow-rose-900/20'
                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-emerald-900/20'
            }`}
          >
            {isDisqualified ? (
              <ShieldAlert className="h-8 w-8" />
            ) : (
              <CheckCircle2 className="h-8 w-8" />
            )}
          </div>

          <span
            className={`rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider font-mono border ${
              isDisqualified
                ? 'bg-rose-950 text-rose-300 border-rose-800'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}
          >
            {isDisqualified ? 'Assessment Terminated / Flagged' : 'Examination Successfully Submitted'}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">{exam.title}</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Course: <strong className="text-zinc-200">{exam.courseCode}</strong> • Instructor:{' '}
            <strong className="text-zinc-200">{exam.professorName}</strong>
          </p>
        </div>

        {/* Score & Integrity Rating Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Exam Grade */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
              Assessment Score
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {earnedScore} <span className="text-lg text-zinc-500">/ {exam.totalPoints}</span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  isPassed
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                }`}
              >
                {percentage}% ({isPassed ? 'Passed' : 'Needs Review'})
              </span>
            </div>
          </div>

          {/* Academic Integrity Score */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
              Academic Integrity Rating
            </span>
            <div
              className={`text-3xl sm:text-4xl font-black font-mono ${
                session.integrityScore >= 90
                  ? 'text-emerald-400'
                  : session.integrityScore >= 60
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {session.integrityScore}%
            </div>
            <div className="mt-2 text-xs text-zinc-400">
              {session.violations.length} Anti-Cheat Incidents Recorded
            </div>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 space-y-3 text-xs text-zinc-300 font-mono">
          <div className="flex justify-between border-b border-zinc-800/60 pb-2">
            <span className="text-zinc-500">Candidate Name:</span>
            <span className="font-bold text-white">{session.studentName}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/60 pb-2">
            <span className="text-zinc-500">Candidate Student ID:</span>
            <span className="text-zinc-200">{session.studentId}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/60 pb-2">
            <span className="text-zinc-500">Submission Timestamp:</span>
            <span className="text-zinc-200">
              {session.submittedAt ? new Date(session.submittedAt).toLocaleString() : new Date().toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-zinc-500">Digital Certificate Hash:</span>
            <span className="text-[10px] text-indigo-400 truncate max-w-[200px]">
              SHA256:{session.sessionId.toUpperCase()}-SECURE-VERIFIED
            </span>
          </div>
        </div>

        {/* Violation Notice if any */}
        {session.violations.length > 0 && (
          <div className="mt-6 rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-200/90 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">Integrity Advisory Logged</strong>
              {session.violations.length} suspicious event(s) were recorded during your examination (including tab changes or visual departures). These have been archived for instructor review.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handlePrintCertificate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <Printer className="h-4 w-4 text-emerald-400" />
            <span>Print Integrity Certificate</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Home className="h-4 w-4" />
            <span>Return to Portal Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
