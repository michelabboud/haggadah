# Pesach Haggadah

An elegant, offline-first Passover Haggadah built with React, Vite, and Capacitor. The project pairs a parchment-inspired reading experience with practical Seder tools: bilingual text, phonetic transliteration, text-to-speech, navigation aids, and a mobile-friendly layout designed to work even without internet access.

## Live App

Use the published GitHub Pages site here:

**https://michelabboud.github.io/haggadah/**

Feel free to use it for your Seder, share it with others, and contribute improvements back to the project.

## Highlights

- Complete traditional Haggadah content in Hebrew and English
- Plain reading mode and 3D page-flip mode
- Phonetic transliteration for easier participation
- Hebrew text-to-speech support
- Auto-scroll, table of contents, and Seder step tracking
- Offline PWA support for low-connectivity use
- Android packaging through Capacitor

## Quick Start

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build the web app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Build the standalone single-file edition:

```bash
VITE_SINGLEFILE=true npm run build
```

## Project Layout

- `src/`: React UI, styles, and Haggadah rendering logic
- `src/data/haggadah_full.json`: main bilingual source text
- `public/images/`: bundled artwork and static assets
- `android/`: Capacitor Android project
- `.github/workflows/`: GitHub Pages, APK, and single-file build automation

## Data Utilities

Refresh the source text from Sefaria:

```bash
node fetch_haggadah_full.mjs
```

Regenerate transliteration fields:

```bash
node transliterate.mjs
```

## Contributing

Issues, fixes, design improvements, text cleanup, accessibility work, and feature ideas are all welcome. If you change behavior or UI, include clear notes and screenshots in your pull request so reviewers can verify the impact quickly.

---

Chag Pesach Sameach v'Kasher. חג פסח כשר ושמח.
