# Proctorly 🛡️ — Gemini Project & Architectural Context Guide

This document serves as the master architectural and development reference for **Proctorly**, a modern, zero-trust online examination, proctoring, and test distribution platform.

---

## 🏛️ High-Level System Architecture

Proctorly is engineered as a **dual-sided platform**:
1. **Student Exam Portal (`/` and `/exam/[id]`)**:
   - Zero-installation, pure web-based assessment environment.
   - Enforces active hardware lockdowns, browser heuristics, dynamic forensic watermarks, and AI presence tracking.
2. **Professor Command Center (`/professor`)**:
   - Real-time candidate surveillance, multi-camera grid, and cohort intercom broadcast.
   - Omnichannel test distribution suite (dynamic QR, access PINs, printable test slips, LMS embeds).
   - Forensic audit trail and academic integrity certification.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROCTORLY ARCHITECTURE                          │
├───────────────────────────────────┬────────────────────────────────────┤
│          STUDENT PORTAL           │       PROFESSOR COMMAND HUB        │
│  - Access PIN / QR Code Check-In  │  - Proctored Exam Creator          │
│  - Hardware & Biometric Scanner   │  - Omnichannel Distribution Suite  │
│  - Digital Honor Oath Signature   │  - Live Surveillance Grid          │
│  - Fullscreen Anti-Cheat Room     │  - Cohort Intercom Broadcast       │
│  - On-Screen Scratchpad & Calc    │  - Real-Time Time Grant (+5m)      │
│  - Holographic Certificate & QR   │  - Forensic Audit & CSV Reports    │
└───────────────────────────────────┴────────────────────────────────────┘
                               ▲
                               │ HTML5 BroadcastChannel ('proctorly_sync_channel')
                               │ Reactive LocalStorage Sync ('lib/examStore.ts')
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│               SHARED DEFENSE & STATE SYNCHRONIZATION                   │
│  - Anti-Cheat Heuristics Engine ('lib/antiCheatService.ts')            │
│  - Web Audio API Sound Synthesizer ('lib/soundEffects.ts')             │
│  - Dynamic QR Generator Engine ('qrcode')                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Creative Design Features

1. **Dual Theme Engine & Ambient Mesh Gradients (`lib/themeContext.tsx`, `app/globals.css`)**:
   - Zero-hydration-flash ThemeProvider supporting seamless switching between Light and Dark modes.
   - Replaced retro cyber grid lines with modern design techniques: diffuse ambient mesh gradients (`.mesh-gradient-light`, `.mesh-gradient-dark`), layered frosted glass (`backdrop-blur-xl`), elevated card surfaces, and contrast-compliant accessibility palettes.

2. **Interactive Anti-Cheat Sandbox (`components/common/AntiCheatSandbox.tsx`)**:
   - Live testing playground on the landing page where visitors can trigger simulated violations (Tab Switch, Alt-Tab blur, Clipboard paste, F12 inspect, Noise spike, Face departure).
   - Real-time radial integrity gauge, audio alarm feedback, and heuristics event stream with full light/dark theme adaptation.

3. **Zero-Dependency Web Audio Synthesizer (`lib/soundEffects.ts`)**:
   - Synthesizes sci-fi HUD clicks, pleasant ascending chimes on correct answers/success, pulsed alarms on security breaches, and soft ticks for final countdowns.
   - Fully toggleable via Navbar and exam HUD.

4. **Biometric Face Wireframe HUD (`components/student/SecureExamRoom.tsx`)**:
   - Real-time SVG targeting crosshairs, bounding reticle, gaze stability vectors, and animated laser scanning lines.

5. **On-Screen Examination Utilities**:
   - **Student Scratchpad (`components/student/ExamScratchpad.tsx`)**: Collapsible notepad for formulas and code notes with auto-saving to local storage.
   - **Pop-Out Exam Calculator (`components/student/ExamCalculator.tsx`)**: Scientific on-screen calculator supporting trigonometry, roots, powers, and logarithms.
   - **Accessibility & Focus Controls**: Font scaler (`A`, `A+`, `A++`) and Zen Focus Mode.

6. **Certified Submission Credential (`components/student/ExamSubmissionSuccess.tsx`)**:
   - Gold holographic academic integrity medallion with light-sheen reflection (`.hologram-card`).
   - Dynamic QR verification code encoding candidate session SHA-256 digest.
   - Printable certificate formatted for academic credential portfolios.

7. **Cohort Intercom & Multi-View Surveillance (`components/professor/LiveProctoringDashboard.tsx`)**:
   - Real-time intercom broadcast tool to send synchronized directives to all active examinees.
   - Multi-view modes: Grid 3x3, Highest-Risk Spotlight Mode, and Compact Audit Table.
   - Thermal IR matrix and Biometric Mesh visual camera filters.

---

## 📂 Project Directory Structure

```
proctorly/
├── app/
│   ├── exam/[id]/page.tsx       # Student exam lifecycle coordinator
│   ├── professor/page.tsx       # Instructor command center & tab switcher
│   ├── globals.css              # Ambient mesh gradients, keyframes, scrollbars
│   ├── layout.tsx               # Root layout with Geist font, anti-flash script & ThemeProvider
│   └── page.tsx                 # Landing page with Sandbox & Comparison Matrix
├── components/
│   ├── Navbar.tsx               # Header with Theme toggle, Audio FX toggle & Architecture modal
│   ├── common/
│   │   └── AntiCheatSandbox.tsx # Interactive violation testing playground
│   ├── professor/
│   │   ├── ExamCreatorModal.tsx # Preset template loader & security strength meter
│   │   ├── ExamList.tsx         # Exam cards with quick actions
│   │   ├── ExamResultsView.tsx  # Submissions table, audit modal, CSV export
│   │   ├── LiveProctoringDashboard.tsx # Surveillance grid, filters & intercom
│   │   └── ShareExamModal.tsx   # Omnichannel suite (QR, PIN, slip, LMS embed)
│   └── student/
│       ├── ExamCalculator.tsx   # Pop-out mathematical calculator
│       ├── ExamJoinCard.tsx     # PIN entry with instant validation
│       ├── ExamScratchpad.tsx   # Private rough work notepad drawer
│       ├── ExamSubmissionSuccess.tsx # Holographic diploma & verification QR
│       ├── PreExamDiagnostics.tsx    # Biometric framing, ping & signature pad
│       └── SecureExamRoom.tsx        # Anti-cheat viewport, HUD PIP, navigator
├── lib/
│   ├── antiCheatService.ts      # Browser lockdown & event interceptors
│   ├── examStore.ts             # Reactive store with BroadcastChannel sync
│   ├── mockData.ts              # Pre-seeded university exams & candidate sessions
│   ├── soundEffects.ts          # Web Audio API sound generator
│   └── themeContext.tsx         # Zero-flash dual light/dark theme provider
├── types/
│   └── exam.ts                  # Core TypeScript schemas for exams & sessions
├── AGENTS.md                    # Next.js agent rules & general agent guidelines
├── CLAUDE.md                    # Developer shortcuts & operational guidelines
├── GEMINI.md                    # This architectural reference
└── README.md                    # Public documentation
```

---

## ⚡ Data Synchronization Engine (`lib/examStore.ts`)

Proctorly uses a cross-window reactive store:
- Backed by `localStorage` for fast offline/local persistence.
- Powered by HTML5 `BroadcastChannel('proctorly_sync_channel')` for instantaneous inter-tab messaging.
- Enables multi-window demos: opening the student exam in one tab and the professor dashboard in another allows actions (strikes, warnings, time grants, force submissions) to reflect instantly without polling.

---

## 🛠️ Operational Commands

```bash
# Start Turbopack development server
npm run dev

# Run full production compilation & TypeScript checks
npm run build

# Start production server
npm start

# Run ESLint validation
npm run lint
```
