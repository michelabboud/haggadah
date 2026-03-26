# Pesach Haggadah Web App 🍷

A beautiful, fully offline-capable, bilingual Passover Haggadah web application. Built with Vite and React, it features a complete unabridged traditional text with a premium "Lite Ancient Bible" aesthetic.

## Features ✨

* **Full Traditional Text**: Complete 38-section Haggadah in both Hebrew and English, imported directly from Sefaria.
* **Lite Ancient Bible Theme**: A stunning UI featuring parchment tones, sepia text, and elegant gold accents to mimic a classical manuscript.
* **Dynamic Layouts**: View in English, Hebrew, or Both. The application dynamically anchors thematic image banners to the correct side based on the language selected.
* **Read Assists**: 
  - Integrated fluent Auto-Scroller with three reading speeds.
  - Intelligent instructional grouping (custom text borders for visual clarity).
* **Fully Offline (PWA)**: Designed to be used during the Seder without an active internet connection. All text, fonts, and assets are cached instantly upon first load via Service Workers.
* **Multiple Deployment Options**: Includes CI/CD pipelines to build for the Web (GitHub Pages), Native Android (Ionic Capacitor APK), and a standalone Single `.html` file.

## Quick Start 🚀

To run the application locally for development:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Build options**
   Build the standard web app / PWA:
   ```bash
   npm run build
   ```
   Build the single portable HTML file:
   ```bash
   VITE_SINGLEFILE=true npm run build
   ```

## CI/CD Workflows ⚙️

This repository is equipped with GitHub Actions that run automatically when pushed to the `main` branch. Artifacts are automatically uploaded to your repository's **Actions** tab.
* `.github/workflows/deploy-pages.yml` - Deploys the PWA directly to GitHub Pages.
* `.github/workflows/build-singlefile.yml` - Generates a standalone `PesachHaggadah.html` file that can be distributed via email or flash drive and opened locally in any browser.
* `.github/workflows/build-apk.yml` - Uses Ionic Capacitor to compile `.apk` native Android app for tablets and phones.

---

*Chag Pesach Sameach! | פסח כשר ושמח*
