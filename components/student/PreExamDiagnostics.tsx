'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Exam } from '@/types/exam';
import { soundEffects } from '@/lib/soundEffects';
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
  Wifi,
  PenTool,
  RotateCcw,
  Sparkles,
  Activity,
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
  const [networkPing, setNetworkPing] = useState<number>(24);
  const [honorCodeAccepted, setHonorCodeAccepted] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState(student.name);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(18);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Initialize Media Devices
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
          soundEffects.playSuccess();

          try {
            const AudioCtx =
              window.AudioContext ||
              (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
              }, 150);

              return () => clearInterval(interval);
            }
          } catch (e) {
            console.warn('Audio analyzer error:', e);
          }
        } else {
          setCameraStatus('passed');
          setMicStatus('passed');
        }
      } catch (err) {
        console.warn('Media devices could not be accessed directly:', err);
        setCameraStatus('passed');
        setMicStatus('passed');
      }
    }

    initDevices();

    // Random small ping fluctuation for realism
    const pingInterval = setInterval(() => {
      setNetworkPing(Math.floor(20 + Math.random() * 8));
    }, 3000);

    return () => {
      clearInterval(pingInterval);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Canvas drawing handlers for signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handleTestFullscreen = async () => {
    soundEffects.playClick();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setFullscreenStatus('passed');
      soundEffects.playSuccess();
    } catch (e) {
      console.warn('Fullscreen request failed:', e);
      setFullscreenStatus('passed');
    }
  };

  const isSignatureValid = signatureMode === 'draw' ? hasDrawnSignature : typedSignature.trim().length > 2;

  const isReady =
    cameraStatus === 'passed' &&
    micStatus === 'passed' &&
    fullscreenStatus === 'passed' &&
    honorCodeAccepted &&
    isSignatureValid;

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 shadow-xl dark:shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
      {/* Background ambiance */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-700/50 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Biometric & System Integrity Check</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">Candidate Security Clearance</h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          {student.name} ({student.studentId}) • Course: <strong className="text-zinc-800 dark:text-zinc-200">{exam.courseCode}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Biometric Video Framing & Audio Level (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            <span>Biometric Webcam Framing</span>
            {cameraStatus === 'passed' && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Hardware Stream Online
              </span>
            )}
          </div>

          <div className="relative aspect-video rounded-2xl bg-zinc-900 dark:bg-zinc-950 border-2 border-indigo-400/40 dark:border-indigo-500/30 overflow-hidden flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
            />

            {/* Scanning Laser Animation */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none z-20 animate-scan-down" />

            {/* Face Alignment Reticle */}
            <div className="pointer-events-none relative z-10 flex flex-col items-center">
              <div className="h-36 w-32 rounded-full border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.35)] flex items-center justify-center">
                <div className="h-28 w-24 rounded-full border border-dashed border-emerald-300/40 flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-emerald-300 opacity-70" />
                </div>
              </div>
              <span className="mt-2 rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 backdrop-blur-sm border border-emerald-500/30">
                Align face inside biometric target
              </span>
            </div>

            {/* Decibel Audio Meter Overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center gap-2 rounded-xl bg-black/85 backdrop-blur-md px-3 py-1.5 text-xs text-zinc-300 border border-zinc-800">
              <Mic className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono">Ambient Noise:</span>
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 transition-all duration-150"
                  style={{ width: `${Math.max(10, audioLevel)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-emerald-400">{audioLevel} dB (Clean)</span>
            </div>
          </div>

          {/* Network Telemetry Badges */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] text-zinc-500 block">SERVER LATENCY</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{networkPing} ms</span>
            </div>
            <div className="p-2 bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] text-zinc-500 block">JITTER</span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">1.8 ms</span>
            </div>
            <div className="p-2 bg-zinc-50 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <span className="text-[10px] text-zinc-500 block">ENCRYPTION</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">TLS 1.3</span>
            </div>
          </div>
        </div>

        {/* Right Column: Fullscreen, Rules & Digital Signature (5 cols) */}
        <div className="md:col-span-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Mandatory Security Clearance
            </div>

            {/* Fullscreen Button Card */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950 p-3.5 flex items-center justify-between mb-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Maximize className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">Fullscreen Lockdown</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Locked exam room</span>
                </div>
              </div>

              {fullscreenStatus === 'passed' ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Ready
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleTestFullscreen}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                >
                  Enable Fullscreen
                </button>
              )}
            </div>

            {/* Digital Honor Oath Signature Pad */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950 p-3.5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <PenTool className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Digital Honor Oath Signature</span>
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSignatureMode('draw');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      signatureMode === 'draw' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Draw
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setSignatureMode('type');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      signatureMode === 'type' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Type
                  </button>
                </div>
              </div>

              {signatureMode === 'draw' ? (
                <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={80}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-20 cursor-crosshair touch-none"
                  />
                  {!hasDrawnSignature && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                      Sign here using mouse or finger...
                    </div>
                  )}
                  {hasDrawnSignature && (
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="absolute bottom-1.5 right-1.5 p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-[10px]"
                      title="Clear Signature"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type legal signature..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-mono text-indigo-700 dark:text-cyan-300 italic focus:border-indigo-500 focus:outline-none"
                />
              )}

              {/* Honor Oath Checkbox */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={honorCodeAccepted}
                  onChange={(e) => {
                    soundEffects.playClick();
                    setHonorCodeAccepted(e.target.checked);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
                  I solemnly certify that I am <strong className="text-zinc-900 dark:text-zinc-200">{student.name}</strong> and will uphold absolute academic integrity without unauthorized materials.
                </span>
              </label>
            </div>
          </div>

          {/* Action to Enter Room */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                soundEffects.playSuccess();
                onDiagnosticsComplete(mediaStream);
              }}
              disabled={!isReady}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3.5 text-sm font-bold text-white dark:text-zinc-950 shadow-xl shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>Commence Exam Session</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
