'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Exam, StudentSession, ViolationType, ViolationSeverity, Question } from '@/types/exam';
import { examStore, SyncMessage } from '@/lib/examStore';
import { AntiCheatMonitor } from '@/lib/antiCheatService';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Maximize,
  Volume2,
  Video,
  UserCheck,
  Send,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SecureExamRoomProps {
  exam: Exam;
  session: StudentSession;
  mediaStream: MediaStream | null;
  onExamSubmitted: (finalSession: StudentSession) => void;
}

export default function SecureExamRoom({
  exam,
  session: initialSession,
  mediaStream,
  onExamSubmitted,
}: SecureExamRoomProps) {
  const [session, setSession] = useState<StudentSession>(initialSession);
  const [currentIndex, setCurrentIndex] = useState<number>(session.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(session.answers || {});
  const [flagged, setFlagged] = useState<string[]>(session.flaggedQuestions || []);
  const [timeRemaining, setTimeRemaining] = useState<number>(session.timeRemainingSeconds);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [fullscreenGracePeriod, setFullscreenGracePeriod] = useState<number>(10);
  const [showExitWarningModal, setShowExitWarningModal] = useState<boolean>(false);
  const [proctorNotification, setProctorNotification] = useState<string | null>(null);
  const [audioDb, setAudioDb] = useState<number>(20);
  const [faceStatus, setFaceStatus] = useState<'normal' | 'away' | 'multiple' | 'missing'>('normal');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const antiCheatRef = useRef<AntiCheatMonitor | null>(null);

  const questions = exam.questions;
  const currentQ: Question = questions[currentIndex];

  // Request true fullscreen on mount
  useEffect(() => {
    async function enterFullscreen() {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.warn('Initial fullscreen request caught:', err);
      }
    }
    enterFullscreen();
  }, []);

  // Connect video stream to PIP element
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((e) => console.log('PIP Video play caught', e));
    }
  }, [mediaStream]);

  // Initialize Anti-Cheat Monitoring Service
  useEffect(() => {
    const monitor = new AntiCheatMonitor(exam.securitySettings, {
      onViolation: (type: ViolationType, severity: ViolationSeverity, description: string) => {
        handleLogViolation(type, severity, description);
      },
      onFullscreenChange: (fs: boolean) => {
        setIsFullscreen(fs);
        if (!fs) {
          setShowExitWarningModal(true);
          setFullscreenGracePeriod(10);
        } else {
          setShowExitWarningModal(false);
        }
      },
      onAudioLevel: (db: number) => {
        setAudioDb(db);
      },
      onFaceStatusChange: (status) => {
        setFaceStatus(status);
      },
    });

    antiCheatRef.current = monitor;
    monitor.startMonitoring(mediaStream);

    return () => {
      monitor.stopMonitoring();
    };
  }, [exam.securitySettings, mediaStream]);

  // Handle Fullscreen Exit Countdown Grace Period
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (showExitWarningModal && fullscreenGracePeriod > 0) {
      timer = setInterval(() => {
        setFullscreenGracePeriod((prev) => {
          if (prev <= 1) {
            clearInterval(timer!);
            // Grace period expired: Log critical violation
            handleLogViolation(
              'fullscreen_exit',
              'critical',
              'Failed to return to fullscreen mode within 10-second security grace period'
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showExitWarningModal, fullscreenGracePeriod]);

  // Countdown timer for exam duration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam('time_expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cross-tab sync for proctor commands (warnings, time extensions, force submit)
  useEffect(() => {
    const unsubscribe = examStore.subscribe((msg: SyncMessage) => {
      if ('sessionId' in msg && msg.sessionId === session.sessionId) {
        if (msg.type === 'PROCTOR_WARNING') {
          setProctorNotification(msg.message);
          setTimeout(() => setProctorNotification(null), 8000);
        } else if (msg.type === 'PROCTOR_EXTEND_TIME') {
          setTimeRemaining((t) => t + msg.extraSeconds);
          setProctorNotification(`⏱️ Proctor granted an additional 5 minutes to your test time.`);
          setTimeout(() => setProctorNotification(null), 6000);
        } else if (msg.type === 'PROCTOR_FORCE_SUBMIT') {
          alert(`Your exam was remotely terminated by the proctor: ${msg.reason}`);
          handleSubmitExam('disqualified');
        }
      }
    });

    return () => unsubscribe();
  }, [session.sessionId]);

  // Helper to log violation into examStore
  const handleLogViolation = (type: ViolationType, severity: ViolationSeverity, description: string) => {
    const result = examStore.addViolation(session.sessionId, {
      type,
      severity,
      description,
    });

    if (result.session) {
      setSession(result.session);
      if (result.autoSubmitted) {
        alert(
          `Security Notice: You have exceeded the maximum allowed violations (${exam.securitySettings.maxViolationsAllowed}). Your exam has been auto-submitted and flagged for academic dishonesty.`
        );
        onExamSubmitted(result.session);
      }
    }
  };

  const handleReturnToFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setShowExitWarningModal(false);
    } catch (e) {
      console.warn('Re-entering fullscreen failed', e);
      setIsFullscreen(true);
      setShowExitWarningModal(false);
    }
  };

  const handleAnswerChange = (qId: string, value: string | string[]) => {
    const updated = { ...answers, [qId]: value };
    setAnswers(updated);

    // Save session in store
    const updatedSession: StudentSession = {
      ...session,
      answers: updated,
      currentQuestionIndex: currentIndex,
      timeRemainingSeconds: timeRemaining,
      lastHeartbeat: new Date().toISOString(),
    };
    setSession(updatedSession);
    examStore.saveSession(updatedSession);
  };

  const toggleFlag = (qId: string) => {
    const newFlagged = flagged.includes(qId) ? flagged.filter((id) => id !== qId) : [...flagged, qId];
    setFlagged(newFlagged);

    const updatedSession: StudentSession = {
      ...session,
      flaggedQuestions: newFlagged,
    };
    setSession(updatedSession);
    examStore.saveSession(updatedSession);
  };

  const handleSubmitExam = (finalStatus: StudentSession['status'] = 'submitted') => {
    if (antiCheatRef.current) {
      antiCheatRef.current.stopMonitoring();
    }

    // Exit fullscreen cleanly
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    // Calculate score
    let earnedPoints = 0;
    questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (q.type === 'multiple_choice') {
        if (studentAns === q.correctAnswers[0]) earnedPoints += q.points;
      } else if (q.type === 'multiple_response') {
        const studentArr = Array.isArray(studentAns) ? studentAns : [];
        const isCorrect =
          studentArr.length === q.correctAnswers.length &&
          studentArr.every((a) => q.correctAnswers.includes(a));
        if (isCorrect) earnedPoints += q.points;
      } else if (q.type === 'short_answer') {
        const studentStr = typeof studentAns === 'string' ? studentAns.trim().toLowerCase() : '';
        if (q.correctAnswers.some((ans) => ans.toLowerCase() === studentStr)) {
          earnedPoints += q.points;
        }
      } else {
        // Essay auto-provisional points
        if (typeof studentAns === 'string' && studentAns.length > 20) {
          earnedPoints += Math.round(q.points * 0.85);
        }
      }
    });

    const finalSession: StudentSession = {
      ...session,
      status: finalStatus,
      submittedAt: new Date().toISOString(),
      timeRemainingSeconds: timeRemaining,
      answers,
      score: earnedPoints,
      totalEarnedPoints: earnedPoints,
    };

    examStore.saveSession(finalSession);
    onExamSubmitted(finalSession);
  };

  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isTimeCritical = timeRemaining < 300; // < 5 mins

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col select-none">
      {/* Dynamic Semi-Transparent Anti-Screenshot Watermark */}
      <div className="pointer-events-none fixed inset-0 z-10 flex flex-wrap items-center justify-around opacity-[0.035] overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="transform -rotate-25 p-8 text-xs font-mono font-black text-white whitespace-nowrap">
            {session.studentName} • {session.studentId} • {session.sessionId}
          </div>
        ))}
      </div>

      {/* Top Secured Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white">{exam.title}</h1>
              <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-700/50">
                {exam.courseCode}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Candidate: {session.studentName} ({session.studentId})
            </p>
          </div>
        </div>

        {/* Center: Timer Clock */}
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono font-bold text-sm sm:text-base border shadow-md transition-colors ${
            isTimeCritical
              ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse'
              : 'bg-zinc-950 text-white border-zinc-800'
          }`}
        >
          <Clock className={`h-4 w-4 ${isTimeCritical ? 'text-rose-400' : 'text-indigo-400'}`} />
          <span>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>

        {/* Right: Integrity Pill & Finish Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono">
            <span className="text-zinc-400">Security Score:</span>
            <span
              className={`font-bold ${
                session.integrityScore >= 90
                  ? 'text-emerald-400'
                  : session.integrityScore >= 60
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {session.integrityScore}%
            </span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Floating Proctor Broadcast Warning Toast */}
      {proctorNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-top duration-200">
          <div className="rounded-2xl border-2 border-amber-500 bg-amber-950 p-4 text-white shadow-2xl flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block text-sm font-bold text-amber-300">
                PROCTOR DIRECTIVE / ALERT
              </strong>
              <p className="text-xs text-amber-100 mt-1">{proctorNotification}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Examination Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 relative z-20">
        {/* Left Side: Question Content */}
        <main className="flex-1 flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur shadow-xl">
          <div>
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-950 border border-indigo-700/50 px-3 py-1 text-xs font-bold text-indigo-300 font-mono">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-zinc-400 font-medium">({currentQ.points} Points)</span>
              </div>

              <button
                onClick={() => toggleFlag(currentQ.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  flagged.includes(currentQ.id)
                    ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{flagged.includes(currentQ.id) ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>

            {/* Prompt */}
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed mb-6">
              {currentQ.prompt}
            </h2>

            {/* Answer Controls Based on Question Type */}
            <div className="space-y-3">
              {/* Multiple Choice (Single) */}
              {currentQ.type === 'multiple_choice' && (
                <div className="space-y-2.5">
                  {currentQ.options?.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3.5 rounded-2xl border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`answer-${currentQ.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(currentQ.id, opt.id)}
                          className="h-4 w-4 accent-indigo-500"
                        />
                        <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Multiple Response (Checkboxes) */}
              {currentQ.type === 'multiple_response' && (
                <div className="space-y-2.5">
                  <span className="text-xs text-zinc-400 font-semibold block mb-1">
                    (Select all choices that apply)
                  </span>
                  {currentQ.options?.map((opt) => {
                    const currentArr = Array.isArray(answers[currentQ.id])
                      ? (answers[currentQ.id] as string[])
                      : [];
                    const isSelected = currentArr.includes(opt.id);

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3.5 rounded-2xl border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => {
                            const next = isSelected
                              ? currentArr.filter((id) => id !== opt.id)
                              : [...currentArr, opt.id];
                            handleAnswerChange(currentQ.id, next);
                          }}
                          className="h-4 w-4 rounded accent-indigo-500"
                        />
                        <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {currentQ.type === 'short_answer' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Enter concise text response:
                  </label>
                  <input
                    type="text"
                    placeholder="Type your answer here..."
                    value={(answers[currentQ.id] as string) || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-4 text-sm sm:text-base text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Essay / Long Form */}
              {currentQ.type === 'essay' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Essay Response Workspace:
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Draft your detailed explanation..."
                    value={(answers[currentQ.id] as string) || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-4 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="pt-8 flex items-center justify-between border-t border-zinc-800 mt-8">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-zinc-500 font-mono">
              Answered: {answeredCount} / {questions.length}
            </span>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Review & Submit</span>
              </button>
            )}
          </div>
        </main>

        {/* Right Side: Proctor HUD & Question Navigator */}
        <aside className="w-full lg:w-80 space-y-6">
          {/* Live Proctoring Webcam PIP Feed */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Proctor Stream Active</span>
              </span>
              <span className="font-mono text-[10px] text-zinc-500">LIVE</span>
            </div>

            <div className="relative aspect-video rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
              />

              {/* Simulated Face Bounding Frame */}
              <div
                className={`pointer-events-none relative z-10 rounded-lg border-2 p-6 transition-colors ${
                  faceStatus === 'normal'
                    ? 'border-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                    : 'border-rose-400/80 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                }`}
              >
                <UserCheck className="h-6 w-6 text-emerald-300 opacity-60" />
              </div>

              {/* Status pill overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded bg-black/80 px-2 py-1 text-[10px] font-mono text-zinc-300 backdrop-blur-sm">
                <span className="flex items-center gap-1">
                  <Volume2 className="h-3 w-3 text-cyan-400" />
                  <span>{audioDb} dB</span>
                </span>
                <span className={faceStatus === 'normal' ? 'text-emerald-400' : 'text-rose-400'}>
                  {faceStatus === 'normal' ? 'Face Verified' : 'Alert: Shift'}
                </span>
              </div>
            </div>

            {/* Violation & Strike Status Counter */}
            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Security Strikes:</span>
              <span
                className={`font-mono font-bold ${
                  session.violations.length >= 3
                    ? 'text-rose-400'
                    : session.violations.length > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {session.violations.length} / {exam.securitySettings.maxViolationsAllowed} Allowed
              </span>
            </div>
          </div>

          {/* Question Grid Navigator */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Question Navigator
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                const isCurrent = idx === currentIndex;
                const isFlagged = flagged.includes(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold font-mono transition-all ${
                      isCurrent
                        ? 'ring-2 ring-indigo-500 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap gap-3 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>Current</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Critical Fullscreen Loss Alarm & Warning Modal */}
      {showExitWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-150">
          <div className="w-full max-w-lg rounded-3xl border-2 border-rose-600 bg-zinc-950 p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-950 text-rose-400 border border-rose-800 animate-pulse">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                SECURITY BREACH: FULLSCREEN EXITED
              </h3>
              <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                Leaving fullscreen mode is a strict violation of testing integrity. You must immediately return to full-screen view.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-900/60 bg-rose-950/40 p-4">
              <span className="text-[11px] uppercase tracking-wider text-rose-400 font-bold block mb-1">
                Auto-Termination Grace Countdown
              </span>
              <div className="text-4xl font-mono font-black text-rose-300">
                {fullscreenGracePeriod}s
              </div>
            </div>

            <button
              onClick={handleReturnToFullscreen}
              className="w-full rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-500 shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Maximize className="h-4 w-4" />
              <span>Re-enter Fullscreen Immediately</span>
            </button>
          </div>
        </div>
      )}

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-150">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Submit Examination?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                You have answered <strong className="text-white">{answeredCount}</strong> of{' '}
                <strong className="text-white">{questions.length}</strong> questions. Once submitted, you cannot change your answers.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                Return to Test
              </button>

              <button
                onClick={() => handleSubmitExam('submitted')}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-colors"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
