'use client';

import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Maximize,
  Copy,
  Video,
  Mic,
  Activity,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Play,
  Volume2,
  Terminal,
} from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';

interface SimulationViolation {
  id: string;
  name: string;
  category: string;
  penalty: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  defenseMechanism: string;
}

const SIMULATIONS: SimulationViolation[] = [
  {
    id: 'tab-switch',
    name: 'Tab Switch / Minimize',
    category: 'Browser Guard',
    penalty: 12,
    severity: 'medium',
    description: 'Candidate switched tabs or opened a browser search window.',
    defenseMechanism: 'Page Visibility API records instant focus departure timestamp.',
  },
  {
    id: 'fullscreen-exit',
    name: 'Fullscreen Escape (ESC)',
    category: 'Display Lock',
    penalty: 25,
    severity: 'critical',
    description: 'Candidate pressed ESC to exit fullscreen mode.',
    defenseMechanism: 'HTML5 Fullscreen API fires alarm & starts 10-second auto-disqualify grace period.',
  },
  {
    id: 'clipboard-paste',
    name: 'External Text Paste (Ctrl+V)',
    category: 'Data Lock',
    penalty: 15,
    severity: 'high',
    description: 'Attempted to paste external solution text into answer workspace.',
    defenseMechanism: 'Event interceptor purges clipboard data and cancels OS paste event.',
  },
  {
    id: 'devtools-f12',
    name: 'DevTools Inspection (F12)',
    category: 'Console Lock',
    penalty: 20,
    severity: 'high',
    description: 'Candidate attempted to inspect DOM elements or debug test payload.',
    defenseMechanism: 'F12, Ctrl+Shift+I/J/C, and right-click context menu are suppressed at hardware keydown.',
  },
  {
    id: 'face-departure',
    name: 'Face Departed / Covered',
    category: 'AI Vision',
    penalty: 15,
    severity: 'high',
    description: 'Webcam AI vision detected candidate left the desk or blocked lens.',
    defenseMechanism: 'Continuous biometric neural heuristics track presence and gaze coordinates.',
  },
  {
    id: 'audio-spike',
    name: 'Whispering / Voice Spike',
    category: 'Acoustic AI',
    penalty: 8,
    severity: 'low',
    description: 'Microphone detected background speech (> 68 dB) in testing room.',
    defenseMechanism: 'Web Audio API real-time FFT frequency analyzer flags anomalous voice decibels.',
  },
];

export default function AntiCheatSandbox() {
  const [integrityScore, setIntegrityScore] = useState<number>(100);
  const [strikes, setStrikes] = useState<number>(0);
  const [logs, setLogs] = useState<{ id: string; time: string; text: string; severity: string }[]>([
    {
      id: 'init-1',
      time: '00:00',
      text: 'Sandbox AI Defense Engine initialized. System status: All security guards armed.',
      severity: 'safe',
    },
  ]);
  const [activeSimulation, setActiveSimulation] = useState<SimulationViolation | null>(null);

  const triggerViolation = (sim: SimulationViolation) => {
    soundEffects.playSecurityAlert();

    const newStrikes = strikes + 1;
    const newScore = Math.max(0, integrityScore - sim.penalty);

    setStrikes(newStrikes);
    setIntegrityScore(newScore);
    setActiveSimulation(sim);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setLogs((prev) => [
      {
        id: `sim-log-${Date.now()}`,
        time: timeStr,
        text: `[ALERT] ${sim.name}: ${sim.description}`,
        severity: sim.severity,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const resetSandbox = () => {
    soundEffects.playSuccess();
    setIntegrityScore(100);
    setStrikes(0);
    setActiveSimulation(null);
    setLogs([
      {
        id: `reset-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: 'Sandbox reset. Candidate integrity restored to 100%.',
        severity: 'safe',
      },
    ]);
  };

  return (
    <div className="rounded-3xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-b from-white via-slate-50 to-indigo-50/20 dark:from-indigo-950/40 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Background glowing auras */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-500/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            <Activity className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>Interactive Anti-Cheat Sandbox</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            Test Proctorly's Defense Shields Live
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Simulate cheating attempts below to observe how our heuristics detect, neutralize, and log violations in real time.
          </p>
        </div>

        <button
          onClick={resetSandbox}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Main Grid: Interactive Controls + Live HUD Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Attack Simulation Buttons */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
            Click to Simulate an Anti-Cheat Violation:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SIMULATIONS.map((sim) => (
              <button
                key={sim.id}
                onClick={() => triggerViolation(sim)}
                className="group relative text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/70 p-4 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
                      {sim.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        sim.severity === 'critical'
                          ? 'text-rose-600 dark:text-rose-400'
                          : sim.severity === 'high'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      -{sim.penalty}%
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    {sim.name}
                  </h4>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                    {sim.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Proctorly Interception</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Simulate →
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Defense Details Banner */}
          {activeSimulation && (
            <div className="rounded-2xl border border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-950/30 p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-indigo-950 dark:text-white">
                    Active Defense Triggered: {activeSimulation.name}
                  </h5>
                  <p className="text-xs text-indigo-900/90 dark:text-indigo-200/90 mt-0.5 leading-relaxed">
                    {activeSimulation.defenseMechanism}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Telemetry Gauges & Event Stream */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Integrity Score Radial / Gauge Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/80 p-5 text-center flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Simulated Candidate Integrity</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">LIVE GAUGING</span>
            </div>

            {/* Gauge Number & Progress Bar */}
            <div className="my-2">
              <div
                className={`text-5xl font-black font-mono transition-all duration-300 ${
                  integrityScore >= 85
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : integrityScore >= 60
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400 animate-pulse'
                }`}
              >
                {integrityScore}%
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {integrityScore >= 85
                  ? 'Candidate Certified Clean'
                  : integrityScore >= 60
                  ? 'Integrity Warning Flagged'
                  : 'High-Risk: Disqualification Threshold Exceeded'}
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-3 p-0.5 border border-zinc-200 dark:border-zinc-700/50">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  integrityScore >= 85
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                    : integrityScore >= 60
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-rose-500 to-red-600'
                }`}
                style={{ width: `${integrityScore}%` }}
              />
            </div>

            {/* Strikes Counter */}
            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-600 dark:text-zinc-400">Security Strikes:</span>
              <span className={`font-bold ${strikes >= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-200'}`}>
                {strikes} / 5 Maximum
              </span>
            </div>
          </div>

          {/* Real-time Event Terminal Log */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/90 p-4 font-mono text-xs flex-1 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-300 font-semibold">
                  <Terminal className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Heuristics Event Log</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`text-[11px] leading-tight flex items-start gap-1.5 ${
                      log.severity === 'critical'
                        ? 'text-rose-600 dark:text-rose-400'
                        : log.severity === 'high'
                        ? 'text-amber-600 dark:text-amber-400'
                        : log.severity === 'medium'
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="text-zinc-400 dark:text-zinc-600 text-[10px] select-none">[{log.time}]</span>
                    <span className="flex-1">{log.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800/60 text-[10px] text-zinc-500 flex justify-between items-center">
              <span>Encrypted SHA-256 Audit Trail</span>
              <span>Zero False Positives</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
