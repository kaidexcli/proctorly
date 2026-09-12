'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Exam } from '@/types/exam';
import {
  Share2,
  Eye,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  KeyRound,
  Trash2,
  FileText,
  ExternalLink,
  Users,
  Video,
  Mic,
  Maximize,
} from 'lucide-react';
import ShareExamModal from './ShareExamModal';

interface ExamListProps {
  exams: Exam[];
  onDeleteExam: (id: string) => void;
  onSelectExamForMonitoring: (examId: string) => void;
  onSelectExamForResults: (examId: string) => void;
}

export default function ExamList({
  exams,
  onDeleteExam,
  onSelectExamForMonitoring,
  onSelectExamForResults,
}: ExamListProps) {
  const [selectedExamForShare, setSelectedExamForShare] = useState<Exam | null>(null);

  if (exams.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
        <Shield className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
        <h3 className="text-lg font-semibold text-white">No Exams Found</h3>
        <p className="text-sm text-zinc-400 mt-1 mb-6">Create your first anti-cheat secured online exam to start testing students.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-950 border border-indigo-700/50 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                    {exam.courseCode}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                      exam.status === 'active'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {exam.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono font-bold text-zinc-300 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg">
                  <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{exam.accessCode}</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                {exam.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                {exam.description}
              </p>

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 my-4 py-3 border-y border-zinc-800/80">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span>{exam.durationMinutes} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span>{exam.questions.length} Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <span>Max {exam.securitySettings.maxViolationsAllowed} Violations</span>
                </div>
              </div>

              {/* Security Shield Badges */}
              <div className="mb-5">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                  Active Anti-Cheat Defenses:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {exam.securitySettings.fullscreenEnforced && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300">
                      <Maximize className="h-3 w-3 text-emerald-400" /> Fullscreen Lock
                    </span>
                  )}
                  {exam.securitySettings.webcamRequired && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300">
                      <Video className="h-3 w-3 text-indigo-400" /> AI Face Tracking
                    </span>
                  )}
                  {exam.securitySettings.audioMonitoring && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300">
                      <Mic className="h-3 w-3 text-cyan-400" /> Decibel Monitor
                    </span>
                  )}
                  {exam.securitySettings.blockCopyPaste && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300">
                      <Shield className="h-3 w-3 text-amber-400" /> Clipboard Block
                    </span>
                  )}
                  {exam.securitySettings.tabSwitchDetection && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300">
                      <AlertTriangle className="h-3 w-3 text-rose-400" /> Tab Switch Guard
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-2">
                {/* Share Button */}
                <button
                  onClick={() => setSelectedExamForShare(exam)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share & QR</span>
                </button>

                {/* Live Monitor */}
                <button
                  onClick={() => onSelectExamForMonitoring(exam.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Live Proctor</span>
                </button>

                {/* View Results */}
                <button
                  onClick={() => onSelectExamForResults(exam.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Results</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Test Exam as Student */}
                <Link
                  href={`/exam/${exam.id}?code=${exam.accessCode}`}
                  target="_blank"
                  className="p-2 text-zinc-400 hover:text-indigo-400 transition-colors"
                  title="Test as student in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${exam.title}"?`)) {
                      onDeleteExam(exam.id);
                    }
                  }}
                  className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Delete Exam"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {selectedExamForShare && (
        <ShareExamModal
          exam={selectedExamForShare}
          isOpen={!!selectedExamForShare}
          onClose={() => setSelectedExamForShare(null)}
        />
      )}
    </>
  );
}
