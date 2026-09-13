'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Exam } from '@/types/exam';
import { examStore } from '@/lib/examStore';
import { soundEffects } from '@/lib/soundEffects';
import {
  Shield,
  KeyRound,
  ArrowRight,
  User,
  Mail,
  GraduationCap,
  Lock,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react';

interface ExamJoinCardProps {
  initialCode?: string;
  onExamFound?: (exam: Exam, studentDetails: { name: string; email: string; studentId: string }) => void;
}

export default function ExamJoinCard({ initialCode = '', onExamFound }: ExamJoinCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const codeFromQuery = searchParams.get('code') || initialCode;

  const [accessCode, setAccessCode] = useState(codeFromQuery);
  const [passcode, setPasscode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [matchedExam, setMatchedExam] = useState<Exam | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto verify code if provided via URL
  useEffect(() => {
    if (codeFromQuery) {
      setAccessCode(codeFromQuery);
      handleLookupExam(codeFromQuery);
    }
  }, [codeFromQuery]);

  const handleLookupExam = (code: string) => {
    setErrorMsg(null);
    if (!code.trim()) {
      setMatchedExam(null);
      return;
    }

    const exam = examStore.getExamByAccessCode(code);
    if (exam) {
      setMatchedExam(exam);
      soundEffects.playSuccess();
    } else {
      setMatchedExam(null);
      setErrorMsg('No exam found matching this access PIN. Please verify code.');
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!matchedExam) {
      handleLookupExam(accessCode);
      return;
    }

    if (!studentName.trim() || !studentId.trim() || !studentEmail.trim()) {
      setErrorMsg('Please enter your full name, student ID, and university email.');
      return;
    }

    // Check passcode if exam requires one
    if (matchedExam.sharingSettings.passcode) {
      if (passcode.trim() !== matchedExam.sharingSettings.passcode.trim()) {
        setErrorMsg('Invalid exam passcode. Please request correct passcode from your proctor.');
        return;
      }
    }

    if (onExamFound) {
      onExamFound(matchedExam, {
        name: studentName.trim(),
        email: studentEmail.trim(),
        studentId: studentId.trim(),
      });
    } else {
      // Store temp student in sessionStorage and route to exam room
      sessionStorage.setItem(
        'proctorly_candidate',
        JSON.stringify({
          name: studentName.trim(),
          email: studentEmail.trim(),
          studentId: studentId.trim(),
        })
      );
      router.push(`/exam/${matchedExam.id}`);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 shadow-xl dark:shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white dark:text-zinc-950 shadow-lg shadow-emerald-500/20 mb-3">
          <KeyRound className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Enter Exam Portal</h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Access your secured proctored test session using your instructor-provided PIN or link
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleProceed} className="space-y-4">
        {/* Step 1: Access PIN */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Exam Access Code / PIN
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. OS-8821 or BIO-4402"
                value={accessCode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setAccessCode(val);
                  if (val.length >= 6) {
                    handleLookupExam(val);
                  }
                }}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-base sm:text-lg font-mono font-bold tracking-wider text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleLookupExam(accessCode)}
              className="rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Found Exam Card Preview */}
        {matchedExam && (
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/20 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700/50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                  Exam Verified
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-1.5">{matchedExam.title}</h3>
                <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  <span>{matchedExam.courseCode}</span>
                  <span>•</span>
                  <span>{matchedExam.durationMinutes} Minutes</span>
                  <span>•</span>
                  <span>Instructor: {matchedExam.professorName}</span>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            </div>

            {/* Passcode requirement if present */}
            {matchedExam.sharingSettings.passcode && (
              <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-900/40">
                <label className="block text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Proctor Passcode Required</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter secret passcode from proctor..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Candidate Identity Information */}
        <div className="pt-2 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Candidate Identification
          </div>

          <div>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Full Name (e.g. Alex Morgan)"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <GraduationCap className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Student ID (e.g. STU-2026-9)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                placeholder="University Email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!matchedExam}
          className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3.5 text-sm font-bold text-white dark:text-zinc-950 shadow-xl shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span>Continue to Secure System Check</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Demo Fast Fill Buttons */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <span className="text-[11px] text-zinc-500 block mb-2">
            Try Demo Exams:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAccessCode('OS-8821');
                setPasscode('SYS2026');
                setStudentName('Alex Morgan');
                setStudentId('STU-99012');
                setStudentEmail('a.morgan@student.edu');
                handleLookupExam('OS-8821');
              }}
              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              OS-8821 (CS350 Midterm)
            </button>
            <button
              type="button"
              onClick={() => {
                setAccessCode('BIO-4402');
                setPasscode('');
                setStudentName('Taylor Swift');
                setStudentId('STU-88219');
                setStudentEmail('taylor@student.edu');
                handleLookupExam('BIO-4402');
              }}
              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              BIO-4402 (BIO210 Quiz)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
