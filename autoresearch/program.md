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
| A | Baseline | The shipping version, lightly adapted — the reference point, not a hypothesis |
| B | Two-column w/ TOC | 240px sticky TOC on left, content scrolls right; section anchors highlighted as you scroll |
| C | Card-grid sections | Each of the 5 sections becomes a numbered card stack with bigger numbers, more whitespace between |
| D | Single-column dense | Strip the breathing room — tighter line-height, smaller headings, everything in one tight column |
| E | Accordion / collapse-by-default | All 5 sections collapsed to h2 + 1-line summary; click to expand. Reader chooses depth |

User flips live at `/pages/index.html`, picks a letter, I refine that one.

## Round 2 — Outcome

**Winner: D.** Picked in the live flip, then landed as `pages/index.html`
(commit `f148bfc`).

The deciding evidence was not the page height — it was the series. All five
sibling spokes (twin 337 lines, terminal 358, os 365, video 363, music 349)
are single-column long-reads: no TOC, no card grid, no accordion. B, C and E
would have made the pages spoke the only spoke in the series with its own
shape, and E would have hidden 73% of the copy behind clicks, which SPEC §6
rules out. D was the only variant that improved scannability — 6347px →
5046px for the same 7300 characters — without leaving the shared language.

Round 2 did three things to the winning layout:

1. Folded the dense scale into the page's own stylesheet instead of keeping
   it as a set of overrides over the baseline one.
2. Removed the tab bar, the flip script, the four losing variants and their
   CSS. 1523 lines → 384, back inside the SPEC §6 range for a spoke.
3. Kept the 720px measure, and made the mobile block agree with the dense
   scale rather than undoing it.

## Working notes

- Single file, inline JS for tab flipping. No build.
- Source baseline: current `pages/index.html` from commit 6900cc7
- Drift-rule gate must keep passing (Eight → Nine already shipped). Don't break the spoke.
- Memory budget: page < 60KB total (current ~25KB, plenty of room).
- Round 2 also fixed a hub-wide bug the sweep surfaced: the hub-nav did not
  fit a phone viewport on the twin and pages spokes. The rule moved into
  `assets/shared.css` so every spoke gets it.