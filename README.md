# Proctorly 🛡️ — Two-Sided Online Examination Platform

Proctorly is a secure, zero-trust online assessment and proctoring platform designed for academic institutions and universities. It features an isolated, strictly monitored test environment for students and a real-time surveillance, distribution, and grading command center for professors.

---

## 🚀 Key Architectural Pillars

### 1. Dual-Sided Experience
- **Student Portal (`/` and `/exam/[id]`)**:
  - Access test via 6-character PIN, direct URL, or QR code scan.
  - Pre-Exam System Diagnostics (Webcam framing check, microphone decibel test, fullscreen lock test, Academic Honor Oath).
  - Secure Anti-Cheat Exam Room with HUD video PIP, countdown timer, question navigator, and dynamic watermark protection.
  - Certified submission screen with academic integrity rating, digital SHA-256 certificate hash, and printable report.
- **Professor / Proctor Hub (`/professor`)**:
  - **Exam Management**: Create, edit, and distribute assessments with tailored anti-cheat policies.
  - **Omnichannel Sharing Suite**: Link generator, dynamic QR codes, access PINs, batch email invitations, printable desk vouchers, and LMS `<iframe>` embeds.
  - **Live Proctoring Command Center**: Real-time grid of candidate webcams, live audio meters, face status tags, proctor broadcast warning sender, and remote disqualification / time extension controls.
  - **Forensic Results & Audits**: Candidate submission breakdown, chronological violation history, and CSV export.

---

## 🔒 Comprehensive Anti-Cheating Defenses

Proctorly includes an extensive suite of browser and AI-driven anti-cheating mechanisms:

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

Professors have the most extensive set of distribution tools available:

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
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
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
