'use client';

import React, { useState } from 'react';
import { Exam, StudentSession, ViolationEvent } from '@/types/exam';
import { examStore } from '@/lib/examStore';
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
  X,
  Printer,
} from 'lucide-react';

interface ExamResultsViewProps {
  exams: Exam[];
  selectedExamId: string;
  onSelectExam: (id: string) => void;
}

export default function ExamResultsView({
  exams,
  selectedExamId,
  onSelectExam,
}: ExamResultsViewProps) {
  const [activeSessionForAudit, setActiveSessionForAudit] = useState<StudentSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const sessions = currentExam ? examStore.getSessions(currentExam.id) : [];

  const filtered = sessions.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    if (!currentExam) return;

    const headers = ['Student Name', 'Student ID', 'Email', 'Status', 'Integrity Score', 'Violations Count', 'Started At', 'Submitted At'];
    const rows = sessions.map((s) => [
      `"${s.studentName}"`,
      `"${s.studentId}"`,
      `"${s.studentEmail}"`,
      s.status,
      `${s.integrityScore}%`,
      s.violations.length,
      s.startedAt || 'N/A',
      s.submittedAt || 'In Progress',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentExam.courseCode}_Exam_Integrity_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Exam Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/80 p-5 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Student Submissions & Integrity Audit</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Review candidate grades, forensic violation logs, and verify academic integrity certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentExam?.id}
            onChange={(e) => onSelectExam(e.target.value)}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none shadow-sm"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.courseCode} - {e.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
        <input
          type="text"
          placeholder="Filter by student name or student ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:outline-none shadow-sm"
        />
      </div>

      {/* Submissions Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Integrity Rating</th>
                <th className="px-6 py-4">Violations</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Audit Trail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {filtered.map((s) => (
                <tr key={s.sessionId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900 dark:text-white">{s.studentName}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{s.studentId} • {s.studentEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
                        s.status === 'disqualified'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800/50'
                          : s.status === 'flagged'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800/50'
                          : s.status === 'submitted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/50'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          s.integrityScore >= 90
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : s.integrityScore >= 60
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {s.integrityScore}%
                      </span>
                      <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            s.integrityScore >= 90
                              ? 'bg-emerald-500 dark:bg-emerald-400'
                              : s.integrityScore >= 60
                              ? 'bg-amber-500 dark:bg-amber-400'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${s.integrityScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-mono font-semibold ${
                        s.violations.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {s.violations.length} incidents
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleTimeString() : 'In Progress'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setActiveSessionForAudit(s)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Audit Trail Modal */}
      {activeSessionForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-5 bg-zinc-50/80 dark:bg-zinc-900/90">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Forensic Audit Trail: {activeSessionForAudit.studentName}</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  Candidate ID: {activeSessionForAudit.studentId} • Integrity: {activeSessionForAudit.integrityScore}%
                </p>
              </div>
              <button
                onClick={() => setActiveSessionForAudit(null)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-zinc-500 block">Exam Started:</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-mono">
                    {activeSessionForAudit.startedAt
                      ? new Date(activeSessionForAudit.startedAt).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Final Status:</span>
                  <span className="text-zinc-900 dark:text-white font-semibold capitalize font-mono">
                    {activeSessionForAudit.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Chronological Anti-Cheat Event Log ({activeSessionForAudit.violations.length})
                </h4>

                {activeSessionForAudit.violations.length > 0 ? (
                  <div className="space-y-2">
                    {activeSessionForAudit.violations.map((viol) => (
                      <div
                        key={viol.id}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3.5 flex items-start gap-3"
                      >
                        <div
                          className={`mt-0.5 p-1 rounded-md ${
                            viol.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : viol.severity === 'high'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                              : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white capitalize">
                              {viol.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(viol.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                            {viol.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-emerald-50/60 dark:bg-zinc-950 border border-emerald-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-400 text-xs">
                    <ShieldCheck className="h-8 w-8 mx-auto mb-2" />
                    Clean session. Zero anti-cheat violations detected during this candidate's examination.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 px-6 py-4 flex justify-end">
              <button
                onClick={() => setActiveSessionForAudit(null)}
                className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
