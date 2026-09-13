"use client";

import { examStore, SyncMessage } from "@/lib/examStore";
import { soundEffects } from "@/lib/soundEffects";
import { Exam, StudentSession } from "@/types/exam";
import {
  AlertTriangle,
  Crosshair,
  LayoutGrid,
  Megaphone,
  PlusCircle,
  Radio,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Volume2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface LiveProctoringDashboardProps {
  examId?: string;
  exams: Exam[];
}

export default function LiveProctoringDashboard({
  examId: initialExamId,
  exams,
}: LiveProctoringDashboardProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId || (exams.length > 0 ? exams[0].id : ""),
  );
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [filter, setFilter] = useState<
    "all" | "flagged" | "in_progress" | "submitted"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "spotlight" | "table">(
    "grid",
  );
  const [visualFilter, setVisualFilter] = useState<
    "standard" | "matrix" | "mesh"
  >("standard");
  const [searchQuery, setSearchQuery] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [activeStudentIdForWarning, setActiveStudentIdForWarning] = useState<
    string | null
  >(null);
  const [lastEvent, setLastEvent] = useState<string>(
    "Live proctoring connection established",
  );
  const [isCohortBroadcastOpen, setIsCohortBroadcastOpen] = useState(false);
  const [cohortBroadcastMsg, setCohortBroadcastMsg] = useState("");
  const [broadcastConfirmed, setBroadcastConfirmed] = useState(false);

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const loadSessions = () => {
    if (selectedExamId) {
      const data = examStore.getSessions(selectedExamId);
      setSessions(data);
    }
  };

  useEffect(() => {
    loadSessions();

    const unsubscribe = examStore.subscribe((msg: SyncMessage) => {
      loadSessions();
      if (msg.type === "VIOLATION_ADDED") {
        soundEffects.playSecurityAlert();
        const student = sessions.find((s) => s.sessionId === msg.sessionId);
        setLastEvent(
          `⚠️ Violation recorded for ${student?.studentName || "Student"}: ${msg.violation.description}`,
        );
      } else if (msg.type === "SESSION_JOINED") {
        soundEffects.playRadarPing();
        setLastEvent(`🟢 New candidate joined: ${msg.session.studentName}`);
      }
    });

    return () => unsubscribe();
  }, [selectedExamId]);

  // Periodic heartbeat / decibel simulation for inactive mock students
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.status === "in_progress") {
            const randomFluc = Math.max(
              12,
              Math.min(85, s.audioDecibels + (Math.random() * 8 - 4)),
            );
            return {
              ...s,
              audioDecibels: Math.round(randomFluc),
              timeRemainingSeconds: Math.max(0, s.timeRemainingSeconds - 2),
            };
          }
          return s;
        }),
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "flagged"
          ? s.status === "flagged" || s.violations.length > 0
          : s.status === filter;

    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalActive = sessions.filter((s) => s.status === "in_progress").length;
  const totalFlagged = sessions.filter(
    (s) => s.status === "flagged" || s.violations.length >= 2,
  ).length;
  const totalDisqualified = sessions.filter(
    (s) => s.status === "disqualified",
  ).length;
  const avgIntegrity = sessions.length
    ? Math.round(
        sessions.reduce((acc, s) => acc + s.integrityScore, 0) /
          sessions.length,
      )
    : 100;

  // Find lowest integrity candidate for spotlight mode
  const spotlightCandidate = [...sessions].sort(
    (a, b) => a.integrityScore - b.integrityScore,
  )[0];

  const handleSendWarning = (sessionId: string) => {
    if (!warningMessage.trim()) return;
    soundEffects.playSuccess();
    examStore.sendProctorWarning(sessionId, warningMessage.trim());
    setWarningMessage("");
    setActiveStudentIdForWarning(null);
    loadSessions();
  };

  const handleBroadcastToCohort = () => {
    if (!cohortBroadcastMsg.trim()) return;
    soundEffects.playSuccess();
    // Broadcast to all active sessions of this exam
    sessions.forEach((s) => {
      if (s.status === "in_progress") {
        examStore.sendProctorWarning(
          s.sessionId,
          `[ANNOUNCEMENT FROM PROCTOR]: ${cohortBroadcastMsg.trim()}`,
        );
      }
    });
    setBroadcastConfirmed(true);
    setTimeout(() => {
      setBroadcastConfirmed(false);
      setIsCohortBroadcastOpen(false);
      setCohortBroadcastMsg("");
    }, 1800);
    loadSessions();
  };

  const handleForceSubmit = (sessionId: string, studentName: string) => {
    soundEffects.playSecurityAlert();
    if (
      confirm(
        `Are you sure you want to terminate & disqualify ${studentName}'s exam?`,
      )
    ) {
      examStore.forceSubmitSession(
        sessionId,
        "Academic integrity violation threshold exceeded",
      );
      loadSessions();
    }
  };

  const handleExtendTime = (sessionId: string) => {
    soundEffects.playSuccess();
    examStore.extendTime(sessionId, 300); // +5 minutes
    loadSessions();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Exam Selector & Broadcast Intercom */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Surveillance Radar Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            {selectedExam?.title || "Online Examination"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
            Course: {selectedExam?.courseCode} • Access PIN:{" "}
            <span className="text-indigo-600 dark:text-indigo-300 font-bold">
              {selectedExam?.accessCode}
            </span>
          </p>
        </div>

        {/* Controls: Exam Picker & Cohort Broadcast */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => {
              soundEffects.playClick();
              setSelectedExamId(e.target.value);
            }}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none shadow-sm"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.courseCode} - {e.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              soundEffects.playClick();
              setIsCohortBroadcastOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-600 to-orange-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-amber-600/20 hover:from-amber-500 hover:to-orange-400 transition-all active:scale-95"
          >
            <Megaphone className="h-4 w-4" />
            <span>Broadcast Announcement</span>
          </button>
        </div>
      </div>

      {/* Cohort Broadcast Intercom Modal */}
      {isCohortBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-full max-w-lg rounded-3xl border-2 border-amber-500/60 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <Megaphone className="h-5 w-5" />
                <span>Intercom Broadcast to All Active Candidates</span>
              </div>
              <button
                onClick={() => setIsCohortBroadcastOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              This notice will immediately flash onto the test view of all{" "}
              <strong className="text-zinc-900 dark:text-white">
                {totalActive}
              </strong>{" "}
              currently active candidates.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Please note: 10 minutes remaining. Verify all flagged questions before submitting."
              value={cohortBroadcastMsg}
              onChange={(e) => setCohortBroadcastMsg(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-xs sm:text-sm text-zinc-900 dark:text-white focus:border-amber-500 focus:outline-none leading-relaxed"
            />

            {/* Quick Canned Broadcasts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "10 minutes remaining in assessment",
                "5-minute warning: Review your answers",
                "Ensure webcam is facing you directly",
                "Technical check: All systems operational",
              ].map((canned) => (
                <button
                  key={canned}
                  onClick={() => setCohortBroadcastMsg(canned)}
                  className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
                >
                  {canned}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
              <button
                onClick={() => setIsCohortBroadcastOpen(false)}
                className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcastToCohort}
                disabled={!cohortBroadcastMsg.trim() || broadcastConfirmed}
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-500 shadow-lg shadow-amber-600/25 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>
                  {broadcastConfirmed
                    ? "Broadcast Dispatched!"
                    : "Transmit to All"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Active Candidates
            </span>
            <Radio className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-2">
            {totalActive}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Streaming video/audio
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Flagged Risk
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {totalFlagged}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Under close surveillance
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Disqualified
            </span>
            <ShieldAlert className="h-4 w-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {totalDisqualified}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Auto or manually locked
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 shadow-sm dark:shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Cohort Integrity
            </span>
            <ShieldCheck className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-300 mt-2">
            {avgIntegrity}%
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Overall security rating
          </div>
        </div>
      </div>

      {/* Live Event Ticker */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950 px-4 py-2.5 flex items-center gap-3 text-xs shadow-sm dark:shadow-inner">
        <span className="rounded-md bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
          EVENT STREAM
        </span>
        <span className="text-zinc-700 dark:text-zinc-300 font-mono truncate">
          {lastEvent}
        </span>
      </div>

      {/* View Switchers, Filter, and Visual Styles Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => {
              soundEffects.playClick();
              setFilter("all");
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            All ({sessions.length})
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setFilter("flagged");
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === "flagged"
                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Flagged Risk ({totalFlagged})
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setFilter("in_progress");
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === "in_progress"
                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Active ({totalActive})
          </button>
        </div>

        {/* View Mode & Camera Filter Toggles */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Visual Camera Filter (Standard vs Matrix Thermal vs Biometric Mesh) */}
          <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 gap-1 shadow-sm">
            <button
              onClick={() => {
                soundEffects.playClick();
                setVisualFilter("standard");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                visualFilter === "standard"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setVisualFilter("matrix");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                visualFilter === "matrix"
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              Thermal IR
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setVisualFilter("mesh");
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                visualFilter === "mesh"
                  ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              AI Mesh
            </button>
          </div>

          {/* Layout Mode (Grid vs Spotlight vs Table) */}
          <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 gap-1 shadow-sm">
            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode("grid");
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode("spotlight");
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "spotlight"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
              title="Spotlight Mode (Highest Risk Candidate)"
            >
              <Crosshair className="h-4 w-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: SPOTLIGHT MODE */}
      {viewMode === "spotlight" && spotlightCandidate && (
        <div className="rounded-3xl border-2 border-indigo-500/50 bg-linear-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/30 dark:via-zinc-950 dark:to-zinc-950 p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800/60 px-3 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Spotlight: Highest
                Risk Candidate
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {spotlightCandidate.studentName} ({spotlightCandidate.studentId}
                )
              </span>
            </div>
            <button
              onClick={() => setViewMode("grid")}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
            >
              Back to Grid View
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="relative aspect-video rounded-2xl bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-tr from-zinc-950 via-zinc-900 to-indigo-950/40 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full border-2 border-rose-500 bg-rose-950/20 flex items-center justify-center">
                    <UserCheck className="h-16 w-16 text-rose-400" />
                  </div>
                </div>

                {/* Laser scan line */}
                <div className="absolute inset-x-0 h-0.5 bg-linear-to-r from-transparent via-rose-500 to-transparent pointer-events-none z-20 animate-scan-down" />

                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-black/80 px-3 py-1 text-xs font-mono text-white">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  <span>SPOTLIGHT SURVEILLANCE FEED</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-black/85 backdrop-blur-md px-4 py-2 text-xs font-mono text-zinc-300">
                  <span>Volume: {spotlightCandidate.audioDecibels} dB</span>
                  <span className="text-rose-400 font-bold">
                    Face Status: {spotlightCandidate.faceStatus.toUpperCase()}
                  </span>
                  <span>Strikes: {spotlightCandidate.violations.length}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                  Candidate Integrity Rating
                </span>
                <div className="text-4xl font-black font-mono text-rose-600 dark:text-rose-400">
                  {spotlightCandidate.integrityScore}%
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {spotlightCandidate.violations.length} incidents logged
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleExtendTime(spotlightCandidate.sessionId)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 shadow-sm"
                >
                  <PlusCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Grant +5 Minutes Extension</span>
                </button>

                <button
                  onClick={() =>
                    handleForceSubmit(
                      spotlightCandidate.sessionId,
                      spotlightCandidate.studentName,
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow-md shadow-rose-600/20"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Terminate & Disqualify Candidate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: REAL-TIME GRID OF CANDIDATE CARDS */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSessions.map((student) => {
            const isFlagged =
              student.violations.length > 0 || student.status === "flagged";
            const isDisqualified = student.status === "disqualified";

            return (
              <div
                key={student.sessionId}
                className={`rounded-3xl border shadow-lg overflow-hidden flex flex-col justify-between transition-all bg-white dark:bg-zinc-900/90 ${
                  isDisqualified
                    ? "border-rose-300 dark:border-rose-800/80 bg-rose-50/40 dark:bg-rose-950/10"
                    : isFlagged
                      ? "border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/10"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-950/60">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isDisqualified
                          ? "bg-rose-500"
                          : isFlagged
                            ? "bg-amber-400 animate-pulse"
                            : "bg-emerald-400"
                      }`}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                        {student.studentName}
                      </h4>
                      <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        {student.studentId}
                      </span>
                    </div>
                  </div>

                  {/* Integrity Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                      student.integrityScore >= 90
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                        : student.integrityScore >= 65
                          ? "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                          : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
                    }`}
                  >
                    {student.integrityScore}%
                  </div>
                </div>

                {/* Video Monitor Stream Frame with Visual Filters */}
                <div
                  className={`relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden transition-all ${
                    visualFilter === "matrix"
                      ? "contrast-125 saturate-200 hue-rotate-90"
                      : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-linear-to-tr from-zinc-950 via-zinc-900 to-indigo-950/30 flex items-center justify-center">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`h-20 w-20 rounded-full border-2 flex items-center justify-center ${
                          student.faceStatus === "away"
                            ? "border-amber-400 bg-amber-950/20 text-amber-300"
                            : student.faceStatus === "multiple"
                              ? "border-rose-500 bg-rose-950/20 text-rose-400"
                              : "border-emerald-500/50 bg-indigo-950/30 text-indigo-300"
                        }`}
                      >
                        <UserCheck className="h-10 w-10" />
                      </div>
                    </div>
                  </div>

                  {/* Biometric Mesh Overlay */}
                  {visualFilter === "mesh" && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                      <div className="h-28 w-28 rounded-xl border border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center justify-center">
                        <div className="absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-emerald-300" />
                        <div className="absolute -top-1 -right-1 h-2 w-2 border-t-2 border-r-2 border-emerald-300" />
                        <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-emerald-300" />
                        <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-emerald-300" />
                      </div>
                    </div>
                  )}

                  {/* Live Overlays */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>REC</span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 rounded bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                    {Math.floor(student.timeRemainingSeconds / 60)}m{" "}
                    {student.timeRemainingSeconds % 60}s
                  </div>

                  {/* Audio meter */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded bg-black/70 backdrop-blur-sm px-2 py-1 text-[10px] font-mono text-zinc-300">
                    <Volume2
                      className={`h-3 w-3 ${
                        student.audioDecibels > 60
                          ? "text-rose-400 animate-pulse"
                          : "text-emerald-400"
                      }`}
                    />
                    <span>{student.audioDecibels} dB</span>
                    <div className="w-12 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          student.audioDecibels > 60
                            ? "bg-rose-500"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${student.audioDecibels}%` }}
                      />
                    </div>
                  </div>

                  {/* Face Status Tag */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-mono ${
                        student.faceStatus === "normal"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-700/50"
                          : student.faceStatus === "away"
                            ? "bg-amber-950 text-amber-300 border border-amber-700/50"
                            : "bg-rose-950 text-rose-300 border border-rose-700/50"
                      }`}
                    >
                      {student.faceStatus === "normal"
                        ? "Face Verified"
                        : student.faceStatus === "away"
                          ? "Looking Away"
                          : "Multi-Face Alert"}
                    </span>
                  </div>
                </div>

                {/* Violations Audit Trail Summary */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Violations Recorded:
                    </span>
                    <span
                      className={`font-bold font-mono ${
                        student.violations.length > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {student.violations.length} violations
                    </span>
                  </div>

                  {student.violations.length > 0 ? (
                    <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                      {student.violations.slice(0, 3).map((v) => (
                        <div
                          key={v.id}
                          className="rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2 text-[11px] leading-tight flex items-start gap-2"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1 text-zinc-700 dark:text-zinc-300">
                            <span className="font-semibold text-zinc-900 dark:text-white block capitalize">
                              {v.type.replace("_", " ")}
                            </span>
                            <span className="text-zinc-500 dark:text-zinc-400 text-[10px] line-clamp-1">
                              {v.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/60 p-2 text-[11px] text-zinc-500 dark:text-zinc-400 text-center flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>No security breaches detected</span>
                    </div>
                  )}

                  {/* Proctor Warning Input Drawer */}
                  {activeStudentIdForWarning === student.sessionId && (
                    <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Direct message to candidate..."
                          value={warningMessage}
                          onChange={(e) => setWarningMessage(e.target.value)}
                          className="flex-1 rounded-lg border border-amber-500 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none shadow-sm"
                        />
                        <button
                          onClick={() => handleSendWarning(student.sessionId)}
                          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 shadow-sm"
                        >
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          "Face camera directly",
                          "Silence room audio",
                          "Keep hands visible on desk",
                          "Final warning before auto-disqualification",
                        ].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setWarningMessage(preset)}
                            className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Proctor Actions Footer */}
                <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveStudentIdForWarning(
                        activeStudentIdForWarning === student.sessionId
                          ? null
                          : student.sessionId,
                      );
                    }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition-colors"
                  >
                    <Send className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                    <span>Direct Warn</span>
                  </button>

                  <button
                    onClick={() => handleExtendTime(student.sessionId)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition-colors"
                    title="Add 5 minutes to student exam clock"
                  >
                    <PlusCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    <span>+5m</span>
                  </button>

                  <button
                    onClick={() =>
                      handleForceSubmit(student.sessionId, student.studentName)
                    }
                    disabled={isDisqualified}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-40 shadow-sm transition-colors"
                    title="Immediately terminate and disqualify candidate"
                  >
                    <XCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                    <span>Disqualify</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
