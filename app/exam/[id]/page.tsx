'use client';

import React, { useState, useEffect, use } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import { Exam, StudentSession } from '@/types/exam';
import { examStore } from '@/lib/examStore';
import ExamJoinCard from '@/components/student/ExamJoinCard';
import PreExamDiagnostics from '@/components/student/PreExamDiagnostics';
import SecureExamRoom from '@/components/student/SecureExamRoom';
import ExamSubmissionSuccess from '@/components/student/ExamSubmissionSuccess';
import { Shield, AlertCircle } from 'lucide-react';

interface ExamPageProps {
  params: Promise<{ id: string }>;
}

export default function ExamSessionPage({ params }: ExamPageProps) {
  const { id: examId } = use(params);
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [exam, setExam] = useState<Exam | null>(null);
  const [stage, setStage] = useState<'identify' | 'diagnostics' | 'room' | 'submitted'>('identify');
  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    email: string;
    studentId: string;
  } | null>(null);
  const [session, setSession] = useState<StudentSession | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Load exam by ID or slug
  useEffect(() => {
    const foundExam = examStore.getExamById(examId);
    if (foundExam) {
      setExam(foundExam);

      // Check if candidate details already in sessionStorage
      const cached = sessionStorage.getItem('proctorly_candidate');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.name && parsed.studentId) {
            setStudentInfo(parsed);
            setStage('diagnostics');
          }
        } catch {
          // ignore
        }
      }
    }
  }, [examId]);

  if (!exam) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">Exam Not Found</h2>
          <p className="text-xs text-zinc-400 mt-1 mb-6">
            The exam identifier <code className="text-indigo-400 font-mono">{examId}</code> could not be located or has ended.
          </p>
          <a
            href="/"
            className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Return to Portal
          </a>
        </div>
      </div>
    );
  }

  const handleExamIdentified = (
    matchedExam: Exam,
    candidate: { name: string; email: string; studentId: string }
  ) => {
    setStudentInfo(candidate);
    setExam(matchedExam);
    setStage('diagnostics');
  };

  const handleDiagnosticsComplete = (stream: MediaStream | null) => {
    if (!studentInfo || !exam) return;

    setMediaStream(stream);

    // Create active StudentSession
    const newSession: StudentSession = {
      sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      examId: exam.id,
      studentName: studentInfo.name,
      studentEmail: studentInfo.email,
      studentId: studentInfo.studentId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      timeRemainingSeconds: exam.durationMinutes * 60,
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      violations: [],
      integrityScore: 100,
      faceStatus: 'normal',
      audioDecibels: 20,
      audioAlert: false,
      isOnline: true,
      lastHeartbeat: new Date().toISOString(),
      proctorWarnings: [],
    };

    setSession(newSession);
    examStore.saveSession(newSession);
    setStage('room');
  };

  const handleExamSubmitted = (finalSession: StudentSession) => {
    setSession(finalSession);
    setStage('submitted');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-8">
      {/* STAGE 1: IDENTIFY / ACCESS PIN */}
      {stage === 'identify' && (
        <div className="p-4">
          <ExamJoinCard
            initialCode={codeParam || exam.accessCode}
            onExamFound={handleExamIdentified}
          />
        </div>
      )}

      {/* STAGE 2: PRE-EXAM DIAGNOSTICS */}
      {stage === 'diagnostics' && studentInfo && (
        <div className="p-4">
          <PreExamDiagnostics
            exam={exam}
            student={studentInfo}
            onDiagnosticsComplete={handleDiagnosticsComplete}
          />
        </div>
      )}

      {/* STAGE 3: SECURE ANTI-CHEAT ROOM */}
      {stage === 'room' && session && (
        <SecureExamRoom
          exam={exam}
          session={session}
          mediaStream={mediaStream}
          onExamSubmitted={handleExamSubmitted}
        />
      )}

      {/* STAGE 4: SUBMISSION & INTEGRITY CERTIFICATE */}
      {stage === 'submitted' && session && (
        <div className="p-4">
          <ExamSubmissionSuccess exam={exam} session={session} />
        </div>
      )}
    </div>
  );
}
