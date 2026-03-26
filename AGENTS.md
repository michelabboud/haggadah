# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the React app. [`src/App.jsx`](/Users/Michel.Abboud/projects/haggadah/src/App.jsx) holds most UI and reader logic, [`src/main.jsx`](/Users/Michel.Abboud/projects/haggadah/src/main.jsx) bootstraps React, and [`src/index.css`](/Users/Michel.Abboud/projects/haggadah/src/index.css) defines the parchment-themed styling. Canonical text content lives in [`src/data/haggadah_full.json`](/Users/Michel.Abboud/projects/haggadah/src/data/haggadah_full.json); [`src/data/haggadah.js`](/Users/Michel.Abboud/projects/haggadah/src/data/haggadah.js) is older seed-style data. Static images live in `public/images/`. `dist/` is generated web output and is currently committed. `android/` contains the Capacitor Android wrapper. Planning notes live in `docs/plans/`.

## Build, Test, and Development Commands
Use `npm run dev` for local development with Vite. Use `npm run build` to generate the standard PWA build in `dist/`, and `npm run preview` to smoke-test the production bundle locally. Use `VITE_SINGLEFILE=true npm run build` when preparing the standalone single-file distribution described in the README. Data maintenance scripts are run directly: `node fetch_haggadah_full.mjs` refreshes source text from Sefaria, and `node transliterate.mjs` regenerates transliteration fields inside `src/data/haggadah_full.json`.

## Coding Style & Naming Conventions
Follow the existing React style: functional components, ES modules, and 2-space indentation in JSX, CSS, and Vite config. Use `PascalCase` for components, `camelCase` for helpers and state, and `UPPER_SNAKE_CASE` for shared constants such as `SEDER_STEPS`. Prefer single-responsibility helpers over deeply nested render logic. Keep asset names descriptive and stable; current image files use lowercase words joined by underscores.

## Testing Guidelines
There is no dedicated JavaScript test suite yet. For UI changes, run `npm run build` and `npm run preview`, then manually verify language toggles, scrolling, offline/PWA behavior, and mobile layout. Android template tests live under `android/app/src/test/` and `android/app/src/androidTest/`; update them only when native behavior changes.

## Commit & Pull Request Guidelines
The existing history uses concise, conventional subjects such as `chore(release): v2.0.0 ...`. Continue with imperative Conventional Commit style where practical: `feat:`, `fix:`, `chore:`. Pull requests should explain user-facing impact, list verification steps, and include screenshots or short recordings for visual changes. If you modify generated output, note whether `dist/` and Android artifacts were intentionally refreshed.
