# Autoresearch — pages spoke layout loop

**Mode**: Design / UI (user is the eval)
**Branch**: autoresearch/2026-08-31-pages-layout
**Target file**: pages/index.html (single modifiable file)
**Round 1 axis**: layout / density / scannability

## Constraints (carried from kai-systems SPEC)

- Spoke must match the established visual language — same tokens, same fonts, same hero/end-mark/hub-nav chrome as terminal, os, video, music, etc.
- End-mark stays "Nine stacks. One philosophy. Zero babysitting."
- Hub-nav, hero, and end-mark are shared structure — variants may only differ in middle section layout
- Per SPEC §6: declarative voice, no hedging, second person, no marketing copy
- Per SPEC §11: no personal filesystem paths, no real project names, no internal-only tool names

## Round 1 — Layout hypothesis sweep

Five prototypes behind tabs. Each one attacks "long-read scannability" from a different angle.

| Letter | Hypothesis | Visual signature |
|--------|-----------|------------------|
| A | Two-column w/ sticky TOC | 280px sticky TOC on left, content scrolls right; section anchors highlighted as you scroll |
| B | Card-grid sections | Each of the 5 sections becomes a numbered card stack with bigger numbers, more whitespace between |
| C | Single-column dense | Strip the breathing room — tighter line-height, smaller headings, everything in one tight column |
| D | Accordion / collapse-by-default | All 5 sections collapsed to h2 + 1-line summary; click to expand. Reader chooses depth |
| E | Hero-stats + timeline | Replace section list with a horizontal timeline rail; each section is a stop on the rail with a thumbnail card |

User flips live at `/pages/index.html`, picks a letter, I refine that one.

## Working notes

- Single file, inline JS for tab flipping. No build.
- Source baseline: current `pages/index.html` from commit 6900cc7
- Drift-rule gate must keep passing (Eight → Nine already shipped). Don't break the spoke.
- Memory budget: page < 60KB total (current ~25KB, plenty of room).