# Strudel Studio

Music project written in [Strudel](https://strudel.cc/) (JS live-coding port of TidalCycles). The user edits in IntelliJ,
you edit the same files; a dev server plays whatever is saved in a browser tab. See `docs/WORKFLOW.md` for the setup.

## Layout
- `songs/*.strudel` – one song per file; plain Strudel REPL syntax (`$:` blocks, double-quoted strings = mini-notation). **This is where music lives.**
- `samples/` – optional local samples, served at `/` (see docs/WORKFLOW.md)
- `vite.config.js`, `src/main.js`, `index.html`, `tools/ctl.mjs` – the player bridge; rarely needs changes
- `docs/STRUDEL_REFERENCE.md` – syntax/function cheat sheet. Read it before writing patterns.

## Working on music
- Saving a `.strudel` file makes it the active song and live-reloads it in the browser (swapped in at the next cycle if playing).
  So every edit is audible immediately: make small, incremental changes and avoid half-finished/broken intermediate states.
- The user may be listening live. Don't rewrite whole songs unprompted; prefer targeted edits, and keep a working version
  (copy to a new file for big experiments, e.g. `songs/foo-v2.strudel`).
- After editing, verify with `npm run status` (needs the dev server; exit code 3 + `error` field = pattern failed to evaluate,
  4 = no browser tab connected). Fix errors before reporting back. You cannot hear the result; say so rather than claiming it sounds good.
- Do NOT start the dev server unless asked (the user normally runs it from IntelliJ: "Strudel: Dev Server"). Check `npm run status` first.
- Control: `npm run play | stop | open songs/x.strudel`.
- Only use functions/sounds documented in docs/STRUDEL_REFERENCE.md or verified at https://strudel.cc/learn/ — don't invent function names.

## Conventions
- Start songs with a comment header (style, bpm/key), set tempo with `setcps(bpm/4/60)` (or `setcpm(bpm/4)`).
- One `$:` per instrument/layer, ordered drums → bass → harmony → melody; use `_$:` to mute a layer.
- Strudel is AGPL-3.0; `@strudel/*` packages are used as dependencies.
