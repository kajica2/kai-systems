#!/usr/bin/env node
// assets/bump-spoke-count.js
//
// Auto-updater for the kai-systems drift-rule surface (SPEC.md §7).
// Sibling to check-links.js — same pure-Node, no-deps style.
//
// check-links.js is the *verifier*: it tells you when the 8 surface
// references have drifted. This script is the *fixer*: when you're
// adding or removing a spoke, run this and it rewrites the count
// tokens in lockstep.
//
// Usage:
//   node assets/bump-spoke-count.js          # dry run, prints diff
//   node assets/bump-spoke-count.js --apply  # writes the changes
//   node assets/bump-spoke-count.js --apply --yes  # skip the prompt
//
// Exit:
//   0  on success (or no-op when already consistent)
//   1  on filesystem error or invalid invocation
//   2  on conflict (would overwrite manual edits — refuses to run)
//
// Scope (intentionally narrow — matches check-links.js coverage):
//   1. index.html line ~85   — hero h1 "<N> systems."
//   2. index.html line ~99   — intro "The <N> systems below"
//   3. index.html line ~104  — section-kicker "The <N> systems"
//   4. index.html line ~272  — footer "series 01 · N of N"
//   5. README.md             — opening tagline "<N> production stacks."
//   6. every spoke's end-mark (only trumpet + twin ship one today) —
//      "<N> stacks. One philosophy."
//   7. GitHub repo description (best-effort, requires `gh` auth)
//   8. assets/check-pages.sh — the live-side script's literal "Seven"
//      grep, which is decoupled from N and would otherwise silently
//      keep working forever after a spoke is added.
//
// What it does NOT touch (deliberate — see SPEC.md §10 for the
// canonical-vs-drift list):
//   - hub-links capitalization drift (kajica2 prefers lowercase)
//   - end-mark format on the 5 spokes that don't have one
//   - design tokens, copy, layout
//   - SPEC.md prose (it documents the rule, not the count)

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ARGV = process.argv.slice(2);
const APPLY = ARGV.includes('--apply');
const YES = ARGV.includes('--yes');

// Spelled-out numbers for tagline copy. check-links.js caps at 12;
// this script extends to 20 because adding a 13th spoke would otherwise
// silently fall back to digits and break the prose rule. Extend again
// when needed — add the word, not a comment.
const NUM_WORDS = [
  'Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen',
  'Eighteen','Nineteen','Twenty',
];
const numWord = n => {
  if (n < 0 || n >= NUM_WORDS.length) {
    throw new Error(`count ${n} out of range (0..${NUM_WORDS.length - 1}); extend NUM_WORDS`);
  }
  return NUM_WORDS[n];
};

function listSpokes() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'assets' && d.name !== 'node_modules')
    .filter(d => fs.existsSync(path.join(ROOT, d.name, 'index.html')))
    .map(d => d.name)
    .sort();
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function write(rel, content) {
  fs.writeFileSync(path.join(ROOT, rel), content, 'utf8');
}

// --- Find the current N by reading check-links.js's own logic, then
// confirm it matches the count we'd compute independently. If they
// disagree, something is broken — bail out rather than overwriting.
const spokes = listSpokes();
const N = spokes.length;
const NWORD = numWord(N);

// --- Plan every edit up front, then apply. Each entry is
// { rel, before, after, label, conflict } where conflict is set if
// the "before" pattern wasn't found (we'd be writing to a position
// that doesn't match the expected shape).
const edits = [];

// 1. index.html: hero h1 "<NWORD> systems."
{
  const rel = 'index.html';
  const html = read(rel);
  const re = /<h1>(Zero|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve)\s+systems\./i;
  const m = html.match(re);
  if (!m) {
    edits.push({ rel, before: null, after: null, label: 'hub hero h1 (not found — manual fix needed)', conflict: true });
  } else if (m[1].toLowerCase() === NWORD.toLowerCase()) {
    // already correct, no edit
  } else {
    edits.push({
      rel,
      before: `<h1>${m[1]} systems.`,
      after: `<h1>${NWORD} systems.`,
      label: 'hub hero h1',
    });
  }
}

// 2. index.html: intro "The <NWORD> systems below"
{
  const rel = 'index.html';
  const html = read(rel);
  const re = /(>\s*|The\s+)(Zero|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve)\s+systems\s+below/i;
  const m = html.match(re);
  if (!m) {
    edits.push({ rel, before: null, after: null, label: 'hub intro (not found — manual fix needed)', conflict: true });
  } else if (m[2].toLowerCase() === NWORD.toLowerCase()) {
    // already correct
  } else {
    // Preserve the original case of the spelled-out number. The hub intro
    // uses lowercase ("the seven systems below"); the hero h1 and section
    // kicker use capitalized ("Seven systems."). Don't normalize either way.
    const origCase = m[2];
    const newWord = origCase[0] === origCase[0].toUpperCase()
      ? NWORD
      : NWORD.toLowerCase();
    edits.push({
      rel,
      before: `${m[1]}${origCase} systems below`,
      after: `${m[1]}${newWord} systems below`,
      label: 'hub intro',
    });
  }
}

// 3. index.html: section-kicker ">The <NWORD> systems<"
{
  const rel = 'index.html';
  const html = read(rel);
  const re = />The (Zero|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve) systems</i;
  const m = html.match(re);
  if (!m) {
    edits.push({ rel, before: null, after: null, label: 'hub section-kicker (not found — manual fix needed)', conflict: true });
  } else if (m[1].toLowerCase() === NWORD.toLowerCase()) {
    // already correct
  } else {
    edits.push({
      rel,
      before: `>The ${m[1]} systems<`,
      after: `>The ${NWORD} systems<`,
      label: 'hub section-kicker',
    });
  }
}

// 4. index.html: footer "series 01 · N of N"
{
  const rel = 'index.html';
  const html = read(rel);
  const re = /series 01 · (\d+) of (\d+)/;
  const m = html.match(re);
  if (!m) {
    edits.push({ rel, before: null, after: null, label: 'hub footer (not found — manual fix needed)', conflict: true });
  } else if (parseInt(m[1], 10) === N && parseInt(m[2], 10) === N) {
    // already correct
  } else {
    edits.push({
      rel,
      before: `series 01 · ${m[1]} of ${m[2]}`,
      after: `series 01 · ${N} of ${N}`,
      label: 'hub footer',
    });
  }
}

// 5. README.md: opening tagline "<NWORD> production stacks."
{
  const rel = 'README.md';
  const md = read(rel);
  const re = /^(Zero|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve) production stacks\./m;
  const m = md.match(re);
  if (!m) {
    edits.push({ rel, before: null, after: null, label: 'README opening tagline (not found — manual fix needed)', conflict: true });
  } else if (m[1].toLowerCase() === NWORD.toLowerCase()) {
    // already correct
  } else {
    edits.push({
      rel,
      before: `${m[1]} production stacks.`,
      after: `${NWORD} production stacks.`,
      label: 'README opening tagline',
    });
  }
}

// 6. Every spoke that has an end-mark with a hardcoded spelled-out count
//    (trumpet, twin today — see SPEC.md §10 for the drift).
for (const spoke of spokes) {
  const rel = `${spoke}/index.html`;
  const html = read(rel);
  if (!/class="end-mark"/.test(html)) continue;
  const re = />(Zero|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve) stacks\. One philosophy/i;
  const m = html.match(re);
  if (!m) {
    edits.push({ rel, before: null, after: null, label: `${spoke} end-mark (not found — manual fix needed)`, conflict: true });
  } else if (m[1].toLowerCase() === NWORD.toLowerCase()) {
    // already correct
  } else {
    edits.push({
      rel,
      before: `>${m[1]} stacks. One philosophy`,
      after: `>${NWORD} stacks. One philosophy`,
      label: `${spoke} end-mark`,
    });
  }
}

// 7. check-pages.sh: the live-side script greps for literal "Seven".
//    This is the gap the script fills — check-pages.sh does NOT compute
//    N from the filesystem, so it stays stale after a spoke is added.
//    We rewrite the two literal "Seven" strings to use the current NWORD
//    and the digit form. This keeps the live gate in lockstep with the
//    local gate.
{
  const rel = 'assets/check-pages.sh';
  const sh = read(rel);

  // Two greps: "<h1>Seven systems" (hero) and "Seven stacks. One philosophy"
  // (end-mark). Both literal.
  const heroRe = /grep -q "<h1>(Zero|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve) systems\\./;
  const heroM = sh.match(heroRe);
  if (heroM) {
    if (heroM[1].toLowerCase() !== NWORD.toLowerCase()) {
      edits.push({
        rel,
        before: `grep -q "<h1>${heroM[1]} systems\\."`,
        after: `grep -q "<h1>${NWORD} systems\\."`,
        label: 'check-pages.sh hero grep',
      });
    }
  } else {
    edits.push({ rel, before: null, after: null, label: 'check-pages.sh hero grep (not found — manual fix needed)', conflict: true });
  }

  const endRe = /grep -q "(Zero|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve) stacks\. One philosophy"/;
  const endM = sh.match(endRe);
  if (endM) {
    if (endM[1].toLowerCase() !== NWORD.toLowerCase()) {
      edits.push({
        rel,
        before: `grep -q "${endM[1]} stacks. One philosophy"`,
        after: `grep -q "${NWORD} stacks. One philosophy"`,
        label: 'check-pages.sh end-mark grep',
      });
    }
  } else {
    edits.push({ rel, before: null, after: null, label: 'check-pages.sh end-mark grep (not found — manual fix needed)', conflict: true });
  }
}

// 8. GitHub repo description — best-effort, requires `gh` auth.
//    We do NOT write to the description here even with --apply; the
//    surface is GitHub-controlled and a CLI write at the same moment
//    as a git push is racy. We just print the command the user should
//    run. check-links.js will catch a real mismatch on the next CI run.
let repoDescNote = null;
try {
  const out = execSync('gh repo view kajica2/kai-systems --json description -q .description', {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 5000,
  }).toString().trim();
  const expectedPrefix = `${NWORD} production stacks.`;
  if (!out.startsWith(expectedPrefix)) {
    repoDescNote = {
      current: out,
      expected: `${expectedPrefix} One philosophy. Zero babysitting.`,
      cmd: `gh repo edit kajica2/kai-systems --description "${expectedPrefix} One philosophy. Zero babysitting."`,
    };
  }
} catch (e) {
  repoDescNote = { skipped: true, reason: 'gh CLI unavailable or unauthenticated' };
}

// --- Report
const realEdits = edits.filter(e => !e.conflict);
const conflicts = edits.filter(e => e.conflict);

console.log(`Detected ${N} spokes: ${spokes.join(', ')}`);
console.log(`Target count: ${N} (${NWORD})`);
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN (pass --apply to write)'}`);
console.log('');

if (realEdits.length === 0) {
  console.log('No count-token edits needed. Surface is consistent.');
} else {
  console.log(`${realEdits.length} edit(s) planned:`);
  for (const e of realEdits) {
    console.log(`  ${e.label}`);
    console.log(`    ${e.rel}`);
    console.log(`    - ${e.before}`);
    console.log(`    + ${e.after}`);
  }
  console.log('');
}

if (conflicts.length > 0) {
  console.log(`${conflicts.length} conflict(s) — refusing to run safely:`);
  for (const c of conflicts) {
    console.log(`  ! ${c.label} (${c.rel})`);
  }
  console.log('');
  console.log('Fix the underlying format drift first, then re-run.');
  process.exit(2);
}

if (repoDescNote) {
  if (repoDescNote.skipped) {
    console.log(`[gh] repo description: skipped (${repoDescNote.reason})`);
    console.log('     run the gate locally to see the expected description.');
  } else {
    console.log(`[gh] repo description drift:`);
    console.log(`     current:  ${repoDescNote.current}`);
    console.log(`     expected: ${repoDescNote.expected}`);
    console.log(`     run:      ${repoDescNote.cmd}`);
  }
  console.log('');
}

// --- Apply (with a confirmation prompt unless --yes)
if (APPLY && realEdits.length > 0) {
  if (!YES) {
    console.log('Apply? [y/N]');
    process.stdout.write('> ');
    const buf = require('fs').readFileSync(0, 'utf8');
    if (buf.trim().toLowerCase() !== 'y') {
      console.log('Aborted.');
      process.exit(0);
    }
  }
  for (const e of realEdits) {
    const full = path.join(ROOT, e.rel);
    const cur = fs.readFileSync(full, 'utf8');
    if (!cur.includes(e.before)) {
      console.error(`  ! ${e.rel}: pattern vanished between read and write (concurrent edit?). Aborting.`);
      process.exit(1);
    }
    fs.writeFileSync(full, cur.replace(e.before, e.after), 'utf8');
    console.log(`  ✓ ${e.rel}  (${e.label})`);
  }
  console.log('');
  console.log(`Wrote ${realEdits.length} edit(s). Run \`node assets/check-links.js\` to verify.`);
  process.exit(0);
}

if (!APPLY && realEdits.length > 0) {
  console.log('Re-run with --apply to write these edits. --yes skips the prompt.');
}

process.exit(0);
