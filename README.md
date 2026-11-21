# spot-difference-entry

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/0xdedipra/spot-difference-entry/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/0xdedipra/spot-difference-entry/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Tideline Harbour** is an original spot-the-difference game with no image files at all — every picture is painted in code on Canvas 2D at load time. Two harbour panels sit side by side; one of them has been quietly altered, and your job is to find every change before the tide runs out.

There are three scenes of rising difficulty:

- **Morning Mooring** — 7 differences, a gentle start among boats and gulls.
- **Market Day** — 9 differences hidden in the bustle of the harbour market.
- **Lantern Dusk** — 12 differences in the lamplight, for sharp eyes only.

A tide-timer drains steadily while you search, so dawdling costs you. Each difference you find is ringed with a gold marker on both panels. Stuck? Spend a hint. At the end of a scene you earn a score and a star rating based on accuracy and time left.

You can play entirely with the mouse, and the keyboard works too: **H** for a hint, **P** to pause, **M** to mute, and **R** to restart the scene.

## Run it

```
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Any static file server pointed at the `game/` folder works just as well — the game is plain static files and needs no network connection to play.

## How it is built

All of the game logic lives under `game/src/`, in plain JavaScript with no dependencies:

- `config.js` — shared constants: scene definitions, panel sizes, timing and scoring values.
- `random.js` — a small seeded random generator so scene layouts are reproducible.
- `differences.js` — the catalogue of possible differences and where each one applies.
- `scene-painter.js` — draws the harbour scenes onto Canvas 2D, once clean and once with the chosen differences applied.
- `game-state.js` — tracks found differences, the tide-timer, hints, score and stars for the current scene.
- `input.js` — mouse clicks and keyboard shortcuts (H, P, M, R), mapped to panel coordinates.
- `audio.js` — tiny synthesized sound effects and the mute toggle; no audio files.
- `render.js` — draws each frame: panels, gold markers on found differences, the timer bar and the HUD.
- `main.js` — the entry point that wires everything together and starts the game.

The `main.ts` file at the repository root is the hand-in driver for the bounty: it copies `game/` and `screenshots/` to the output directory and writes `dossier.json` using `vendor/makefun-game.ts`.

---
<sub>Entered on [make.fun](https://make.fun/?ref=7h35kkm4&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
