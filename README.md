# Proctorly 🛡️ — Two-Sided Zero-Trust Online Examination Platform

Proctorly is a high-security, zero-trust online assessment and live surveillance platform designed for universities, academic institutions, and credentialing boards. It combines a strictly locked-down client examination room with biometric tracking, and a real-time professor command center with multi-camera surveillance grids, cohort intercom broadcasting, and omnichannel test distribution.

---

## 🚀 Key Architectural Pillars

### 1. Dual-Sided Experience
- **Student Examination Portal (`/` and `/exam/[id]`)**:
  - **Instant Check-in**: Access tests via 6-character PIN, direct URL slug, or dynamic QR scan.
  - **Pre-Exam System Diagnostics**: Biometric facial framing guide, decibel microphone noise floor calibration, server network ping latency monitor, and HTML5 canvas digital honor oath signature pad.
  - **Secure Anti-Cheat Exam Room**: HUD video PIP with biometric targeting reticle, countdown timer with tick alarms, question navigator, and dynamic forensic watermark protection.
  - **Student Focus Utilities**: Built-in floating scratchpad for rough work, pop-out scientific calculator, font size scaler (`A` / `A+` / `A++`), and Zen Focus concentration mode.
  - **Certified Credential View**: Gold holographic academic integrity medallion (`.hologram-card`), dynamic certificate verification QR badge, SHA-256 hash digest, and printable official diploma slip.

- **Professor Command Hub (`/professor`)**:
  - **Exam Creator with AI Presets**: Syllabus builder, one-click academic preset templates, and live security strength rating meter.
  - **Omnichannel Sharing Suite**: Direct clean URL links, dynamic high-res QR code generator, 6-character PIN dispenser, printable student desk vouchers, LMS `<iframe>` embeds, and Google Classroom/Teams broadcast links.
  - **Live Proctoring Command Center**: Real-time surveillance grid of candidate webcams, thermal IR / matrix / biometric mesh camera filters, cohort intercom broadcast to all candidates, spotlight mode on highest-risk examinees, and remote +5m time extension / disqualification controls.
  - **Forensic Results & Audits**: Candidate submission breakdown, chronological violation history, and 1-click CSV export.

---

## 🎨 Creative Design & Interactive Features

| Creative Feature | Description |
| :--- | :--- |
| **Dual Light & Dark Mode Engine** | Seamless client-side theme switcher in the Navbar with localStorage persistence and zero-hydration flash. Designed with diffuse ambient gradients (`mesh-gradient-light`, `mesh-gradient-dark`), layered card elevations, and frosted glass, replacing heavy retro grids with a sleek, accessible modern interface. |
| **Interactive Anti-Cheat Sandbox** | Live testing playground on the landing page where visitors simulate tab switches, Alt-Tab blur, clipboard pastes, F12 inspects, and noise spikes, watching the integrity gauge drop and recover. |
| **Web Audio Synthesizer Engine** | Zero-dependency browser-synthesized audio cues (soft sci-fi UI clicks, success chimes, pulsed alarm buzzers on security breaches, and mechanical countdown clock ticks). Toggleable via Navbar. |
| **Biometric Face Wireframe HUD** | Real-time SVG targeting crosshairs, animated laser scanning lines, gaze vector indicators, and AI confidence telemetry on the candidate video PIP. |
| **Digital Honor Oath Signature Pad** | Interactive HTML5 canvas where students draw their legal signature with touch/mouse (or type name) before unlocking the test room. |
| **Gold Holographic Integrity Seal** | Dynamic shiny holographic medallion with light-sheen reflection and cryptographic verification QR badge on the submission certificate. |
| **Student Scratchpad & Calculator** | Built-in collapsible private notepad for rough work and a full-featured pop-out scientific calculator for STEM assessments. |
| **Cohort Intercom Broadcast** | Instructor tool to transmit real-time directives or time warnings to all active student screens simultaneously. |
| **Thermal IR & Surveillance Filters** | Real-time visual filter toggles for proctors: Standard, Night-Vision Thermal IR, and Biometric Neural Mesh. |

---

## 🔒 Comprehensive Anti-Cheating Defenses

| Anti-Cheat Feature | Implementation & Enforcement |
| :--- | :--- |
| **True Fullscreen Enforcement** | Enforces HTML5 Fullscreen API. Exiting triggers an emergency alarm, logs a violation, and starts a 10-second auto-disqualification grace countdown. |
| **Tab Switch & Visibility Guard** | Page Visibility API detects when the candidate switches tabs or minimizes the browser. |
| **Window Blur & Dual-Monitor Detection** | Detects window focus loss, Alt-Tab attempts, or mouse movement to a secondary monitor. |
| **Clipboard Lockout** | `copy`, `cut`, and `paste` events are intercepted and blocked with security incident logging. |
| **DevTools & Shortcut Interception** | Disables `F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Cmd+Option+I`, `Ctrl+U` (View Source), `Ctrl+P`, and `PrintScreen`. |
| **Right-Click / Context Menu Block** | Prevents right-click inspection and developer tools menus. |
| **AI Face & Presence Tracking** | Webcam stream analysis verifies candidate presence, head pose alignment, and detects looking away or camera obstruction. |
| **Decibel & Speech Noise Monitor** | Web Audio API (`AudioContext` + `AnalyserNode`) measures real-time ambient noise, detecting whispered answers or secondary room speech. |
| **Forensic Dynamic Watermark** | Semi-transparent repeating watermark with student name, ID, and timestamp overlays the exam viewport to deter external phone photos or leak attempts. |
| **Auto-Disqualification Limit** | Strict configurable strike limit (e.g. 5 violations). Reaching this threshold immediately locks and auto-submits the exam as disqualified. |
| **Cross-Tab Synchronized Live Control** | Professor commands (live warning alerts, +5m time grant, force submit) are broadcast instantly to the student HUD via `BroadcastChannel`. |

---

## 🌐 Omnichannel Professor Sharing Suite

1. **Direct Link Generation**:
   - Clean, shareable URL with optional custom slug (`/exam/cs350-fall-midterm`).
   - One-click copy with automatic parameter pre-filling.
2. **High-Resolution Dynamic QR Code**:
   - Generated dynamically with SVG/PNG download.
   - Ideal for displaying on lecture hall projectors or physical auditoriums.
3. **6-Character Access Code (PIN)**:
   - Big, bold PIN (e.g., `OS-8821` or `BIO-4402`).
   - One-click PIN regeneration and copy.
4. **Printable Exam Desk Slips / Vouchers**:
   - Generates a printer-ready admissions slip with QR code, access code, rules, and candidate instructions for test center desks.
5. **Batch Student Email Invitations**:
   - Pre-composed invitation email template with exam details, anti-cheat requirements, and join links for batch rosters.
6. **LMS Embed Snippet (`<iframe>`)**:
   - Responsive embed code pre-configured with camera, microphone, and fullscreen permissions for Canvas, Blackboard, Moodle, and Google Classroom.
7. **One-Click Classroom Broadcast**:
   - Direct integration links for Google Classroom and Microsoft Teams.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript 5
- **Theming & Styling**: Tailwind CSS v4 with dual Light & Dark mode support, diffuse ambient mesh gradients, layered elevations, and custom keyframes
- **Theming Provider**: Custom zero-flash `ThemeProvider` (`lib/themeContext.tsx`)
- **Icons**: Lucide React
- **Audio Engine**: Custom Web Audio API Synthesizer (`lib/soundEffects.ts`)
- **QR Engine**: `qrcode`
- **State & Synchronization**: Custom reactive store with `localStorage` and HTML5 `BroadcastChannel` for instant multi-window real-time updates.

---

## 🏁 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

### Quick Demo Exams (Preloaded):
- **CS 350: Operating Systems Midterm** — Access PIN: `OS-8821` (Passcode: `SYS2026`)
- **BIO 210: Molecular Genetics Quiz** — Access PIN: `BIO-4402`
- **CYBER 402: Zero-Trust Final** — Available via Exam Creator Templates
