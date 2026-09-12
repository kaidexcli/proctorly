'use client';

import { Exam, StudentSession, ViolationEvent, ViolationSeverity } from '@/types/exam';
import { INITIAL_EXAMS, INITIAL_STUDENT_SESSIONS } from './mockData';

const EXAMS_STORAGE_KEY = 'proctorly_exams_v1';
const SESSIONS_STORAGE_KEY = 'proctorly_sessions_v1';
const SYNC_CHANNEL_NAME = 'proctorly_sync_channel';

// Type for broadcast messages across tabs
export type SyncMessage =
  | { type: 'EXAM_UPDATED'; examId: string }
  | { type: 'EXAM_DELETED'; examId: string }
  | { type: 'SESSION_JOINED'; session: StudentSession }
  | { type: 'SESSION_UPDATED'; session: StudentSession }
  | { type: 'VIOLATION_ADDED'; sessionId: string; violation: ViolationEvent }
  | { type: 'PROCTOR_WARNING'; sessionId: string; message: string }
  | { type: 'PROCTOR_FORCE_SUBMIT'; sessionId: string; reason: string }
  | { type: 'PROCTOR_EXTEND_TIME'; sessionId: string; extraSeconds: number };

class ExamStore {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(msg: SyncMessage) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or failed to initialize', e);
      }

      window.addEventListener('storage', (event) => {
        if (event.key === SESSIONS_STORAGE_KEY) {
          this.notifyListeners({ type: 'SESSION_UPDATED', session: {} as StudentSession });
        } else if (event.key === EXAMS_STORAGE_KEY) {
          this.notifyListeners({ type: 'EXAM_UPDATED', examId: '' });
        }
      });

      this.initializeStorage();
    }
  }

  private initializeStorage() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(EXAMS_STORAGE_KEY)) {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(INITIAL_EXAMS));
    }
    if (!localStorage.getItem(SESSIONS_STORAGE_KEY)) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(INITIAL_STUDENT_SESSIONS));
    }
  }

  public subscribe(listener: (msg: SyncMessage) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(msg: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    });
  }

  private broadcast(msg: SyncMessage) {
    this.notifyListeners(msg);
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (e) {
        console.error('Broadcast failed:', e);
      }
    }
  }

  // --- EXAM METHODS ---

  public getExams(): Exam[] {
    if (typeof window === 'undefined') return INITIAL_EXAMS;
    try {
      const raw = localStorage.getItem(EXAMS_STORAGE_KEY);
      if (!raw) return INITIAL_EXAMS;
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXAMS;
    }
  }

  public getExamById(id: string): Exam | null {
    const exams = this.getExams();
    return exams.find((e) => e.id === id || e.sharingSettings.customSlug === id) || null;
  }

  public getExamByAccessCode(code: string): Exam | null {
    const cleanCode = code.trim().toUpperCase().replace(/[\s-]/g, '');
    const exams = this.getExams();
    return (
      exams.find((e) => {
        const storedClean = e.accessCode.trim().toUpperCase().replace(/[\s-]/g, '');
        return storedClean === cleanCode;
      }) || null
    );
  }

  public saveExam(exam: Exam): void {
    const exams = this.getExams();
    const index = exams.findIndex((e) => e.id === exam.id);
    if (index >= 0) {
      exams[index] = exam;
    } else {
      exams.unshift(exam);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
    }
    this.broadcast({ type: 'EXAM_UPDATED', examId: exam.id });
  }

  public deleteExam(id: string): void {
    const exams = this.getExams().filter((e) => e.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
    }
    this.broadcast({ type: 'EXAM_DELETED', examId: id });
  }

  // --- STUDENT SESSION METHODS ---

  public getSessions(examId?: string): StudentSession[] {
    if (typeof window === 'undefined') return INITIAL_STUDENT_SESSIONS;
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const allSessions: StudentSession[] = raw ? JSON.parse(raw) : INITIAL_STUDENT_SESSIONS;
      if (examId) {
        return allSessions.filter((s) => s.examId === examId);
      }
      return allSessions;
    } catch {
      return INITIAL_STUDENT_SESSIONS;
    }
  }

  public getSession(sessionId: string): StudentSession | null {
    const sessions = this.getSessions();
    return sessions.find((s) => s.sessionId === sessionId) || null;
  }

  public saveSession(session: StudentSession): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex((s) => s.sessionId === session.sessionId);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }
    this.broadcast({ type: 'SESSION_UPDATED', session });
  }

  public calculateIntegrityScore(violations: ViolationEvent[]): number {
    let penalty = 0;
    for (const v of violations) {
      switch (v.severity) {
        case 'low':
          penalty += 4;
          break;
        case 'medium':
          penalty += 10;
          break;
        case 'high':
          penalty += 18;
          break;
        case 'critical':
          penalty += 30;
          break;
      }
    }
    return Math.max(0, 100 - penalty);
  }

  public addViolation(
    sessionId: string,
    violationData: Omit<ViolationEvent, 'id' | 'timestamp'>
  ): { session: StudentSession | null; autoSubmitted: boolean } {
    const session = this.getSession(sessionId);
    if (!session) return { session: null, autoSubmitted: false };

    const exam = this.getExamById(session.examId);
    const maxViolations = exam?.securitySettings.maxViolationsAllowed ?? 5;

    const violation: ViolationEvent = {
      ...violationData,
      id: `viol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    const updatedViolations = [violation, ...session.violations];
    const newIntegrityScore = this.calculateIntegrityScore(updatedViolations);

    let newStatus = session.status;
    let autoSubmitted = false;

    if (updatedViolations.length >= maxViolations && exam?.securitySettings.strictAutoSubmit) {
      newStatus = 'disqualified';
      autoSubmitted = true;
      session.submittedAt = new Date().toISOString();
    } else if (updatedViolations.length >= 2 && session.status === 'in_progress') {
      newStatus = 'flagged';
    }

    const updatedSession: StudentSession = {
      ...session,
      violations: updatedViolations,
      integrityScore: newIntegrityScore,
      status: newStatus,
      lastHeartbeat: new Date().toISOString(),
    };

    this.saveSession(updatedSession);
    this.broadcast({ type: 'VIOLATION_ADDED', sessionId, violation });

    return { session: updatedSession, autoSubmitted };
  }

  public sendProctorWarning(sessionId: string, message: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const updatedSession: StudentSession = {
      ...session,
      proctorWarnings: [...session.proctorWarnings, message],
    };

    this.saveSession(updatedSession);
    this.broadcast({ type: 'PROCTOR_WARNING', sessionId, message });
  }

  public forceSubmitSession(sessionId: string, reason: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const updatedSession: StudentSession = {
      ...session,
      status: 'disqualified',
      submittedAt: new Date().toISOString(),
      proctorWarnings: [...session.proctorWarnings, `Remote Force Submission by Proctor: ${reason}`],
    };

    this.saveSession(updatedSession);
    this.broadcast({ type: 'PROCTOR_FORCE_SUBMIT', sessionId, reason });
  }

  public extendTime(sessionId: string, extraSeconds: number): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const updatedSession: StudentSession = {
      ...session,
      timeRemainingSeconds: session.timeRemainingSeconds + extraSeconds,
      proctorWarnings: [
        ...session.proctorWarnings,
        `Proctor granted an extra ${Math.round(extraSeconds / 60)} minutes to your exam time.`,
      ],
    };

    this.saveSession(updatedSession);
    this.broadcast({ type: 'PROCTOR_EXTEND_TIME', sessionId, extraSeconds });
  }
}

export const examStore = new ExamStore();
