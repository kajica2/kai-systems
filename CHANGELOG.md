# Changelog

All notable changes to kai-systems. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Commit history follows [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `refactor:`, `ci:`, `chore:`.

## [Unreleased]

### Changed
- video spoke: refresh Visuals layer for 2026 — drop Pika (no longer the obvious default), add Veo 3.1 (Google), Runway Gen-4.5 (enterprise), Kling 2.x (price/perf), Mochi 1 (open-source Apache 2.0). Midjourney versioned to v6.4. Hub card tool-pill row updated to match.
- twin, trumpet: hub-links labels lowercased to folder-name (Voice → chatterbot-tts, OS → os, etc.). hub-mark changed to `kai-systems/`. Active marker switched to `<span class="here">` per Format A. Closes SPEC §10 hub-links drift.
- terminal, os, video, music, chatterbot-tts: end-mark added before `</div>`. The 5 existing `<footer>` blocks replaced with the canonical end-mark (`<div class="end-mark">` + hex SVG + `<p>Seven stacks. One philosophy. Zero babysitting.</p>`). Inline `.end-mark` CSS added to each spoke's `<style>` block. The site now reads as a single series, not 5 short pages + 2 long pages.
- `assets/check-pages.sh`: end-mark check extended to all 7 spokes (was only trumpet + twin). Header doc and success summary updated.
- `SPEC.md` §10: reconciliation table updated. The three remaining items (section separator, folder names, hero h1 size) are all intentional and require no further action.

## [2026-08-03] — Foundation sprint

### Added
- `SPEC.md` — the spoke template, design tokens, drift rule, and 13-step spoke recipe. The contract that prevents the five→seven bug from happening again.
- `assets/check-links.js` — pure-Node drift-rule gate (~50ms, no deps). Enforces the 8-place lockstep in SPEC.md §7.
- `assets/shared.css` — design tokens + body base + page chrome + `.hub-nav` block. Loaded by every page; replaces ~1030 chars of duplicated CSS that previously appeared verbatim in all 8 HTML files.
- `.github/workflows/pages-check.yml` — runs `check-links.js` on every push and PR. A spoke cannot ship with drift.

### Changed
- Hub hero, hero-lede, intro, section-kicker, footer, README heading, and repo description updated from "five" → "seven" to match the actual spoke count.
- Every HTML page now links to `assets/shared.css` instead of duplicating the shared CSS inline. Net file-size change: positive, but maintenance change is huge (1 edit, not 8).
- `terminal/index.html` hub-links: self-link `<a>` → `<span class="here">` to match the active-state pattern used by the other 6 spokes.

### Fixed
- The five→seven copy drift in 4 surface references (hub hero, hub intro, hub section-kicker, hub footer + README + repo description + 2 spoke end-marks).
- Missing `class="here"` active-state on terminal's self-link.

## [2026-08-02] — Trumpet + Twin spokes

### Added
- `trumpet/` spoke — audio/video transcription + music charts pipeline (audio → silence segmentation → pYIN → LilyPond/VexFlow).
- `twin/` spoke — cognitive twin (filesystem scan + autonomous work processes).

## [2026-08-02] — Initial 5 spokes

### Added
- `video/` — 5-layer video production stack.
- `music/` — indie music AI stack.
- `chatterbot-tts/` — voice-AI stack.
- `os/` — personal OS stack.
- `terminal/` — terminal-first dev stack.
- Hub (`index.html`) with 5 cards.
- `.nojekyll` (GitHub Pages marker).