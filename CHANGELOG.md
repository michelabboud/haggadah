# Changelog

## [2.0.3] - 2026-03-26
### Fixed
- **Android APK Runtime**: Removed the PWA/service-worker runtime from the app build, cleared stale native WebView caches on startup, and rebuilt the Android asset bundle to address the blank white screen in the APK.
- **Android Branding**: Renamed the app from `Pesach` to `Haggadah` and replaced the launcher icon set with a generated icon based on the project artwork.
- **Dependency Install Path**: Removed the legacy-only PWA dependency chain so `npm install` and `npm ci` now succeed without `--legacy-peer-deps`.

## [2.0.2] - 2026-03-26
### Fixed
- **Mobile Reading Experience**: Disabled 3D Book mode on phones and forced the mobile app into the plain reading layout for a more stable, readable experience.

## [2.0.1] - 2026-03-26
### Fixed
- **Android Voice Playback**: Switched the Capacitor app to native text-to-speech via `@capacitor-community/text-to-speech`, so Hebrew narration works in the Android APK instead of relying on the WebView speech API.
- **Compact Mobile Navigation**: Collapsed the fixed top navigation into a tighter two-row mobile layout with smaller controls that preserve the main reading area.
- **Voice Controls by Platform**: Kept pause and resume on web, while simplifying native mobile playback controls to stop-only where pause support is unavailable.

## [2.0.0] - 2026-03-26
### Added
- **Dual Mode UI**: Introduced a native 3D Page Flipping Book view alongside the classic Plain scroll view.
- **Dark 'Vellum' Night Mode**: A gorgeous espresso-brown high-contrast night theme to prevent eye strain.
- **Interactive Seder Minimap**: A sticky tracker and sliding Table of Contents Drawer mapping the 15 Seder steps.
- **Phonetic Transliteration**: Full Hebrew-to-English phonetic transliteration for chanting pronunciation.
- **Zero-Bandwidth Audio**: HTML5 Text-To-Speech implementation for Hebrew dictation of passages.
- **Read-By Assignments**: Local state save-able tag interface to distribute reading parts among guests.
- **Rabbinic Insights**: Curated expandable Midrashic commentary on critical sections like the Four Questions.

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-03-26

### Added
- Complete unabridged bilingual text of the Passover Haggadah parsed locally from Sefaria API arrays.
- Implemented "Lite Ancient Bible" UI theme with parchment backgrounds, sepia text, and classical serif typography.
- Built automatic dynamic layout logic: Image banners anchor Left for English, Right for Hebrew, and both sides for simultaneous viewing.
- Added AI-generated thematic ancient illustrations (Seder Plate, Exodus, Matzah, Menorah, Ancient Scroll, Olive Branch, etc.) mapped to all 38 Haggadah sections.
- Intelligent reading enhancements: "Tekhelet" blue borders for instructional rubrics and Sea-Green borders for commentary.
- Fully offline capability via Progressive Web App (PWA) caching (Service Workers & Workbox).
- Automatic smooth scrolling functionality (Off, Slow, Med, Fast speeds) using `requestAnimationFrame`.
- Configured GitHub Actions CI/CD pipelines for:
  - GitHub Pages automatic deployment.
  - Native Android APK generation via Ionic Capacitor.
  - Standalone Single HTML File compilation.
