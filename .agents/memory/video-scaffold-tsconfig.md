---
name: video-js scaffold tsconfig lacks DOM lib
description: Typecheck fix needed for video-js artifacts in this repo
---
The video-js artifact scaffold extends `tsconfig.base.json`, which sets `"lib": ["es2022"]` only. Any code touching `window`/`document`/`HTMLAudioElement` fails `pnpm --filter <slug> run typecheck` with TS2304/TS2812.

**Why:** base config is server-oriented; the scaffold doesn't override `lib`.

**How to apply:** add `"lib": ["ES2022", "DOM", "DOM.Iterable"]` to the artifact's `tsconfig.json` compilerOptions. The Vite dev server runs fine either way — only typecheck is affected.
