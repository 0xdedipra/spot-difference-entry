// Tideline Harbour — the game state machine.
// One clear job: own the game's state and its transitions — which screen
// we are on, the clock, the score, what has been found. Rendering and
// input read this state; only the functions here (and main.js, through
// them) change it.

import { SCENES } from './differences.js';
import { HINTS_PER_SCENE } from './config.js';

export function createGame() {
  return {
    screen: 'title', // title | playing | paused | sceneComplete | timeUp | gameComplete
    sceneIndex: 0,
    score: 0,
    timeLeft: 0,
    found: new Set(), // difference ids found in the current scene
    markers: new Map(), // difference id -> timestamp (ms) when found
    hintsLeft: HINTS_PER_SCENE,
    hint: null, // { diffId, until } while a hint ring is showing
    ripples: [], // { x, y, panel, t } miss effects, panel coords
    shakeUntil: 0,
    sceneScores: [], // points earned per finished scene
    sceneStars: [], // stars earned per finished scene
    shotMode: false,
  };
}

export function currentScene(game) {
  return SCENES[game.sceneIndex];
}

export function startScene(game, index) {
  game.sceneIndex = index;
  const scene = SCENES[index];
  game.timeLeft = scene.timeLimit;
  game.found = new Set();
  game.markers = new Map();
  game.hintsLeft = HINTS_PER_SCENE;
  game.hint = null;
  game.ripples = [];
  game.shakeUntil = 0;
  game.screen = 'playing';
}

export function starsFor(timeLeft, timeLimit) {
  const frac = timeLeft / timeLimit;
  if (frac > 0.5) return 3;
  if (frac > 0.25) return 2;
  return 1;
}

// Called when the last difference of a scene is found. Awards the time
// bonus, records the scene's score and stars, and moves to the overlay.
export function completeScene(game) {
  const scene = currentScene(game);
  const bonus = Math.round(game.timeLeft);
  game.score += bonus;
  game.sceneScores[game.sceneIndex] = game.found.size * 100 + bonus - hintPenalty(game);
  game.sceneStars[game.sceneIndex] = starsFor(game.timeLeft, scene.timeLimit);
  game.screen = game.sceneIndex === SCENES.length - 1 ? 'gameComplete' : 'sceneComplete';
  return bonus;
}

// Hints already paid for in this scene, so the per-scene score adds up.
export function hintPenalty(game) {
  return (HINTS_PER_SCENE - game.hintsLeft) * 25;
}

export function nextScene(game) {
  startScene(game, game.sceneIndex + 1);
}

export function restartGame(game) {
  game.score = 0;
  game.sceneScores = [];
  game.sceneStars = [];
  startScene(game, 0);
}
