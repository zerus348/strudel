# Workflow: IntelliJ + AI + live playback

## Why this design
Research summary (Oct 2026):
- No JetBrains plugin for Strudel exists. Strudel's audio engine is Web Audio, so playback must happen in a browser.
- Existing community bridges: [strudel.nvim](https://github.com/gruvw/strudel.nvim) (Neovim only), [strudel-server](https://github.com/micahkepe/strudel-server)
  (Playwright + Bun), [strudelplay](https://github.com/therebelrobot/strudelplay) (needs Strudel's MCP server + submodules, depends on unmerged PRs),
  a VS Code extension. None fit IntelliJ, and the heavier ones are fragile.
- Strudel officially supports embedding: the [`@strudel/repl`](https://www.npmjs.com/package/@strudel/repl) web component is the *real* REPL
  (CodeMirror, highlighting of active events, pianoroll/scope visuals, all default samples) and exposes `.editor.setCode/evaluate/stop`.

So: **files are the source of truth; a small Vite dev server watches them and pushes code to a browser tab running the real REPL.**
IntelliJ and Claude both just edit files — no special integration is needed for AI-assisted changes.

```
IntelliJ (you) ─┐
                ├─ save songs/*.strudel ─▶ Vite dev server (file watcher + /api) ─ws▶ browser tab (@strudel/repl, audio)
Claude Code ────┘                              ▲                                          │
   npm run play/stop/status ───────────────────┴──────── eval errors / playing state ◀───┘
```

## Setup (once)
1. `npm install` (Node 20+).
2. In IntelliJ, open the project; shared run configurations appear in the run dropdown:
   **Strudel: Dev Server** (long-running), **Play**, **Stop**, **Status**. `.strudel` files are mapped to JavaScript (syntax highlighting).
3. Run **Strudel: Dev Server**, then open <http://localhost:5173> in Chrome/Firefox. Click the page once
   (browser autoplay policy) — then audio is armed for the whole session.
4. Optional: bind keys under *Settings → Keymap* to the run configs (e.g. Alt+P → Strudel: Play, Alt+S → Strudel: Stop).

## Daily loop
1. Open/create `songs/foo.strudel` in IntelliJ. Saving makes it the active song (autosave works too).
2. Press **Play** (or Ctrl+Enter in the browser tab). While playing, every save hot-swaps the new code at the next cycle.
3. Ask Claude (terminal in IntelliJ, or the Claude Code plugin) for changes, e.g. "add a syncopated hi-hat layer to songs/foo.strudel".
   Claude edits the file → you see the diff in IntelliJ → it's audible immediately. Claude checks `npm run status` for evaluation errors.
4. Keep the browser tab in its own visible window; background tabs get throttled and can glitch audio timing.

## Control API
`npm run play|stop|toggle|eval|status`, `npm run open -- songs/x.strudel [--play]`; same as `curl localhost:5173/api/<cmd>`.
`status` returns `{connected, started, error, active, songs}`; exit code 3 = eval error, 4 = no browser connected.

## Local samples
Put files in `samples/` (served at `/`), add a `samples/strudel.json` mapping, and in a song:
`samples('http://localhost:5173/strudel.json')` — see https://strudel.cc/learn/samples/#loading-custom-samples.
(`samples('github:user/repo')` also works.)

## Limitations / notes
- One-way sync: edit in IntelliJ; edits typed into the browser editor are not written back to disk (and are overwritten on next save).
- Claude can't hear the output; it can only verify that the code evaluates.
- The REPL loads default sample banks from GitHub on first use, so it needs internet.
- Upgrade: `npm update @strudel/repl`. Strudel is AGPL-3.0.
