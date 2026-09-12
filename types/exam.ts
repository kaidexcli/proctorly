export type QuestionType = 'multiple_choice' | 'multiple_response' | 'short_answer' | 'essay';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[];
  correctAnswers: string[];
  points: number;
  explanation?: string;
}

export interface SecuritySettings {
  fullscreenEnforced: boolean;
  webcamRequired: boolean;
  audioMonitoring: boolean;
  blockCopyPaste: boolean;
  blockDevToolsAndShortcuts: boolean;
  tabSwitchDetection: boolean;
  faceTracking: boolean;
  gazeDetection: boolean;
  multiplePersonDetection: boolean;
  maxViolationsAllowed: number; // e.g. 5, after which exam is terminated
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  requirePasscode: boolean;
  strictAutoSubmit: boolean;
}

export interface SharingSettings {
  publicLinkEnabled: boolean;
  accessCodeEnabled: boolean;
  qrCodeEnabled: boolean;
  embedCodeEnabled: boolean;
  customSlug?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  passcode?: string;
  allowedEmailDomain?: string;
}

export interface Exam {
  id: string;
  title: string;
  courseCode: string;
  description: string;
  durationMinutes: number;
  totalPoints: number;
  passingPercentage: number;
  accessCode: string; // e.g., "PRC-9104"
  status: 'draft' | 'published' | 'active' | 'archived';
  createdAt: string;
  professorName: string;
  professorEmail: string;
  securitySettings: SecuritySettings;
  sharingSettings: SharingSettings;
  questions: Question[];
}

export type ViolationType =
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'copy_attempt'
  | 'paste_attempt'
  | 'devtools_opened'
  | 'multiple_faces'
  | 'no_face'
  | 'looking_away'
  | 'audio_spike'
  | 'window_blur'
  | 'restricted_key'
  | 'right_click';

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ViolationEvent {
  id: string;
  timestamp: string;
  type: ViolationType;
  severity: ViolationSeverity;
  description: string;
  snapshotData?: string; // canvas capture thumbnail if available
}

export type StudentStatus =
  | 'not_started'
  | 'system_check'
  | 'in_progress'
  | 'submitted'
  | 'time_expired'
  | 'flagged'
  | 'disqualified';

export type FaceDetectionStatus = 'normal' | 'away' | 'multiple' | 'missing' | 'checking';

export interface StudentSession {
  sessionId: string;
  examId: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  status: StudentStatus;
  startedAt?: string;
  submittedAt?: string;
  timeRemainingSeconds: number;
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  flaggedQuestions: string[];
  violations: ViolationEvent[];
  integrityScore: number; // 0 to 100%
  score?: number;
  totalEarnedPoints?: number;
  faceStatus: FaceDetectionStatus;
  audioDecibels: number; // 0-100
  audioAlert: boolean;
  isOnline: boolean;
  lastHeartbeat: string;
  proctorWarnings: string[];
}

export interface ProctorAlertMessage {
  id: string;
  sessionId: string;
  studentName: string;
  message: string;
  timestamp: string;
  type: 'warning' | 'info' | 'critical';
}
