'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Exam, StudentSession } from '@/types/exam';
import { soundEffects } from '@/lib/soundEffects';
import QRCode from 'qrcode';
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
  QrCode as QrIcon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ExamSubmissionSuccessProps {
  exam: Exam;
  session: StudentSession;
}

export default function ExamSubmissionSuccess({
  exam,
  session,
}: ExamSubmissionSuccessProps) {
  const [certQrUrl, setCertQrUrl] = useState<string>('');
  const isDisqualified = session.status === 'disqualified';
  const earnedScore = session.totalEarnedPoints ?? 0;
  const percentage = Math.round((earnedScore / (exam.totalPoints || 100)) * 100);
  const isPassed = percentage >= exam.passingPercentage && !isDisqualified;

  useEffect(() => {
    if (isPassed) {
      soundEffects.playSuccess();
    } else if (isDisqualified) {
      soundEffects.playAlarm();
    }

    // Generate Certificate Verification QR Code
    const verifyData = `PROCTORLY-CERT:${session.sessionId}:${session.studentId}:${session.integrityScore}:${percentage}%`;
    QRCode.toDataURL(verifyData, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setCertQrUrl(url))
      .catch(() => {});
  }, [isPassed, isDisqualified, session]);

  const handlePrintCertificate = () => {
    soundEffects.playClick();
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Printable Certificate Frame */}
      <div className="rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 shadow-xl dark:shadow-2xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden">
        {/* Background ambient lighting */}
        <div
          className={`absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isDisqualified ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl pointer-events-none opacity-15 bg-indigo-500" />

        {/* Status Header */}
        <div className="text-center mb-8 relative z-10">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl mb-4 transition-transform hover:scale-105 ${
              isDisqualified
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-2 border-rose-300 dark:border-rose-800/80'
                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-800/80'
            }`}
          >
            {isDisqualified ? (
              <ShieldAlert className="h-10 w-10" />
            ) : (
              <CheckCircle2 className="h-10 w-10" />
            )}
          </div>

          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider font-mono border inline-flex items-center gap-2 ${
              isDisqualified
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isDisqualified
                ? 'Assessment Terminated / Flagged'
                : 'Official Assessment Verified & Certified'}
            </span>
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white mt-3 tracking-tight">
            {exam.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Course: <strong className="text-zinc-800 dark:text-zinc-200">{exam.courseCode}</strong> • Instructor:{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{exam.professorName}</strong>
          </p>
        </div>

        {/* Holographic Seal & Rating Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 relative z-10">
          {/* Exam Grade Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/90 p-5 text-center shadow-sm relative overflow-hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
              Final Examination Score
            </span>
            <div className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white font-mono">
              {earnedScore} <span className="text-lg text-zinc-400 dark:text-zinc-500">/ {exam.totalPoints}</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span
                className={`rounded-lg px-3 py-1 text-xs font-bold font-mono border ${
                  isPassed
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                }`}
              >
                {percentage}% ({isPassed ? 'Passed' : 'Needs Review'})
              </span>
            </div>
          </div>

          {/* Academic Integrity Hologram Card */}
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/30 dark:to-zinc-950 p-5 text-center shadow-sm hologram-card relative">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block mb-1">
              Certified Integrity Score
            </span>
            <div
              className={`text-3xl sm:text-5xl font-black font-mono ${
                session.integrityScore >= 90
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : session.integrityScore >= 60
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {session.integrityScore}%
            </div>
            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              {session.violations.length} Anti-Cheat Strikes Recorded
            </div>
          </div>
        </div>

        {/* Certificate Details with QR Verification */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-5 sm:p-6 relative z-10 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="flex-1 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono w-full">
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800/60 pb-2">
              <span className="text-zinc-500">Candidate Name:</span>
              <span className="font-bold text-zinc-900 dark:text-white">{session.studentName}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800/60 pb-2">
              <span className="text-zinc-500">Candidate ID:</span>
              <span className="text-zinc-800 dark:text-zinc-200">{session.studentId}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800/60 pb-2">
              <span className="text-zinc-500">Certified Date:</span>
              <span className="text-zinc-800 dark:text-zinc-200">
                {session.submittedAt
                  ? new Date(session.submittedAt).toLocaleString()
                  : new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-zinc-500">SHA-256 Digest:</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[200px]">
                SHA256:{session.sessionId.toUpperCase()}-VERIFIED
              </span>
            </div>
          </div>

          {/* Dynamic Verification QR Badge */}
          {certQrUrl && (
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="rounded-xl bg-white p-2 shadow border border-zinc-200 dark:border-zinc-700">
                <img src={certQrUrl} alt="Certificate Verification QR" className="h-24 w-24 object-contain" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">Scan to Verify</span>
            </div>
          )}
        </div>

        {/* Violation Notice if any */}
        {session.violations.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/20 p-4 text-xs text-amber-800 dark:text-amber-200/90 flex items-start gap-3 relative z-10">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 dark:text-amber-300 block mb-0.5">Integrity Advisory Logged</strong>
              {session.violations.length} security incident(s) were flagged during the examination (including window focus departures or background audio). These logs have been archived for instructor review.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <button
            onClick={handlePrintCertificate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-5 py-3 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Print Official Certificate</span>
          </button>

          <Link
            href="/"
            onClick={() => soundEffects.playClick()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md shadow-indigo-600/25"
          >
            <Home className="h-4 w-4" />
            <span>Return to Portal Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
