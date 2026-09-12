'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Exam } from '@/types/exam';
import { examStore, SyncMessage } from '@/lib/examStore';
import ExamList from '@/components/professor/ExamList';
import ExamCreatorModal from '@/components/professor/ExamCreatorModal';
import LiveProctoringDashboard from '@/components/professor/LiveProctoringDashboard';
import ExamResultsView from '@/components/professor/ExamResultsView';
import {
  Shield,
  PlusCircle,
  Eye,
  FileCheck,
  Share2,
  Users,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';

function ProfessorDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'exams' | 'monitor' | 'results' | 'create') || 'exams';

  const [activeTab, setActiveTab] = useState<'exams' | 'monitor' | 'results'>(
    initialTab === 'create' ? 'exams' : initialTab
  );
  const [isCreatorOpen, setIsCreatorOpen] = useState(initialTab === 'create');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamIdForResults, setSelectedExamIdForResults] = useState<string>('');
  const [selectedExamIdForMonitoring, setSelectedExamIdForMonitoring] = useState<string>('');

  const loadExams = () => {
    const list = examStore.getExams();
    setExams(list);
    if (list.length > 0 && !selectedExamIdForResults) {
      setSelectedExamIdForResults(list[0].id);
      setSelectedExamIdForMonitoring(list[0].id);
    }
  };

  useEffect(() => {
    loadExams();

    const unsubscribe = examStore.subscribe((msg: SyncMessage) => {
      if (msg.type === 'EXAM_UPDATED' || msg.type === 'EXAM_DELETED') {
        loadExams();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateExam = (newExam: Exam) => {
    examStore.saveExam(newExam);
    loadExams();
    setIsCreatorOpen(false);
    setActiveTab('exams');
  };

  const handleDeleteExam = (id: string) => {
    examStore.deleteExam(id);
    loadExams();
  };

  const handleSelectExamForMonitoring = (examId: string) => {
    setSelectedExamIdForMonitoring(examId);
    setActiveTab('monitor');
  };

  const handleSelectExamForResults = (examId: string) => {
    setSelectedExamIdForResults(examId);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Professor Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-indigo-950 border border-indigo-700/50 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                INSTRUCTOR PORTAL
              </span>
              <span className="text-xs text-zinc-400">Live Assessment Control & Surveillance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Professor Command Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatorOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Proctored Exam</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'exams'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Exams & Distribution ({exams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'monitor'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="h-4 w-4 text-emerald-400" />
            <span>Live Proctoring Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'results'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            <span>Results & Forensic Audits</span>
          </button>
        </div>

        {/* TAB 1: EXAMS LIST & SHARING */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <ExamList
              exams={exams}
              onDeleteExam={handleDeleteExam}
              onSelectExamForMonitoring={handleSelectExamForMonitoring}
              onSelectExamForResults={handleSelectExamForResults}
            />
          </div>
        )}

        {/* TAB 2: LIVE PROCTORING DASHBOARD */}
        {activeTab === 'monitor' && (
          <LiveProctoringDashboard
            examId={selectedExamIdForMonitoring || (exams[0]?.id ?? '')}
            exams={exams}
          />
        )}

        {/* TAB 3: EXAM RESULTS & AUDIT LOGS */}
        {activeTab === 'results' && (
          <ExamResultsView
            exams={exams}
            selectedExamId={selectedExamIdForResults || (exams[0]?.id ?? '')}
            onSelectExam={(id) => setSelectedExamIdForResults(id)}
          />
        )}

        {/* Exam Creator Modal */}
        <ExamCreatorModal
          isOpen={isCreatorOpen}
          onClose={() => setIsCreatorOpen(false)}
          onExamCreated={handleCreateExam}
        />
      </div>
    </div>
  );
}

export default function ProfessorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Loading Professor Command Center...</div>}>
      <ProfessorDashboardContent />
    </Suspense>
  );
}
