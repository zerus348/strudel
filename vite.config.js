import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const SONGS_DIR = 'songs';
const isSong = (f) => f.endsWith('.strudel') && path.resolve(f).startsWith(path.resolve(SONGS_DIR) + path.sep);
const rel = (f) => path.relative(process.cwd(), f).split(path.sep).join('/');

/**
 * Bridge between files on disk (edited in IntelliJ / by Claude) and the browser REPL.
 *  - watches songs/**.strudel; the most recently saved file becomes the "active" one
 *  - pushes code to the browser over Vite's websocket
 *  - exposes a tiny HTTP API (/api/*) used by tools/ctl.mjs and IntelliJ run configs
 *  - keeps the REPL's status (playing / eval error) so it can be queried from the terminal
 */
function strudelBridge() {
  return {
    name: 'strudel-bridge',
    configureServer(server) {
      let active = null;
      let status = { connected: false, started: false, error: null, file: null };

      const read = (file) => fs.readFileSync(file, 'utf8');
      const listSongs = () =>
        fs.existsSync(SONGS_DIR)
          ? fs.readdirSync(SONGS_DIR, { recursive: true }).filter((f) => f.endsWith('.strudel')).sort().map((f) => `${SONGS_DIR}/${f}`)
          : [];
      const load = (file, { play } = {}) => {
        active = file;
        server.ws.send('strudel:load', { file, code: read(file), play });
      };

      active = listSongs()[0] ?? null;
      server.watcher.add(SONGS_DIR);
      const onFile = (f) => isSong(f) && load(rel(f));
      server.watcher.on('change', onFile);
      server.watcher.on('add', onFile);

      server.ws.on('strudel:status', (data) => {
        status = { ...status, ...data, connected: true };
      });
      server.ws.on('strudel:hello', () => {
        status.connected = true;
        if (active) load(active);
      });

      server.middlewares.use('/api', (req, res) => {
        const url = new URL(req.url, 'http://x');
        const send = (code, body) => {
          res.statusCode = code;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(body));
        };
        const cmd = url.pathname.replace(/^\//, '');
        if (cmd === 'status') return send(200, { ...status, active, songs: listSongs() });
        if (cmd === 'open') {
          const file = url.searchParams.get('file');
          if (!file || !isSong(file) || !fs.existsSync(file)) return send(404, { error: `no such song: ${file}` });
          load(rel(path.resolve(file)), { play: url.searchParams.get('play') === '1' });
          return send(200, { active });
        }
        if (['play', 'stop', 'toggle', 'eval'].includes(cmd)) {
          server.ws.send('strudel:cmd', { cmd });
          return send(200, { sent: cmd, browserConnected: status.connected });
        }
        send(404, { error: 'unknown command' });
      });
    },
  };
}

export default defineConfig({
  plugins: [strudelBridge()],
  server: { port: 5173, strictPort: true, open: false },
  optimizeDeps: { exclude: ['@strudel/repl'] },
  publicDir: 'samples',
});
