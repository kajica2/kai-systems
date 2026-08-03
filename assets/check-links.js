#!/usr/bin/env node
// assets/check-links.js
//
// Pure-Node drift gate for kai-systems. No deps. Runs in ~50ms.
//
// Enforces SPEC.md §7 (The Drift Rule): when a spoke is added or removed,
// 8 surface references must update in lockstep. This script is the
// contract — exit 0 = green, exit 1 = list of failures.
//
// Usage:  node assets/check-links.js
// Exit:   0 on success, 1 on any drift failure
//
// Scope (intentionally narrow):
//   - Spoke count drift across the 8 surface references
//   - Hub-links completeness on every spoke
//   - Card count on the hub
// We do NOT validate HTML well-formedness, link validity, or design
// token consistency — those are review responsibilities, not gate ones.

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];

// --- 1. Discover spokes ---------------------------------------------------

function listSpokes() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'assets' && d.name !== 'node_modules')
    .filter(d => fs.existsSync(path.join(ROOT, d.name, 'index.html')))
    .map(d => d.name)
    .sort();
}

const spokes = listSpokes();
const N = spokes.length;

// Spelled-out numbers for tagline copy. The codebase uses capitalized
// ("Seven systems"), so numWord() returns capitalized; lowercase variants
// would also be detected by the case-insensitive 'i' flag below.
const NUM_WORDS = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve'];
const numWord = n => NUM_WORDS[n] || String(n);

const fail = m => errors.push(m);
const warn = m => warnings.push(m);

// --- 2. Read files -------------------------------------------------------

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function findCi(haystack, pattern) {
  // Case-insensitive regex search, returns boolean.
  return new RegExp(pattern, 'i').test(haystack);
}

// --- 3. Hub checks -------------------------------------------------------

const hub = read('index.html');

// 3a. Card count must equal N
const cardMatches = hub.match(/class="card"/g) || [];
if (cardMatches.length !== N) {
  fail(`hub: expected ${N} cards (one per spoke), found ${cardMatches.length}`);
}

// 3b. Hero h1 — "{N} systems."
if (!findCi(hub, `<h1>${numWord(N)} systems\\.`)) {
  fail(`hub hero h1: expected "<h1>${numWord(N)} systems.", not found`);
}

// 3c. Hero-lede — "All {N} share"
if (!findCi(hub, `All ${numWord(N)} share`)) {
  fail(`hub hero-lede: expected "All ${numWord(N)} share...", not found`);
}

// 3d. Intro paragraph — "The {N} systems below"
if (!findCi(hub, `The ${numWord(N)} systems below`)) {
  fail(`hub intro: expected "The ${numWord(N)} systems below...", not found`);
}

// 3e. Section kicker — ">The {N} systems<"
if (!findCi(hub, `>The ${numWord(N)} systems<`)) {
  fail(`hub section-kicker: expected ">The ${numWord(N)} systems<", not found`);
}

// 3f. Footer — "series 01 · N of N"
if (!findCi(hub, `series 01 · ${N} of ${N}`)) {
  fail(`hub footer: expected "series 01 · ${N} of ${N}", not found`);
}

// --- 4. Spoke checks -----------------------------------------------------

// Two valid hub-links formats exist (see SPEC.md §10):
//   Format A (terminal/video/music/chatterbot-tts/os):
//     <a href="../<spoke>/index.html"><spoke-name></a>
//     active: <span class="here">label</span>
//   Format B (trumpet/twin):
//     <a href="../<spoke>/">Capitalized Label</a>
//     active: <a href="./" class="here">Label</a>
//
// Both are accepted. The gate checks hub-links completeness, not format
// uniformity. Format reconciliation is a separate PR (SPEC.md §10).

for (const spoke of spokes) {
  const html = read(`${spoke}/index.html`);

  // 4a. hub-links block exists and lists all N siblings
  const linksBlock = html.match(/<div class="hub-links">([\s\S]*?)<\/div>/);
  if (!linksBlock) {
    fail(`${spoke}: no <div class="hub-links"> block found`);
    continue;
  }
  const linksBody = linksBlock[1];

  // Collect any sibling reference, whether <a href="...spoke/..."> or
  // <span class="here">... for the active one. The current spoke may
  // self-link with href="./" (trumpet/twin format) or be represented
  // as a <span class="here"> (older format) — both count.
  const linkedFromA = [...linksBody.matchAll(/href="\.\.\/([^/]+)\/index\.html"/g)].map(m => m[1]);
  const linkedFromB = [...linksBody.matchAll(/href="\.\.\/([^/]+)\/"/g)].map(m => m[1]);
  const linkedSpans = [...linksBody.matchAll(/<span class="here">([^<]+)<\/span>/g)].map(m => m[1]);
  const linkedSelf = /href="\.\/"[^>]*class="here"/.test(linksBody);

  // If the current spoke self-links with class="here", it counts as
  // being in the hub-links. Add the spoke name itself to the recognized set.
  const allLinked = new Set([
    ...linkedFromA,
    ...linkedFromB,
    ...linkedSpans,
    ...(linkedSelf ? [spoke] : []),
  ]);

  const missing = spokes.filter(s => {
    for (const linked of allLinked) {
      if (linked.toLowerCase() === s.toLowerCase()) return false;
    }
    return true;
  });
  if (missing.length > 0) {
    fail(`${spoke}: hub-links missing siblings: ${missing.join(', ')}`);
  }

  // 4b. Active-state indicator exists somewhere for the current spoke.
  // Format A: <span class="here">{spoke}</span> or any case variant
  // Format B: <a href="./" class="here">{Label}</a>
  const hereSpan = new RegExp(`<span class="here">${spoke}\\b`, 'i');
  const hereLink = /href="\.\/"[^>]*class="here"/;
  if (!hereSpan.test(linksBody) && !hereLink.test(linksBody)) {
    warn(`${spoke}: no active-state indicator (class="here") in hub-links`);
  }

  // 4c. End-mark check — only if this spoke has one. The 5 original
  // spokes (terminal/video/music/chatterbot-tts/os) do not; trumpet and
  // twin do. SPEC.md §10 flags this drift. Adding end-marks to the 5
  // is a separate PR.
  const hasEndMark = /class="end-mark"/.test(html);
  if (hasEndMark) {
    if (!findCi(html, `>${numWord(N)} stacks\\. One philosophy`)) {
      fail(`${spoke}: end-mark expected ">${numWord(N)} stacks. One philosophy...", not found`);
    }
  }
}

// --- 5. README check -----------------------------------------------------

const readme = read('README.md');
const readmeRe = new RegExp(`^${numWord(N)} production stacks\\. One philosophy`, 'm');
if (!readmeRe.test(readme)) {
  fail(`README.md: expected "${numWord(N)} production stacks. One philosophy..." as opening tagline`);
}

// --- 6. Repo description (best-effort) -----------------------------------

let repoDesc = null;
let ghSkipped = false;
try {
  const out = execSync('gh repo view kajica2/kai-systems --json description -q .description', {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 5000,
  }).toString().trim();
  repoDesc = out;
} catch (e) {
  ghSkipped = true;
}

if (repoDesc !== null) {
  const descRe = new RegExp(`^${numWord(N)} production stacks\\. One philosophy`);
  if (!descRe.test(repoDesc)) {
    fail(`repo description: expected "${numWord(N)} production stacks. One philosophy...", got "${repoDesc}"`);
  }
}

// --- 7. Report -----------------------------------------------------------

if (warnings.length > 0) {
  console.error('Warnings:');
  for (const w of warnings) console.error(`  ! ${w}`);
  console.error('');
}

if (errors.length > 0) {
  console.error(`FAIL — ${errors.length} drift violation(s):`);
  for (const e of errors) console.error(`  x ${e}`);
  console.error('');
  console.error(`Detected ${N} spokes: ${spokes.join(', ')}`);
  console.error('See SPEC.md §7 (The Drift Rule) and §8 (Adding a spoke recipe).');
  process.exit(1);
}

console.log(`PASS — ${N} spokes, drift-rule consistent.`);
console.log(`  hub:        ${N} cards, hero/lede/intro/kicker/footer all match`);
console.log(`  spokes:     hub-links complete on all ${N}`);
console.log(`  readme:     opening tagline matches`);
console.log(`  repo desc:  ${ghSkipped ? 'skipped (gh unavailable)' : 'matches'}`);
process.exit(0);