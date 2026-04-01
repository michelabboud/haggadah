# GEMINI.md - Haggadah Project Context

This file provides foundational context and instructions for AI agents working on the **Haggadah** project.

## Project Overview
A premium, offline-first Passover Haggadah web and mobile application. It features a bilingual (Hebrew/English) reading experience with a parchment-inspired UI, 3D page-flip animations, phonetic transliteration, and text-to-speech capabilities.

- **Primary Technologies:** React (19+), Vite, Capacitor, Vanilla CSS.
- **Key Features:** 
  - Bilingual text (Hebrew/English) from Sefaria.
  - 3D Book Mode using `react-pageflip`.
  - Phonetic transliteration toggle.
  - Native and Web Text-to-Speech (TTS) for Hebrew.
  - "Read By" assignment tags (stored in `localStorage`).
  - Interactive Seder Plate/Table of Contents progress tracking.
  - Deep-Night "Vellum" Mode (dark theme).

## Architecture & Module Organization
- `src/`: Core React application.
  - `App.jsx`: Main entry point containing UI logic, reader controls, and state management.
  - `main.jsx`: Bootstraps the React app and handles native WebView cache clearing.
  - `index.css`: Defines the global parchment-themed styling and variables.
  - `data/`:
    - `haggadah_full.json`: The canonical JSON source for the Haggadah text.
    - `haggadah.js`: Older seed data (deprecated/reference).
- `public/images/`: Static assets and themed artwork.
- `android/`: Capacitor Android wrapper project.
- `docs/plans/`: Technical implementation plans for new features.
- `.github/workflows/`: CI/CD for APK builds, GitHub Pages, and single-file distributions.

## Build, Test, and Development Commands
- `npm run dev`: Start local Vite development server.
- `npm run build`: Generate a standard PWA production build in `dist/`.
- `npm run build:pages`: Build specifically for GitHub Pages deployment.
- `VITE_SINGLEFILE=true npm run build`: Create a standalone single-file distribution.
- `npm run build:android`: Build the web app and sync it with the Android project.
- `npx cap sync android`: Sync web assets to the Android platform.
- `npm run preview`: Locally preview the production build.
- `node fetch_haggadah_full.mjs`: Refresh Haggadah text from the Sefaria API.
- `node transliterate.mjs`: Regenerate transliteration fields in `haggadah_full.json`.

## Development Conventions
- **Coding Style:** Functional components, ES modules, and 2-space indentation.
- **Naming:** `PascalCase` for React components, `camelCase` for helpers/state, and `UPPER_SNAKE_CASE` for constants (e.g., `SEDER_STEPS`).
- **Styling:** Prefer Vanilla CSS for flexibility. Use the `.theme-dark` class on the body for night mode.
- **State Management:** Primarily uses React `useState` and `useRef`. Persistent user settings (assignments, theme) are stored in `localStorage`.
- **Text-to-Speech:** Uses `@capacitor-community/text-to-speech` for native platforms and the Web Speech API for browsers.
- **Data Integrity:** `haggadah_full.json` is the source of truth. Any changes to the text should be reflected there.
- **Testing:** No formal JS test suite exists yet. Manual verification of UI, language toggles, and 3D mode is required.

## Maintenance Notes
- **Dist Directory:** The `dist/` directory is currently tracked in git to simplify deployments.
- **Images:** Image assets use lowercase underscore naming (e.g., `seder_plate_webp_...`).
- **Guidelines:** Refer to `AGENTS.md` for detailed repository-specific instructions.
