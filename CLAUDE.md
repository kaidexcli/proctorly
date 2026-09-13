@AGENTS.md

# Proctorly 🛡️ — Development & Context Guide for Claude

## Overview
Proctorly is a dual-sided, zero-trust online examination and live surveillance web application built with Next.js 16 (Turbopack, App Router), React 19, TypeScript 5, and Tailwind CSS v4.

## Key Architectures & Flows
1. **Student Side (`/` and `/exam/[id]`)**:
   - `ExamJoinCard`: PIN/code lookup and candidate identification.
   - `PreExamDiagnostics`: Hardware check (webcam, mic, network ping, fullscreen, digital signature pad, honor oath).
   - `SecureExamRoom`: Fullscreen enforcement, DevTools/F12 block, copy/paste interception, dynamic watermark, webcam PIP with biometric reticle, floating scratchpad, pop-out scientific calculator.
   - `ExamSubmissionSuccess`: Gold holographic seal, QR verification code, printable certificate.

2. **Professor Side (`/professor`)**:
   - `ExamCreatorModal`: Syllabus builder, preset templates, dynamic security rating gauge.
   - `ShareExamModal`: Omnichannel sharing (dynamic QR PNG download, printable desk voucher slips, PIN generator, LMS embed iframe, batch email invites).
   - `LiveProctoringDashboard`: Multi-candidate camera feeds, thermal IR / matrix / biometric mesh filters, cohort intercom announcement broadcast, spotlight mode.
   - `ExamResultsView`: Submissions table, forensic violation audits, CSV export.

3. **Core Libraries**:
   - `lib/examStore.ts`: Cross-tab synchronization via `localStorage` and HTML5 `BroadcastChannel`.
   - `lib/antiCheatService.ts`: Keyboard, visibility, fullscreen, right-click, audio analyzer heuristics.
   - `lib/soundEffects.ts`: Web Audio API synthesizer for UI clicks, alarms, and chimes.
   - `lib/themeContext.tsx`: Zero-hydration-flash dual Light and Dark theme provider with local storage persistence.

## Common Commands
```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Compile for production & type check
npm run start    # Start production server
npm run lint     # Lint check
```

## Conventions
- Always preserve the Next.js rule block in `AGENTS.md` as required by `next dev`.
- Prefer React functional components with `'use client'` when browser APIs (Web Audio, Canvas, Fullscreen, BroadcastChannel) are utilized.
- Support dual Light and Dark themes with zero-hydration flash (`useTheme`, `dark:` classes), diffuse ambient mesh gradients (`mesh-gradient-light`, `mesh-gradient-dark`), and subtle modern card elevations without heavy cyber grid patterns.
