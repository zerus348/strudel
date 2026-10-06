#!/usr/bin/env node
// Tiny CLI for the dev server's HTTP API.  Usage: node tools/ctl.mjs <play|stop|toggle|eval|status|open <file>>
const base = process.env.STRUDEL_URL ?? 'http://localhost:5173';
const [cmd, arg] = process.argv.slice(2);
const usage = () => { console.error('usage: ctl <play|stop|toggle|eval|status|open <file> [--play]>'); process.exit(2); };
if (!cmd) usage();

const path = cmd === 'open' ? `/api/open?file=${encodeURIComponent(arg ?? '')}${process.argv.includes('--play') ? '&play=1' : ''}` : `/api/${cmd}`;
try {
  const res = await fetch(base + path);
  const body = await res.json();
  console.log(JSON.stringify(body, null, 2));
  if (!res.ok) process.exit(1);
  if (cmd === 'status' && body.error) process.exit(3); // pattern failed to evaluate
  if (body.browserConnected === false) { console.error('warning: no browser tab connected'); process.exit(4); }
} catch {
  console.error(`dev server not reachable at ${base} - start it with "npm run dev"`);
  process.exit(1);
}
