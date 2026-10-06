import '@strudel/repl';

const repl = document.getElementById('repl');
const $ = (id) => document.getElementById(id);
let started = false;
let pendingPlay = false;
let audioUnlocked = false;

const unlock = () => {
  audioUnlocked = true;
  $('overlay').remove();
  if (pendingPlay) { pendingPlay = false; evaluate(); }
};
$('overlay').addEventListener('click', unlock);

const editor = () => repl.editor;
const evaluate = () => (audioUnlocked ? editor()?.evaluate() : (pendingPlay = true));

function report(state) {
  started = !!state.started;
  const err = state.error ?? state.evalError ?? null;
  const el = $('state');
  el.textContent = err ? 'error' : started ? 'playing' : 'stopped';
  el.className = err ? 'error' : started ? 'playing' : '';
  $('err').textContent = err ? String(err.message ?? err) : '';
  import.meta.hot?.send('strudel:status', {
    started,
    error: err ? String(err.message ?? err) : null,
    file: $('file').textContent,
  });
}
repl.addEventListener('update', (e) => report(e.detail));

function waitForEditor() {
  return new Promise((resolve) => {
    const t = setInterval(() => {
      if (editor()?.setCode) { clearInterval(t); resolve(); }
    }, 50);
  });
}

if (import.meta.hot) {
  const ready = waitForEditor();
  import.meta.hot.on('strudel:load', async ({ file, code, play }) => {
    await ready;
    $('file').textContent = file;
    editor().setCode(code);
    // Live reload: if already playing, hot-swap the new code at the next cycle.
    if (started || play) evaluate();
  });
  import.meta.hot.on('strudel:cmd', async ({ cmd }) => {
    await ready;
    if (cmd === 'play' || cmd === 'eval') evaluate();
    else if (cmd === 'stop') editor().stop();
    else if (cmd === 'toggle') (started ? editor().stop() : evaluate());
  });
  ready.then(() => import.meta.hot.send('strudel:hello'));
}
