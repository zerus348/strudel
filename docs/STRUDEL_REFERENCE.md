# Strudel cheat sheet

Condensed from https://strudel.cc/learn/ — verify anything unusual there. Songs are plain REPL code.

## Structure
```js
setcps(120/4/60)          // tempo: cycles per second (1 cycle = 1 bar of 4 beats). setcpm(120/4) also works
$: s("bd sd")             // each `$:` is an independent, simultaneously playing pattern
_$: s("hh*8")             // `_$:` = muted
$: stack(a, b)            // layer patterns;  cat(a,b) / seq(a,b): sequence over cycles / within one cycle
```

## Mini-notation (inside double quotes)
| syntax | meaning |
|---|---|
| `a b c` | sequence squeezed into one cycle |
| `a*2`, `a/2` | speed up / slow down |
| `[a b]` | sub-sequence (one step) |
| `a . b c` | `.` groups: same as `[a] [b c]` |
| `<a b c>` | alternate one per cycle |
| `a, b` | play in parallel (inside `[ ]` or top-level) |
| `~` | rest |
| `a@3 b` | elongate (weights); `a!2` repeat; `a _ _` hold |
| `a(3,8)`, `a(3,8,2)` | euclidean rhythm (pulses, steps, rotation) |
| `a?`, `a?0.3` | random drop |
| `a\|b` | random choice per cycle |
| `a:3` | sample index (`hh:2`) |
| `c3 e3 g3`, `c3:min`, `<Am7 Dm7>` | note names / chord symbols (with `.voicing()` or `chord()`) |

## Sources
- Sounds: `s("bd sd hh")`, `.bank("RolandTR909")`, `s("sawtooth square triangle sine")`, `s("supersaw")`, `s("piano")`, `s("gm_acoustic_bass")` (GM soundfonts), noise: `s("white pink brown")`
- Notes: `note("c3 e3 g3")`, `n("0 2 4").scale("C:minor")` (scale degrees), `note("60 64")` (midi), `.sound("sawtooth")` after `note`
- Chords: `chord("<C Am F G>").voicing()` then `.s("piano")`; `.anchor()`, `.mode()`, `.dict("ireal")`
- Drum banks (tidal-drum-machines): RolandTR808, RolandTR909, RolandTR707, LinnDrum, AkaiLinn, ... Drum names: bd sd hh oh cp rim lt mt ht cr rd
- Dirt-Samples names: bd, sd, hh, cp, arpy, bass, casio, jvbass, superpiano, breaks125, amencutup, ...
- Local/remote: `samples('github:user/repo')`, `samples({kick: 'k.wav'}, 'http://localhost:5173/')`

## Common effects & params (chain with `.`)
- Level/space: `gain(.8)`, `velocity`, `pan(0..1)`, `room(.5)` `roomsize(4)`, `delay(.5)` `delaytime(.25)` `delayfeedback(.5)`
- Filter: `lpf(800)` `hpf(200)` `bpf`, `lpq(10)`; `lpenv(4).lpa(.1)`; aliases `cutoff`, `resonance`
- Envelope: `attack(.01)` `decay` `sustain` `release(.2)`; shorthand `.adsr(".01:.1:.5:.2")`
- Distortion: `distort(2)`, `crush(4)`, `coarse(8)`, `shape(.3)`
- Sample: `speed(2)`, `begin(.25)` `end(.5)`, `loopAt(2)`, `chop(8)`, `slice(8,"0 3 2")`, `splice`, `clip(1)`, `cut(1)`
- Synth: `.vib(4).vibmod(.5)`, `fm(2)`, `detune`, `unison(5)`, `.s("supersaw")`
- Transpose: `.add(note(12))`, `.trans(-5)`, `.scaleTranspose(2)`

## Time / structure functions
`slow(2)` `fast(2)` `early(.25)` `late(.25)` `rev()` `palindrome()` `iter(4)` `ply(2)` `off(1/8, add(7))`
`every(4, rev)` `sometimes(fn)` `often` `rarely` `almostNever` `someCyclesBy(.3, fn)` `degradeBy(.3)` `jux(rev)` `superimpose(fn)`
`struct("x ~ x x")` `mask("1 0 1 1")` `euclid(3,8)` `euclidRot` `arp("0 2 1 3")` `rib(1,2)` `linger(.25)` `segment(4)`
`firstOf` `lastOf` `when`, `hurry`, `swingBy(1/3,4)`, `inside`, `chunk(4, fn)`, `stut`, `echo(3,1/8,.5)`

## Signals & modulation
`sine saw tri square perlin rand` (0–1; `sine2` etc. are -1–1), `.range(200,2000)`, `.slow(8)`, `.segment(8)`; use as args:
`.lpf(sine.range(300,3000).slow(8))`. Pattern args also accept mini strings: `.lpf("<400 800>")`. `irand(8)`, `choose(...)`.

## Visuals (shown in the REPL under the code)
`._pianoroll()`, `._scope()`, `._punchcard()`, `.pianoroll({labels:1})`; `_` prefix = inline for that `$:` only. `.color("red")`.

## Gotchas
- Double quotes = mini-notation, single quotes = plain JS strings (REPL behaviour).
- Functions take patterns: `.fast("<1 2>")`. Method names are camelCase.
- Arrow functions are fine: `.every(3, x => x.fast(2))`; many functions also accept a bare function name (`rev`).
- Comments: `//` and `/* */`. Last expression/`$:` blocks are what plays; a top-level pattern without `$:` plays too (only one).
- Keep levels sane: sum of layers clips quickly; use `.gain()` ~0.5–0.9 per layer.
- Samples/soundfonts load lazily on first use, so the first play of a new sound can be silent for a moment.
