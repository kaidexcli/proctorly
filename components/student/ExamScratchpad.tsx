'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, X, FileText, Check } from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';

interface ExamScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
}

export default function ExamScratchpad({ isOpen, onClose, examId }: ExamScratchpadProps) {
  const storageKey = `proctorly_scratchpad_${examId}`;
  const [notes, setNotes] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(storageKey);
      if (cached) setNotes(cached);
    }
  }, [storageKey]);

  const handleChange = (val: string) => {
    setNotes(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, val);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 1500);
    }
  };

  const handleClear = () => {
    if (confirm('Clear scratchpad content?')) {
      setNotes('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 sm:w-96 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-slate-50/90 dark:bg-zinc-950/80">
        <div className="flex items-center gap-2">
          <Edit3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            Student Scratchpad
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {savedStatus && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
          <button
            onClick={handleClear}
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Clear Scratchpad"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <textarea
          rows={8}
          placeholder="Draft thoughts, working formulas, or code scratch notes here... (Auto-saved, private to you)"
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 dark:border-zinc-800/80 px-4 py-2 bg-slate-50/60 dark:bg-zinc-950/50 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
        <span>Characters: {notes.length}</span>
        <span>Secure Local Storage</span>
      </div>
    </div>
  );
}
