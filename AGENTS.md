<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Proctorly — Agent Guidelines & System Context

## Project Mission
Proctorly is a high-security, zero-trust online assessment and AI surveillance platform designed for universities and academic organizations. It features a locked-down client examination environment and a real-time professor monitoring grid.

## Architectural Guidelines
1. **Next.js 16 App Router**: Keep route pages in `app/` clean by encapsulating UI logic into modular components under `components/student/`, `components/professor/`, and `components/common/`.
2. **State & Real-time Sync**: The state manager in `lib/examStore.ts` orchestrates cross-tab reactivity using `localStorage` and HTML5 `BroadcastChannel`. Avoid replacing this with heavy backend state unless explicitly asked.
3. **Anti-Cheat Heuristics**: Maintained in `lib/antiCheatService.ts`. Must handle browser visibility changes, fullscreen transitions, keyboard interceptors (F12, DevTools, shortcuts), and Web Audio API decibel analysis without leaking resources.
4. **Sound System**: `lib/soundEffects.ts` synthesizes UI audio cues in-browser using Web Audio API without external static audio files. Keep audio volume non-intrusive and adhere to the global mute state.
5. **Styling & Theming Standards**: Full dual Light and Dark mode support (`lib/themeContext.tsx`), Tailwind CSS v4, diffuse ambient mesh gradients (`mesh-gradient-light`, `mesh-gradient-dark`), layered card elevations, and accessibility contrast standards without heavy retro cyber grid patterns.
