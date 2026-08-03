# Kai Systems — Spec

The single source of truth for the spoke template, design tokens, and the rules that govern what happens when a spoke is added or changed.

**This file is the contract.** If the code disagrees with this file, the code is wrong. If you (human or agent) add a spoke that violates this file, the change should not ship.

---

## 1. Repository shape

```
kai-systems/
├── SPEC.md              ← you are here
├── README.md            ← discoverability, links to live site
├── index.html           ← the hub
├── assets/              ← shared CSS, JS, link checker (future)
└── <spoke>/
    └── index.html       ← one spoke = one HTML file, one folder
```

**One spoke = one folder + one `index.html`.** No build step, no framework, no JS framework. Every spoke is a static HTML page that runs anywhere a browser runs.

**Current spokes** (7): `video/`, `music/`, `chatterbot-tts/`, `os/`, `terminal/`, `trumpet/`, `twin/`

When a spoke is added, the count `N` changes. **Every reference to "N spokes/systems" must be updated in lockstep** (see §7 — The Drift Rule).

---

## 2. Design tokens

The hub and every spoke share the same CSS custom properties. These tokens are the entire visual identity. Never hardcode a color in a spoke — always reference a token.

```css
:root {
  /* Surfaces */
  --bg:          #f7f5f0;   /* page background */
  --bg-warm:     #f4f0e7;   /* alt surface for cards, code blocks */
  --surface:     #ffffff;   /* card / panel background */
  --line:        #e9e3d6;   /* 1px dividers */
  --line-soft:   #f0eadf;   /* hover / low-emphasis borders */

  /* Ink (text) */
  --ink:         #14171e;   /* primary text */
  --ink-muted:   #3a4256;   /* secondary text, lede */
  --ink-faint:   #7c7a72;   /* labels, kickers, eyebrows */

  /* Brand */
  --primary:     #c97b3f;   /* warm copper — eyebrows, hover, em */
  --primary-soft: rgba(201, 123, 63, 0.08);
  --primary-mid:  rgba(201, 123, 63, 0.18);

  /* Accent */
  --accent:      #2f6f5e;   /* forest green — flow nodes, secondary */
  --accent-soft: rgba(47, 111, 94, 0.08);
}
```

**Typography**
- Serif display: `DM Serif Display` — h1, h2, kicker numbers
- Sans body: `Outfit` — body, lede, nav
- Mono labels: `JetBrains Mono` — tool chips, kicker numbers, footer

All three are loaded from Google Fonts in every page's `<head>`. The link tag is identical across all 8 files:

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Favicon**: identical inline SVG (hexagon + center circle) on every page.

---

## 3. Shared page chrome

These elements are duplicated verbatim across every spoke (and similar on the hub). They are the visual signature.

### 3.1 Body background

Two fixed radial gradients in the corners, anchored to `--primary-soft` and `--accent-soft`. Applied via `body::before`. Sets a `pointer-events: none; z-index: 0;` overlay.

### 3.2 Hub-nav (spokes only)

A single horizontal bar at the top of every spoke:

```html
<nav class="hub-nav">
  <a href="../index.html" class="hub-mark">kai-systems/</a>
  <div class="hub-links">
    <a href="../<spoke>/index.html">spoke-name</a>
    <!-- one <a> per sibling spoke, plus the current spoke with class="here" -->
  </div>
</nav>
```

**Canonical hub-links format** — lowercase, matches the spoke folder name. Display label = spoke folder name. The current spoke gets `class="here"` for the active-state styling.

**Known drift** (as of 2026-08-03): the `twin/` spoke uses capitalized labels (`Terminal`, `OS`, …) and `class="here"`. Other spokes use lowercase. The lowercase format is canonical; twin should be reconciled.

### 3.3 End-mark

The closing ornament on every spoke. A 40×40 SVG hexagon + center circle, centered, with one tagline line below.

```html
<div class="end-mark">
  <svg width="40" height="40" viewBox="0 0 32 32" fill="none"
       xmlns="http://www.w3.org/2000/svg">
    <polygon points="16,4 28,11 28,21 16,28 4,21 4,11"
             fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="3" fill="currentColor"/>
  </svg>
  <p>{N} stacks. One philosophy. Zero babysitting.</p>
</div>
```

The `{N}` must equal the current spoke count (§7).

---

## 4. Hub page structure (`index.html`)

The hub is not a spoke. It is the index. Structure:

1. **Hero block** — eyebrow (`kai-systems · series 01`), h1, hero-lede, divider
2. **Intro** — 2 paragraphs
3. **Index section** — kicker + 7 cards (one per spoke), each is an `<a href="<spoke>/index.html">` with a `card-num` (01–07), eyebrow, title, desc, tool list, and an arrow SVG
4. **Throughline** — explains the shared structure
5. **Footer** — `kai-systems · series 01 · 7 of 7` + `design once · runs forever`

The hero h1 must read **"N systems. One philosophy. Zero babysitting."** where N = current spoke count.

---

## 5. Spoke page structure

Two valid templates exist. Pick the one that fits the spoke's content density. Both end with the end-mark.

### 5.1 The "five-jobs" template (terminal, video, music, chatterbot-tts, os)

Five sections, each with a numbered kicker using `·` as separator:

```
01 · The layers      ← what each layer is + tools
02 · Why             ← why this stack exists, what problem it solves
03 · The artifact    ← the worked example (the proof)
04 · In practice     ← session log, timestamps, real usage
05 · Forking the stack  ← how to adopt this yourself
```

Each section opens with `<section>` containing a `.section-kicker` div, an `h2`, and a `.section-sub` paragraph, followed by the section body.

### 5.2 The "process-pipeline" template (trumpet, twin)

Four sections + a tail "Toolchain" section, using em-dash `—` as separator. Used when the stack IS a sequence of pipeline stages (ingest → process → output).

```
01 — Stage one
02 — Stage two
03 — Stage three
04 — Stage four
Toolchain           ← unnumbered, just shows the tool tags
```

**Known drift** (as of 2026-08-03): the two templates coexist. The hub throughline still references "Five jobs, twelve tools, one worked example" — that is the *five-jobs template's* invariant and applies to those five spokes only. The pipeline-template spokes (trumpet, twin) use the throughline loosely. Future spokes should pick one template explicitly in their PR.

---

## 6. Voice and content rules

**Every spoke is a long-read, not a wiki entry.** Each spoke is 240–400 lines, dense, structured, written in second person.

The throughline of every spoke (whether five-jobs or pipeline) is:
- The **layer model** — name the layers, name the tools per layer
- The **worked example** — a real session, real timestamps, real sequence
- The **forking recipe** — how someone else could adopt this

**Forbidden in spokes:**
- Hedging language ("might", "could", "possibly") — be declarative
- "Framework" or "tutorial" framing — these are production stacks
- Marketing copy ("revolutionary", "game-changing") — name the tools, show the sessions

**Allowed everywhere:**
- Em-dash `—` for parentheticals, `·` for separators in section kickers, `<em>` for italic emphasis
- Inline SVG icons (no icon font, no image files)

---

## 7. The Drift Rule (most important section)

When a spoke is added or removed, the count `N` changes. **Every reference to the count must be updated in the SAME commit.** The references are:

1. `README.md` — opening line ("N production stacks…")
2. `index.html` line ~90 — hero h1 ("N systems. One philosophy…")
3. `index.html` line ~91 — hero-lede ("All N share…")
4. `index.html` line ~104 — intro paragraph ("The N systems below…")
5. `index.html` line ~109 — section-kicker ("The N systems")
6. `index.html` line ~277 — footer ("kai-systems · series 01 · N of N")
7. Every spoke's `end-mark` `<p>` — ("N stacks. One philosophy…")
8. GitHub repo description (`gh repo edit kajica2/kai-systems --description "N production stacks…"`)

**8 places.** All eight must change in lockstep. A drift in any one is a bug.

The `check-links.js` gate (§9) enforces this on every push.

---

## 8. Adding a spoke — recipe

The twin and any future agent follow this exact recipe. No improvisation.

1. **Pick the template.** Five-jobs or pipeline (§5). Match the content shape to the template.
2. **Create the folder**: `mkdir -p <spoke-name>/`
3. **Copy the spoke scaffold** from `terminal/index.html` (the canonical example) — strip its content, keep the chrome (`:root`, body, hub-nav, end-mark, fonts link, favicon)
4. **Fill in the content**:
   - Hero: eyebrow + h1 + lede
   - 5 (or 4+toolchain) sections with kickers, h2, section-sub, body
   - End-mark with `{N}` placeholder
5. **Add the spoke card** to `index.html` — append an `<a class="card">` to the `.index` div with the next card-num
6. **Update hub-links** in every existing spoke — add the new spoke to each `<div class="hub-links">` (and in twin's case, fix the capitalization drift per §3.2)
7. **Update the Drift Rule references** (§7) — bump every `N` to `N+1`
8. **Update README.md** — add a row to the spokes table
9. **Update GitHub repo description** — bump `N`
10. **Run the gate**: `node assets/check-links.js` — must exit 0
11. **Commit** with `feat: add <spoke> spoke — <one-line desc>`
12. **Push** to `main` — GitHub Pages deploys automatically, no CI needed
13. **Browser-verify** at `https://kajica2.github.io/kai-systems/<spoke>/` after ~60s for Pages rebuild

If any step is skipped, the drift check in step 10 will catch it.

---

## 9. Gates (current and planned)

The repo currently has **no automated gate**. This is the single biggest gap. Planned:

- `assets/check-links.js` — pure Node, no deps. Reads all 8 HTML files, asserts:
  - Every spoke's hub-links lists all N siblings
  - Every spoke has the end-mark with `{N}` matching repo state
  - `index.html` has exactly N cards
  - All references in §7 are consistent
  - Exits non-zero on first inconsistency
- `.github/workflows/pages-check.yml` — runs `check-links.js` on every push. The five→seven bug becomes unbuildable.

Until the gate exists, every PR must be hand-verified against the §7 list.

---

## 10. Known drift to reconcile

Tracked separately from §7 because these are stylistic drift, not count drift. Future PRs should pick one canonical form.

| Item | Canonical | Drift | Spoke(s) affected |
|------|-----------|-------|-------------------|
| Hub-links display label | lowercase | capitalized | twin |
| Section separator | `·` (five-jobs) or `—` (pipeline) | both used by different spokes | all 7 |
| Spoke folder names | kebab-case | one is multi-word (`chatterbot-tts`) | chatterbot-tts (intentional) |
| Hero h1 size | 60px on spokes, 84px on hub | consistent | none — verified |

The next reconciliation PR should pick canonical forms for hub-links and section separator across all 7 spokes. Until then, new spokes should match the closest sibling (twin format for new pipeline-template spokes, terminal format for new five-jobs spokes).

---

## 11. Personal-content hygiene (added 2026-08-03)

The repo is public. Spokes are written in second person with worked examples, but worked examples must not leak the author's real filesystem, real project names, real session counts, or real internal file paths.

**Forbidden in any spoke or the hub:**

- Absolute filesystem paths (`~/Documents/...`, `/Users/...`, `~/sandbox/...`)
- Real personal-project names used as if they were industry-known tools (replace with generic descriptors)
- Internal skill/agent/memory file names that aren't part of a documented public convention (e.g. `Grimoire_NotebookLM_Source.md`, `kai-persona`)
- Full enumerations of the author's repos, sessions, or datasets
- Counts tied to the author's personal corpus (`456 WJAZD solos`, `30+ session directories`)

**Allowed:**

- Generic file-path patterns that are public conventions in the AI agent / dev tools space (e.g. `memory/user.md`, `memory/agent.md`, `AGENTS.md`, `package.json`, `requirements.txt`)
- Vendor tool names that are public, well-known products (Suno, ElevenLabs, Suno, fzf, ripgrep, etc.)
- The author handle (`kajica2`) only in the live-site URL and the `gh repo edit` command — never in spoke prose

**Aspirational framing rule:**

Tone the present tense when describing a system that is being built, not yet operational. Use "designed to", "built to run", "the way an operating system runs its daemons" — not "has already set up", "runs autonomously", "is the meta-layer that makes all the other stacks run themselves".

**Why this matters:**

The drift-rule gate enforces the 8-place lockstep, but it does not enforce personal-content hygiene. That's a review responsibility. The next PR that adds personal-content drift is a candidate to extend `assets/check-links.js` with a personal-content scan — until then, every spoke PR must be hand-reviewed against this section.