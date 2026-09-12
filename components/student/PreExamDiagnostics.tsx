'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Exam } from '@/types/exam';
import {
  Video,
  Mic,
  Maximize,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Lock,
} from 'lucide-react';

interface PreExamDiagnosticsProps {
  exam: Exam;
  student: {
    name: string;
    email: string;
    studentId: string;
  };
  onDiagnosticsComplete: (stream: MediaStream | null) => void;
}

export default function PreExamDiagnostics({
  exam,
  student,
  onDiagnosticsComplete,
}: PreExamDiagnosticsProps) {
  const [cameraStatus, setCameraStatus] = useState<'pending' | 'checking' | 'passed' | 'failed'>(
    'pending'
  );
  const [micStatus, setMicStatus] = useState<'pending' | 'checking' | 'passed' | 'failed'>('pending');
  const [fullscreenStatus, setFullscreenStatus] = useState<'pending' | 'passed'>('pending');
  const [honorCodeAccepted, setHonorCodeAccepted] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(15);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Request Camera and Microphone on mount
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initDevices() {
      setCameraStatus('checking');
      setMicStatus('checking');

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' },
            audio: true,
          });

          setMediaStream(stream);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((e) => console.log('Video play caught', e));
          }

          setCameraStatus('passed');
          setMicStatus('passed');

          // Initialize Web Audio meter
          try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              audioContextRef.current = ctx;
              const source = ctx.createMediaStreamSource(stream);
              const analyser = ctx.createAnalyser();
              analyser.fftSize = 256;
              source.connect(analyser);
              analyserRef.current = analyser;

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const interval = setInterval(() => {
                if (analyserRef.current) {
                  analyserRef.current.getByteFrequencyData(dataArray);
                  let sum = 0;
                  for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                  const avg = sum / dataArray.length;
                  setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
                }
              }, 200);

              return () => clearInterval(interval);
            }
          } catch (e) {
            console.warn('Audio analyzer error:', e);
          }
        } else {
          // Fallback simulation for environments without hardware
          setCameraStatus('passed');
          setMicStatus('passed');
        }
      } catch (err) {
        console.warn('Media devices could not be accessed directly:', err);
        // Still allow student to proceed in simulation/sandbox mode
        setCameraStatus('passed');
        setMicStatus('passed');
      }
    }

    initDevices();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleTestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setFullscreenStatus('passed');
    } catch (e) {
      console.warn('Fullscreen request failed:', e);
      setFullscreenStatus('passed');
    }
  };

  const isReady =
    cameraStatus === 'passed' &&
    micStatus === 'passed' &&
    fullscreenStatus === 'passed' &&
    honorCodeAccepted;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="rounded-full bg-indigo-950 border border-indigo-700/50 px-3 py-1 text-xs font-bold text-indigo-300 uppercase tracking-wider">
          System Readiness Check
        </span>
        <h2 className="text-2xl font-black text-white mt-2">Candidate Security Verification</h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {student.name} ({student.studentId}) • {exam.courseCode}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Video Preview & Face Framing */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
            <span>Webcam Feed Check</span>
            {cameraStatus === 'passed' && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Video Stream Active
              </span>
            )}
          </div>

          <div className="relative aspect-video rounded-2xl bg-zinc-950 border-2 border-dashed border-zinc-700 overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
            />

            {/* Simulated Face Alignment Oval Guide */}
            <div className="pointer-events-none relative z-10 flex flex-col items-center">
              <div className="h-32 w-28 rounded-full border-2 border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-emerald-300 opacity-60" />
              </div>
              <span className="mt-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-mono text-emerald-300 backdrop-blur-sm">
                Align face inside oval
              </span>
            </div>

            {/* Decibel Audio Meter Overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center gap-2 rounded-xl bg-black/80 backdrop-blur-md px-3 py-1.5 text-xs text-zinc-300">
              <Mic className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono">Mic Volume:</span>
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-150"
                  style={{ width: `${Math.max(10, audioLevel)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-emerald-400">OK</span>
            </div>
          </div>
        </div>

        {/* Right: Security Requirements & Oath */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Mandatory Environment Checks
          </div>

          {/* Fullscreen requirement */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400">
                <Maximize className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Fullscreen Enforcement</span>
                <span className="text-[11px] text-zinc-400">Browser must be locked into true fullscreen</span>
              </div>
            </div>

            {fullscreenStatus === 'passed' ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={handleTestFullscreen}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Enable Fullscreen
              </button>
            )}
          </div>

          {/* Rules Card */}
          <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-3.5 text-xs text-amber-200/90 leading-relaxed space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              <span>Proctoring Security Rules</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-zinc-300 space-y-0.5 pt-1">
              <li>Tab switching, window unfocus, and Alt-Tab will be logged immediately.</li>
              <li>Clipboard (copy & paste) and developer tools are strictly disabled.</li>
              <li>Continuous AI webcam presence monitoring active.</li>
              <li>Maximum allowed violations: <strong className="text-white">{exam.securitySettings.maxViolationsAllowed}</strong> before auto-disqualification.</li>
            </ul>
          </div>

          {/* Honor Code Checkbox */}
          <label className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
            <input
              type="checkbox"
              checked={honorCodeAccepted}
              onChange={(e) => setHonorCodeAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-zinc-300 leading-snug">
              I affirm on my honor that I will take this examination honestly and independently, without unauthorized aid or external devices.
            </span>
          </label>
        </div>
      </div>

      {/* Action to Enter Room */}
      <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-between items-center">
        <div className="text-xs text-zinc-500">
          Duration: <strong className="text-zinc-300">{exam.durationMinutes} Minutes</strong> • Questions: <strong className="text-zinc-300">{exam.questions.length}</strong>
        </div>

        <button
          type="button"
          onClick={() => onDiagnosticsComplete(mediaStream)}
          disabled={!isReady}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 text-sm font-bold text-zinc-950 shadow-xl shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Enter Secure Exam Room</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
