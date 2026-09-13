'use client';

import React, { useState } from 'react';
import { Calculator as CalcIcon, X, Delete } from 'lucide-react';
import { soundEffects } from '@/lib/soundEffects';

interface ExamCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExamCalculator({ isOpen, onClose }: ExamCalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleBtn = (val: string) => {
    soundEffects.playClick();
    if (display === '0' && !isNaN(Number(val))) {
      setDisplay(val);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const handleClear = () => {
    soundEffects.playClick();
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    soundEffects.playClick();
    if (display.length <= 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleCalculate = () => {
    soundEffects.playClick();
    try {
      // Safe mathematical evaluation for simple expressions
      const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
      // allow only safe digits and math symbols
      if (/^[0-9+\-*/(). ]+$/.test(sanitized)) {
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setEquation(display + ' =');
        setDisplay(String(Math.round(res * 100000) / 100000));
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const handleMathFunc = (fn: 'sqrt' | 'sq' | 'sin' | 'cos' | 'tan' | 'log') => {
    soundEffects.playClick();
    try {
      const num = Number(display);
      let res = 0;
      if (fn === 'sqrt') res = Math.sqrt(num);
      else if (fn === 'sq') res = Math.pow(num, 2);
      else if (fn === 'sin') res = Math.sin((num * Math.PI) / 180);
      else if (fn === 'cos') res = Math.cos((num * Math.PI) / 180);
      else if (fn === 'tan') res = Math.tan((num * Math.PI) / 180);
      else if (fn === 'log') res = Math.log10(num);
      setEquation(`${fn}(${display}) =`);
      setDisplay(String(Math.round(res * 100000) / 100000));
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 w-72 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5 bg-slate-50/90 dark:bg-zinc-950/80">
        <div className="flex items-center gap-2">
          <CalcIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            Exam Calculator
          </span>
        </div>
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

      {/* Screen */}
      <div className="p-3 bg-zinc-100 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800/80 text-right font-mono">
        <div className="h-4 text-[11px] text-zinc-500 overflow-hidden truncate">{equation}</div>
        <div className="text-2xl font-black text-zinc-900 dark:text-white overflow-x-auto truncate">{display}</div>
      </div>

      {/* Keys */}
      <div className="p-3 grid grid-cols-4 gap-1.5 text-xs font-mono font-bold">
        <button
          onClick={() => handleMathFunc('sqrt')}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px]"
        >
          √
        </button>
        <button
          onClick={() => handleMathFunc('sq')}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px]"
        >
          x²
        </button>
        <button
          onClick={handleClear}
          className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/80"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center"
        >
          <Delete className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => handleMathFunc('sin')}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px]"
        >
          sin
        </button>
        <button
          onClick={() => handleMathFunc('cos')}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px]"
        >
          cos
        </button>
        <button
          onClick={() => handleBtn('(')}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          (
        </button>
        <button
          onClick={() => handleBtn(')')}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          )
        </button>

        <button
          onClick={() => handleBtn('7')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          7
        </button>
        <button
          onClick={() => handleBtn('8')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          8
        </button>
        <button
          onClick={() => handleBtn('9')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          9
        </button>
        <button
          onClick={() => handleBtn('÷')}
          className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-transparent"
        >
          ÷
        </button>

        <button
          onClick={() => handleBtn('4')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          4
        </button>
        <button
          onClick={() => handleBtn('5')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          5
        </button>
        <button
          onClick={() => handleBtn('6')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          6
        </button>
        <button
          onClick={() => handleBtn('×')}
          className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-transparent"
        >
          ×
        </button>

        <button
          onClick={() => handleBtn('1')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          1
        </button>
        <button
          onClick={() => handleBtn('2')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          2
        </button>
        <button
          onClick={() => handleBtn('3')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          3
        </button>
        <button
          onClick={() => handleBtn('-')}
          className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-transparent"
        >
          -
        </button>

        <button
          onClick={() => handleBtn('0')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          0
        </button>
        <button
          onClick={() => handleBtn('.')}
          className="p-2.5 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm"
        >
          .
        </button>
        <button
          onClick={handleCalculate}
          className="p-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-black shadow-sm"
        >
          =
        </button>
        <button
          onClick={() => handleBtn('+')}
          className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-transparent"
        >
          +
        </button>
      </div>
    </div>
  );
}
