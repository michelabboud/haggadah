# Version 2.0 Implementation Plan

This document outlines the technical approach to implementing the 8 highly-requested premium features for the Pesach Haggadah Web Application.

## 1. Interactive Custom Seder Plate Tracker
- **Approach**: Create a floating `SederPlateProgress` React Component. We will define an array of the 15 steps. Using `IntersectionObserver` in `App.jsx`, we will track which `PassoverCard` is currently in the viewport and highlight the corresponding step on the floating minimap SVG.

## 2. Deep-Night "Vellum" Mode
- **Approach**: Implement a CSS class hierarchy (`.theme-lite`, `.theme-dark`). The Dark Vellum theme will invert the creamy parchment variables to a deep espresso brown (`#2E1B0F`), shifting text from sepia to a soft, glowing gold. A toggle switch (Sun/Moon icon) will be added to the `TopNav`.

## 3. Parchment Page Flips (Animation)
- **Approach**: Integrate a CSS 3D flipping library (like `react-pageflip` or raw CSS transforms). We will paginate the continuous scroll array into distinct "pages" (e.g. two paragraphs per page side) so users on tablets can physically swipe to turn the page, revealing proper shadow gradients during the turn.

## 4. Phonetic Transliteration Toggle
- **Approach**: We must source the Phonetic Transliteration strings. We will write a Node.js scraper to hit Sefaria's or OpenSiddur's transliteration endpoints or databases. We will then append a `transliteration` array to `haggadah_full.json` alongside `hebrew` and `english`. The `TopNav` language toggle will receive a 4th option: "Phonetic".

## 5. Inline Audio Melodies
- **Approach**: We need to source MP3/OGG files for traditional Haggadah melodies (e.g. *Ma Nishtana*, *Dayenu*). We will create an `AudioPlayer` React component. In `haggadah_full.json`, we will add an `audioUrl` field to relevant passages. If present, the component will render an elegant play button beside the text.

## 6. Expandable Classic Commentary
- **Approach**: We will ping the Sefaria API's `texts/` endpoint with a `commentary=1` parameter to fetch classic commentaries (e.g., Rashi, Abarbanel). We will add a `commentaries` array to the JSON elements and render a minimal `+` accordion in React that expands to show these insights natively.

## 7. "Read By" Assignment Tags
- **Approach**: Add a double-click Event Listener to text blocks. When clicked, an input modal drops down allowing the host to type "Assigned To: X". This data will be saved locally in `localStorage`, persisting the names next to blocks. For multi-device syncing, we would eventually need a lightweight WebSocket backend or Firebase, but we will start with local state.

## 8. Sliding Table of Contents
- **Approach**: Build a `SideDrawer` component containing a list of the 15 Seder steps. Clicking a step will map to the exact `ref` or DOM `id` of that Haggadah section and utilize `element.scrollIntoView({ behavior: 'smooth' })` to safely anchor the user.

---
*End of Planning. Ready for Execution.*
