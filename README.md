# Kai Systems

Seven production stacks. One philosophy. Zero babysitting.

**→ Live at [kajica2.github.io/kai-systems/](https://kajica2.github.io/kai-systems/)**

A series of long-reads on the production stacks that run without a producer. Each spoke names the layers, names the tools, names the worked example. All seven share the same throughline: design once, runs forever.

## Stacks

| Spoke | What it covers |
|-------|---------------|
| [terminal](https://kajica2.github.io/kai-systems/terminal/) | The Terminal-First Dev Stack — 12 tools that replaced my IDE |
| [os](https://kajica2.github.io/kai-systems/os/) | The Personal OS — the morning routine as a deployment target |
| [video](https://kajica2.github.io/kai-systems/video/) | The 5-Layer Video Stack — ship a 90-second explainer without a producer |
| [music](https://kajica2.github.io/kai-systems/music/) | The Indie Music AI Stack — from Splice to Suno |
| [chatterbot-tts](https://kajica2.github.io/kai-systems/chatterbot-tts/) | The Voice-AI Stack — a voice that sounds like you, on a phone, this weekend |
| [trumpet](https://kajica2.github.io/kai-systems/trumpet/) | The Trumpet Transcription Stack — cut up live recordings, transcribe, chart |
| [twin](https://kajica2.github.io/kai-systems/twin/) | The Cognitive Twin — scan the filesystem, index tools, run the work processes autonomously |

## How this repo works

Every spoke is a single static HTML file in its own folder. No build step, no framework, no JS framework. The design tokens, body base, page chrome, and hub-nav are shared via [`assets/shared.css`](assets/shared.css). Per-spoke styles (hero, sections, end-mark, responsive `@media`) stay inline in each spoke's `<style>` tag.

The contract for what makes a spoke a spoke lives in [`SPEC.md`](SPEC.md). When a spoke is added or removed, **8 surface references** must update in lockstep (hub hero, hub intro, hub section-kicker, hub footer, README, repo description, every spoke's end-mark, every spoke's hub-links). This contract is enforced by [`assets/check-links.js`](assets/check-links.js) on every push via [`.github/workflows/pages-check.yml`](.github/workflows/pages-check.yml). A spoke cannot ship with drift.

To add a spoke, follow [SPEC.md §8 — the 13-step recipe](SPEC.md#8-adding-a-spoke--recipe).

## Tech

| Layer | Choice |
|-------|--------|
| Markup | Single-file HTML per page |
| Styles | [`assets/shared.css`](assets/shared.css) (tokens, reset, body, page chrome, hub-nav) + inline `<style>` per page (hero variants, sections, `@media`) |
| Fonts | Google Fonts (DM Serif Display, Outfit, JetBrains Mono) |
| Hosting | GitHub Pages, served from `main` branch |
| Gate | [`assets/check-links.js`](assets/check-links.js) — pure Node, no deps, ~50ms — runs on every push via GitHub Actions |

No build step. No framework. Runs anywhere a browser runs.