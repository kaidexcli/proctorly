'use client';

import React, { useState, useEffect } from 'react';
import { Exam, StudentSession, ViolationEvent } from '@/types/exam';
import { examStore, SyncMessage } from '@/lib/examStore';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Video,
  Mic,
  AlertTriangle,
  UserCheck,
  UserX,
  Volume2,
  Clock,
  Send,
  PlusCircle,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Radio,
  Sparkles,
} from 'lucide-react';

interface LiveProctoringDashboardProps {
  examId?: string;
  exams: Exam[];
}

export default function LiveProctoringDashboard({
  examId: initialExamId,
  exams,
}: LiveProctoringDashboardProps) {
  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId || (exams.length > 0 ? exams[0].id : '')
  );
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'in_progress' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [activeStudentIdForWarning, setActiveStudentIdForWarning] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string>('Live proctoring connection established');

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
      if (msg.type === 'VIOLATION_ADDED') {
        const student = sessions.find((s) => s.sessionId === msg.sessionId);
        setLastEvent(
          `⚠️ Violation recorded for ${student?.studentName || 'Student'}: ${msg.violation.description}`
        );
      } else if (msg.type === 'SESSION_JOINED') {
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
          if (s.status === 'in_progress') {
            // slight random fluctuation in decibels for realistic monitor
            const randomFluc = Math.max(12, Math.min(85, s.audioDecibels + (Math.random() * 8 - 4)));
            return {
              ...s,
              audioDecibels: Math.round(randomFluc),
              timeRemainingSeconds: Math.max(0, s.timeRemainingSeconds - 2),
            };
          }
          return s;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'flagged'
        ? s.status === 'flagged' || s.violations.length > 0
        : s.status === filter;

    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalActive = sessions.filter((s) => s.status === 'in_progress').length;
  const totalFlagged = sessions.filter(
    (s) => s.status === 'flagged' || s.violations.length >= 2
  ).length;
  const totalDisqualified = sessions.filter((s) => s.status === 'disqualified').length;
  const avgIntegrity = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + s.integrityScore, 0) / sessions.length)
    : 100;

  const handleSendWarning = (sessionId: string) => {
    if (!warningMessage.trim()) return;
    examStore.sendProctorWarning(sessionId, warningMessage.trim());
    setWarningMessage('');
    setActiveStudentIdForWarning(null);
    loadSessions();
  };

  const handleForceSubmit = (sessionId: string, studentName: string) => {
    if (confirm(`Are you sure you want to terminate & disqualify ${studentName}'s exam?`)) {
      examStore.forceSubmitSession(sessionId, 'Academic integrity violation threshold exceeded');
      loadSessions();
    }
  };

  const handleExtendTime = (sessionId: string) => {
    examStore.extendTime(sessionId, 300); // +5 minutes
    loadSessions();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Exam Selector & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Proctoring Feed Active
            </span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            {selectedExam?.title || 'Online Examination'}
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Course: {selectedExam?.courseCode} • Access PIN: {selectedExam?.accessCode}
          </p>
        </div>

        {/* Exam Picker dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400 font-medium">Select Exam:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.courseCode} - {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Candidates
            </span>
            <Radio className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">{totalActive}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Streaming video/audio</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Flagged Risk
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">{totalFlagged}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Under close surveillance</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Disqualified
            </span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2">{totalDisqualified}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Auto or manually locked</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Avg. Integrity
            </span>
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300 mt-2">{avgIntegrity}%</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Cohort security rating</div>
        </div>
      </div>

      {/* Live Event Ticker */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 px-4 py-2.5 flex items-center gap-3 text-xs">
        <span className="rounded bg-indigo-950 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300 border border-indigo-700/50">
          EVENT STREAM
        </span>
        <span className="text-zinc-300 font-mono truncate">{lastEvent}</span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            All ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'flagged'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            Flagged Risk ({totalFlagged})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'in_progress'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            In Progress ({totalActive})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'submitted'
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/50'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            Finished
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search student or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Real-time Grid of Candidate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSessions.map((student) => {
          const isFlagged = student.violations.length > 0 || student.status === 'flagged';
          const isDisqualified = student.status === 'disqualified';

          return (
            <div
              key={student.sessionId}
              className={`rounded-2xl border bg-zinc-900/90 shadow-xl overflow-hidden flex flex-col justify-between transition-all ${
                isDisqualified
                  ? 'border-rose-800/80 bg-rose-950/10'
                  : isFlagged
                  ? 'border-amber-700/60 bg-amber-950/10'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      isDisqualified
                        ? 'bg-rose-500'
                        : isFlagged
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {student.studentName}
                    </h4>
                    <span className="text-[11px] font-mono text-zinc-400">{student.studentId}</span>
                  </div>
                </div>

                {/* Integrity Badge */}
                <div
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                    student.integrityScore >= 90
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                      : student.integrityScore >= 65
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                      : 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                  }`}
                >
                  {student.integrityScore}% Integrity
                </div>
              </div>

              {/* Video Monitor Stream Frame */}
              <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden group">
                {/* Simulated webcam visual or gradient background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-indigo-950/30 flex items-center justify-center">
                  <div className="relative flex flex-col items-center">
                    {/* Simulated avatar / face silhouette */}
                    <div
                      className={`h-20 w-20 rounded-full border-2 flex items-center justify-center ${
                        student.faceStatus === 'away'
                          ? 'border-amber-400 bg-amber-950/20 text-amber-300'
                          : student.faceStatus === 'multiple'
                          ? 'border-rose-500 bg-rose-950/20 text-rose-400'
                          : 'border-emerald-500/50 bg-indigo-950/30 text-indigo-300'
                      }`}
                    >
                      <UserCheck className="h-10 w-10" />
                    </div>
                  </div>
                </div>

                {/* Live Overlays */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>REC</span>
                </div>

                <div className="absolute top-2.5 right-2.5 rounded bg-black/70 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                  {Math.floor(student.timeRemainingSeconds / 60)}m {student.timeRemainingSeconds % 60}s left
                </div>

                {/* Audio meter */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded bg-black/70 backdrop-blur-sm px-2 py-1 text-[10px] font-mono text-zinc-300">
                  <Volume2
                    className={`h-3 w-3 ${
                      student.audioDecibels > 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                    }`}
                  />
                  <span>{student.audioDecibels} dB</span>
                  <div className="w-12 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        student.audioDecibels > 60 ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${student.audioDecibels}%` }}
                    />
                  </div>
                </div>

                {/* Face Status Tag */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-mono ${
                      student.faceStatus === 'normal'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : student.faceStatus === 'away'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                        : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                    }`}
                  >
                    {student.faceStatus === 'normal'
                      ? 'Face Verified'
                      : student.faceStatus === 'away'
                      ? 'Looking Away'
                      : 'Multi-Face Alert'}
                  </span>
                </div>
              </div>

              {/* Violations Audit Trail Summary */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Violations Recorded:</span>
                  <span
                    className={`font-bold font-mono ${
                      student.violations.length > 0 ? 'text-rose-400' : 'text-emerald-400'
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
                        className="rounded-lg bg-zinc-950 border border-zinc-800 p-2 text-[11px] leading-tight flex items-start gap-2"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 text-zinc-300">
                          <span className="font-semibold text-white block capitalize">
                            {v.type.replace('_', ' ')}
                          </span>
                          <span className="text-zinc-400 text-[10px] line-clamp-1">
                            {v.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/60 p-2 text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>No security breaches detected</span>
                  </div>
                )}

                {/* Proctor Warning Input Drawer */}
                {activeStudentIdForWarning === student.sessionId && (
                  <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Warning: Center your webcam..."
                        value={warningMessage}
                        onChange={(e) => setWarningMessage(e.target.value)}
                        className="flex-1 rounded-lg border border-amber-600/50 bg-zinc-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendWarning(student.sessionId)}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                    </div>
                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        'Face camera directly',
                        'Stop background noise',
                        'Keep hands visible',
                        'Final warning before disqualify',
                      ].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setWarningMessage(preset)}
                          className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-zinc-700"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Proctor Actions Footer */}
              <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    setActiveStudentIdForWarning(
                      activeStudentIdForWarning === student.sessionId ? null : student.sessionId
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  <Send className="h-3 w-3 text-amber-400" />
                  <span>Warn</span>
                </button>

                <button
                  onClick={() => handleExtendTime(student.sessionId)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
                  title="Add 5 minutes to student exam clock"
                >
                  <PlusCircle className="h-3 w-3 text-emerald-400" />
                  <span>+5m</span>
                </button>

                <button
                  onClick={() => handleForceSubmit(student.sessionId, student.studentName)}
                  disabled={isDisqualified}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-rose-900/50 bg-rose-950/30 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 disabled:opacity-40 transition-colors"
                  title="Immediately terminate and disqualify candidate"
                >
                  <XCircle className="h-3 w-3 text-rose-400" />
                  <span>Disqualify</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
