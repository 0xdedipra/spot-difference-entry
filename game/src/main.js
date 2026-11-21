// Tideline Harbour — boot and wiring.
// One clear job: connect the pieces — create the game state, hook up
// input and the toolbar, run the clock and the render loop, and set up
// the deterministic screenshot states (?shot=title|cover|dusk|complete).

import { HINT_PULSE_MS, TIME_BONUS_PER_FIND, MISS_PENALTY_SECONDS, FIND_POINTS, HINT_COST, SHAKE_MS } from './config.js';
import { SCENES } from './differences.js';
import { createGame, currentScene, startScene, completeScene, nextScene, restartGame } from './game-state.js';
import { attachInput, panelAt, hitTest } from './input.js';
import { drawGame, overlayButtons } from './render.js';
import { unlockAudio, playFound, playMiss, playClick, playComplete, toggleMute, setAudioEnabled } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = createGame();

// Score snapshot at the start of the current scene, so restarting a
// scene does not let a player farm points by replaying it.
let scoreAtSceneStart = 0;

function beginScene(index) {
  scoreAtSceneStart = game.score;
  startScene(game, index);
}

function restartScene() {
  game.score = scoreAtSceneStart;
  startScene(game, game.sceneIndex);
}

// ---------- actions ----------

function doHint(now) {
  if (game.screen !== 'playing' || game.hintsLeft <= 0) return;
  const scene = currentScene(game);
  const unfound = scene.differences.filter((d) => !game.found.has(d.id));
  if (unfound.length === 0) return;
  const target = unfound[Math.floor(Math.random() * unfound.length)];
  game.hintsLeft -= 1;
  game.score = Math.max(0, game.score - HINT_COST);
  game.hint = { diffId: target.id, start: now, until: now + HINT_PULSE_MS };
  playClick();
}

function doButton(id, now) {
  playClick();
  if (id === 'start') {
    game.score = 0;
    game.sceneScores = [];
    game.sceneStars = [];
    beginScene(0);
  } else if (id === 'resume') {
    game.screen = 'playing';
  } else if (id === 'restart' || id === 'retry') {
    restartScene();
  } else if (id === 'next') {
    beginScene(game.sceneIndex + 1);
  } else if (id === 'again') {
    game.score = 0;
    game.sceneScores = [];
    game.sceneStars = [];
    beginScene(0);
  }
}

function onCanvasPoint(x, y, now) {
  unlockAudio();
  for (const btn of overlayButtons(game)) {
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      doButton(btn.id, now);
      return;
    }
  }
  if (game.screen !== 'playing') return;
  const hit = panelAt(x, y);
  if (!hit) return;
  const scene = currentScene(game);
  const diff = hitTest(scene, game.found, hit.x, hit.y);
  if (diff) {
    game.found.add(diff.id);
    game.markers.set(diff.id, now);
    game.score += FIND_POINTS;
    game.timeLeft = Math.min(scene.timeLimit, game.timeLeft + TIME_BONUS_PER_FIND);
    if (game.hint && game.hint.diffId === diff.id) game.hint = null;
    playFound();
    if (game.found.size === scene.differences.length) {
      completeScene(game);
      playComplete();
    }
  } else {
    game.timeLeft -= MISS_PENALTY_SECONDS;
    game.ripples.push({ x: hit.x, y: hit.y, panel: hit.panel, t: now });
    game.shakeUntil = now + SHAKE_MS;
    playMiss();
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      game.screen = 'timeUp';
    }
  }
}

function onKey(action, now) {
  unlockAudio();
  if (action === 'hint') doHint(now);
  else if (action === 'pause') {
    if (game.screen === 'playing') game.screen = 'paused';
    else if (game.screen === 'paused') game.screen = 'playing';
  } else if (action === 'mute') {
    updateMuteButton(toggleMute());
  } else if (action === 'restart') {
    if (game.screen === 'playing' || game.screen === 'paused' || game.screen === 'timeUp') restartScene();
  } else if (action === 'confirm') {
    const buttons = overlayButtons(game);
    if (buttons.length > 0) doButton(buttons[0].id, now);
  }
}

// ---------- toolbar (DOM buttons mirror the keys) ----------

const muteButton = document.getElementById('btn-mute');
function updateMuteButton(muted) {
  if (muteButton) muteButton.textContent = muted ? 'Unmute (M)' : 'Mute (M)';
}
document.getElementById('btn-hint')?.addEventListener('click', () => { unlockAudio(); doHint(performance.now()); });
document.getElementById('btn-pause')?.addEventListener('click', () => { unlockAudio(); onKey('pause', performance.now()); });
document.getElementById('btn-restart')?.addEventListener('click', () => { unlockAudio(); onKey('restart', performance.now()); });
muteButton?.addEventListener('click', () => { unlockAudio(); updateMuteButton(toggleMute()); });

// ---------- screenshot states ----------

const SHOT_NOW = 1000; // frozen clock for screenshots: markers fully bloomed

function setupShot(shot) {
  game.shotMode = true;
  setAudioEnabled(false);
  if (shot === 'cover') {
    // Scene 2, mid-play: five found, four to go, ~60% of the tide left.
    startScene(game, 1);
    const scene = currentScene(game);
    for (const diff of scene.differences.slice(0, 5)) {
      game.found.add(diff.id);
      game.markers.set(diff.id, 0);
    }
    game.score = 500;
    game.timeLeft = scene.timeLimit * 0.6;
  } else if (shot === 'dusk') {
    // Scene 3, mid-play: five found, seven to go, a hint ring showing,
    // ~45% of the tide left.
    startScene(game, 2);
    const scene = currentScene(game);
    for (const diff of scene.differences.slice(0, 5)) {
      game.found.add(diff.id);
      game.markers.set(diff.id, 0);
    }
    game.score = 1650;
    game.timeLeft = scene.timeLimit * 0.45;
    game.hintsLeft = 2;
    const target = scene.differences[5];
    game.hint = { diffId: target.id, start: SHOT_NOW - 135, until: SHOT_NOW + 1000 };
  } else if (shot === 'complete') {
    startScene(game, 2);
    const scene = currentScene(game);
    for (const diff of scene.differences) {
      game.found.add(diff.id);
      game.markers.set(diff.id, 0);
    }
    game.sceneScores = [1080, 940, 630];
    game.sceneStars = [3, 2, 3];
    game.score = 2650;
    game.screen = 'gameComplete';
  } else {
    game.screen = 'title';
  }
}

// ---------- boot and loop ----------

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) setupShot(shot);

attachInput(canvas, {
  onCanvasPoint: (x, y) => onCanvasPoint(x, y, performance.now()),
  onKey: (action) => onKey(action, performance.now()),
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!game.shotMode) {
    if (game.screen === 'playing') {
      game.timeLeft -= dt;
      if (game.timeLeft <= 0) {
        game.timeLeft = 0;
        game.screen = 'timeUp';
      }
    }
    drawGame(ctx, game, now);
  } else {
    drawGame(ctx, game, SHOT_NOW);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
