'use client';

import React, { useState } from 'react';
import { Exam, Question, SecuritySettings, SharingSettings } from '@/types/exam';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  Clock,
  Sparkles,
  HelpCircle,
  Maximize,
  Video,
  Mic,
  Copy,
  AlertTriangle,
  KeyRound,
  FileQuestion,
} from 'lucide-react';

interface ExamCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: (exam: Exam) => void;
}

export default function ExamCreatorModal({
  isOpen,
  onClose,
  onExamCreated,
}: ExamCreatorModalProps) {
  const [activeStep, setActiveStep] = useState<'info' | 'security' | 'questions' | 'sharing'>('info');

  // Basic Info
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [totalPoints, setTotalPoints] = useState(100);
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [professorName, setProfessorName] = useState('Prof. Alan Turing');
  const [professorEmail, setProfessorEmail] = useState('turing@cambridge.edu');

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    fullscreenEnforced: true,
    webcamRequired: true,
    audioMonitoring: true,
    blockCopyPaste: true,
    blockDevToolsAndShortcuts: true,
    tabSwitchDetection: true,
    faceTracking: true,
    gazeDetection: true,
    multiplePersonDetection: true,
    maxViolationsAllowed: 5,
    randomizeQuestions: false,
    randomizeOptions: true,
    requirePasscode: false,
    strictAutoSubmit: true,
  });

  // Sharing Settings
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>({
    publicLinkEnabled: true,
    accessCodeEnabled: true,
    qrCodeEnabled: true,
    embedCodeEnabled: true,
    customSlug: '',
    passcode: '',
  });

  // Questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q1',
      type: 'multiple_choice',
      prompt: 'What is the primary objective of a zero-trust network architecture in cyber security?',
      options: [
        { id: 'opt_a', text: 'To trust all users within the local network perimeter' },
        { id: 'opt_b', text: 'Never trust, always verify every access request regardless of location' },
        { id: 'opt_c', text: 'To replace firewalls with antivirus suites' },
        { id: 'opt_d', text: 'To enforce open Wi-Fi protocols' },
      ],
      correctAnswers: ['opt_b'],
      points: 25,
      explanation: 'Zero Trust architecture enforces strict identity verification for every person and device attempting to access resources.',
    },
    {
      id: 'q2',
      type: 'short_answer',
      prompt: 'Which cryptographic algorithm standard was selected by NIST in 2001 to replace DES?',
      correctAnswers: ['AES', 'Advanced Encryption Standard'],
      points: 25,
      explanation: 'AES (Advanced Encryption Standard, Rijndael) was established by NIST in 2001.',
    },
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      type: 'multiple_choice',
      prompt: 'Enter question prompt here...',
      options: [
        { id: 'opt_1', text: 'First option' },
        { id: 'opt_2', text: 'Second option' },
        { id: 'opt_3', text: 'Third option' },
        { id: 'opt_4', text: 'Fourth option' },
      ],
      correctAnswers: ['opt_1'],
      points: 25,
      explanation: '',
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!title || !courseCode) {
      alert('Please fill in Exam Title and Course Code.');
      return;
    }

    // Generate random 6-character access PIN
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    let randomPin = '';
    for (let i = 0; i < 3; i++) randomPin += letters.charAt(Math.floor(Math.random() * letters.length));
    randomPin += '-';
    for (let i = 0; i < 4; i++) randomPin += numbers.charAt(Math.floor(Math.random() * numbers.length));

    const newExam: Exam = {
      id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      courseCode,
      description: description || 'Secure proctored examination created on Proctorly.',
      durationMinutes,
      totalPoints,
      passingPercentage,
      accessCode: randomPin,
      status: 'active',
      createdAt: new Date().toISOString(),
      professorName,
      professorEmail,
      securitySettings,
      sharingSettings: {
        ...sharingSettings,
        customSlug: sharingSettings.customSlug || courseCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      },
      questions,
    };

    onExamCreated(newExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Proctored Online Exam</h3>
              <p className="text-xs text-zinc-400">Configure assessment details, anti-cheating policies, questions, and sharing codes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Steps */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/50 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveStep('info')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeStep === 'info'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>1. Exam Info</span>
          </button>

          <button
            onClick={() => setActiveStep('security')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeStep === 'security'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>2. Anti-Cheat Security</span>
          </button>

          <button
            onClick={() => setActiveStep('questions')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeStep === 'questions'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileQuestion className="h-4 w-4" />
            <span>3. Questions ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveStep('sharing')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeStep === 'sharing'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>4. Distribution & Passcode</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {/* STEP 1: EXAM INFO */}
          {activeStep === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS-401 or MATH-202"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems Final Examination"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                  Description & Candidate Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide examination syllabus, rules, and allowed materials..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={100}
                    value={passingPercentage}
                    onChange={(e) => setPassingPercentage(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Professor / Proctor Name
                  </label>
                  <input
                    type="text"
                    value={professorName}
                    onChange={(e) => setProfessorName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={professorEmail}
                    onChange={(e) => setProfessorEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SECURITY SETTINGS */}
          {activeStep === 'security' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-4 mb-4">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                  <Shield className="h-4 w-4" />
                  <span>Proctorly AI Anti-Cheat Defense Suite</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure browser-level lockdowns, AI visual presence detection, and automatic penalty enforcement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Fullscreen */}
                <label className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={securitySettings.fullscreenEnforced}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, fullscreenEnforced: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Maximize className="h-4 w-4 text-emerald-400" /> True Fullscreen Lock
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Forces fullscreen view and sounds alarm/countdown if exited.
                    </p>
                  </div>
                </label>

                {/* Webcam & AI Face */}
                <label className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={securitySettings.webcamRequired}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, webcamRequired: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-indigo-400" /> AI Webcam Monitoring
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Streams video to live dashboard and tracks face presence.
                    </p>
                  </div>
                </label>

                {/* Audio Decibels */}
                <label className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={securitySettings.audioMonitoring}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, audioMonitoring: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Mic className="h-4 w-4 text-cyan-400" /> Audio & Noise Spike Monitor
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Detects whispering, secondary room voices, and microphone spikes.
                    </p>
                  </div>
                </label>

                {/* Block Copy/Paste */}
                <label className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={securitySettings.blockCopyPaste}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, blockCopyPaste: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Copy className="h-4 w-4 text-amber-400" /> Block Copy / Paste & Right-Click
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Prevents clipboard operations, text copying, and context menu inspection.
                    </p>
                  </div>
                </label>

                {/* Tab Switch & Focus */}
                <label className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={securitySettings.tabSwitchDetection}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, tabSwitchDetection: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-rose-400" /> Tab Switch & Dual Monitor Guard
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Detects when student unfocuses tab, clicks outside, or opens other windows.
                    </p>
                  </div>
                </label>

                {/* Block DevTools & Shortcuts */}
                <label className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={securitySettings.blockDevToolsAndShortcuts}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        blockDevToolsAndShortcuts: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-purple-400" /> Block F12, DevTools & PrintScreen
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Intercepts inspect shortcuts, PrintScreen, Ctrl+U, and debugging tools.
                    </p>
                  </div>
                </label>
              </div>

              {/* Thresholds */}
              <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Max Allowed Violations Before Termination
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={securitySettings.maxViolationsAllowed}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          maxViolationsAllowed: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-indigo-500"
                    />
                    <span className="w-10 text-center font-bold text-white text-sm bg-zinc-950 border border-zinc-800 py-1 rounded">
                      {securitySettings.maxViolationsAllowed}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Exceeding this strike count will automatically lock the exam and submit it as disqualified.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="strictAuto"
                    checked={securitySettings.strictAutoSubmit}
                    onChange={(e) =>
                      setSecuritySettings({ ...securitySettings, strictAutoSubmit: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="strictAuto" className="text-xs text-zinc-300">
                    <strong className="text-white block">Enforce Strict Auto-Submit</strong>
                    Immediately lock and submit upon violation threshold without proctor manual override.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: QUESTIONS BUILDER */}
          {activeStep === 'questions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Questions Pool ({questions.length})
                </span>
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Question</span>
                </button>
              </div>

              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-950 border border-indigo-700/50 px-2 py-0.5 text-xs font-bold text-indigo-300">
                        Q{qIndex + 1}
                      </span>
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIndex].type = e.target.value as Question['type'];
                          setQuestions(updated);
                        }}
                        className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
                      >
                        <option value="multiple_choice">Multiple Choice (Single)</option>
                        <option value="multiple_response">Multiple Response (Checkboxes)</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="essay">Essay / Long Form</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <span>Points:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={q.points}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].points = Number(e.target.value);
                            setQuestions(updated);
                          }}
                          className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-center text-xs text-white"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Remove Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Enter question statement or prompt..."
                      value={q.prompt}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].prompt = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Options editor for multiple choice / response */}
                  {(q.type === 'multiple_choice' || q.type === 'multiple_response') && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                        Answer Options (Select the correct one):
                      </span>
                      {q.options?.map((opt, optIndex) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            type={q.type === 'multiple_choice' ? 'radio' : 'checkbox'}
                            name={`correct-${q.id}`}
                            checked={q.correctAnswers.includes(opt.id)}
                            onChange={() => {
                              const updated = [...questions];
                              if (q.type === 'multiple_choice') {
                                updated[qIndex].correctAnswers = [opt.id];
                              } else {
                                const current = updated[qIndex].correctAnswers;
                                if (current.includes(opt.id)) {
                                  updated[qIndex].correctAnswers = current.filter((c) => c !== opt.id);
                                } else {
                                  updated[qIndex].correctAnswers = [...current, opt.id];
                                }
                              }
                              setQuestions(updated);
                            }}
                            className="h-4 w-4 accent-indigo-500"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...questions];
                              if (updated[qIndex].options) {
                                updated[qIndex].options![optIndex].text = e.target.value;
                                setQuestions(updated);
                              }
                            }}
                            className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Short answer correct phrase */}
                  {q.type === 'short_answer' && (
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">
                        Expected Keyword Answer:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. photosynthesis"
                        value={q.correctAnswers[0] || ''}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[qIndex].correctAnswers = [e.target.value];
                          setQuestions(updated);
                        }}
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: SHARING & PASSCODE */}
          {activeStep === 'sharing' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Access Control & Distribution</h4>
                <p className="text-xs text-zinc-400">
                  A unique 6-character access PIN and dynamic QR code will be generated upon creation.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Custom URL Slug (Optional)
                  </label>
                  <div className="flex items-center">
                    <span className="rounded-l-xl border border-r-0 border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-500">
                      /exam/
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. cs401-fall-final"
                      value={sharingSettings.customSlug || ''}
                      onChange={(e) =>
                        setSharingSettings({ ...sharingSettings, customSlug: e.target.value })
                      }
                      className="flex-1 rounded-r-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">
                    Secret Exam Passcode (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank if no passcode is required (e.g. SECURE2026)"
                    value={sharingSettings.passcode || ''}
                    onChange={(e) =>
                      setSharingSettings({ ...sharingSettings, passcode: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    If set, candidates must input both the access code and this secret passcode to begin.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-zinc-800 bg-zinc-950/70 px-6 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {activeStep !== 'info' && (
              <button
                onClick={() => {
                  if (activeStep === 'security') setActiveStep('info');
                  if (activeStep === 'questions') setActiveStep('security');
                  if (activeStep === 'sharing') setActiveStep('questions');
                }}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Back
              </button>
            )}

            {activeStep !== 'sharing' ? (
              <button
                onClick={() => {
                  if (activeStep === 'info') setActiveStep('security');
                  else if (activeStep === 'security') setActiveStep('questions');
                  else if (activeStep === 'questions') setActiveStep('sharing');
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Publish Exam</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
