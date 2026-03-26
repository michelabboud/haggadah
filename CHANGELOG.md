# Changelog

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
