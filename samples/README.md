# Local samples

Served by the dev server at `http://localhost:5173/`; load with `await samples('http://localhost:5173/strudel.json')`.

- `vox/01..07.wav` — synthetic cyberpunk voice lines, generated with [Piper](https://github.com/OHF-Voice/piper1-gpl) TTS
  (voice `en_GB-alan-medium`, CC0-ish dataset; check the model card before redistributing), normalised with ffmpeg.
  01 "System breach detected." · 02 "Neural link established." · 03 "Wake up. The city is watching." · 04 "No future. No mercy."
  05 "Override." · 06 "Terminate." · 07 "We are the ghost in the machine."
- To add lines: `echo "text" | python -m piper -m en_GB-alan-medium.onnx -f out.wav`, then `ffmpeg -i out.wav -ac 1 -ar 44100 -af loudnorm=I=-16:TP=-1 samples/vox/NN.wav` and add it to `strudel.json`.
