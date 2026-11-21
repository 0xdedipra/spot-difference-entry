// Tideline Harbour — rendering.
// One clear job: draw the whole game onto the canvas from the state —
// header HUD, timer bar, the two harbour panels, found markers, hint
// rings, miss ripples, and every overlay screen. It never changes state.

import {
  CANVAS_W, CANVAS_H, PANEL, LEFT_X, RIGHT_X, PANEL_Y,
  TIMER_Y, TIMER_H, MARKER_BLOOM_MS, RIPPLE_MS, SHAKE_MS,
} from './config.js';
import { SCENES } from './differences.js';
import { currentScene } from './game-state.js';
import { drawPanel } from './scene-painter.js';

const INK = '#eef3f8';
const GOLD = '#f2b63c';
const PAGE = '#101d2c';

// Buttons the overlays offer, per screen. input handling in main.js
// hit-tests against this same list, so what is drawn is what is clickable.
export function overlayButtons(game) {
  switch (game.screen) {
    case 'title':
      return [{ id: 'start', x: 480, y: 536, w: 240, h: 52, label: 'START' }];
    case 'paused':
      return [
        { id: 'resume', x: 370, y: 416, w: 200, h: 48, label: 'RESUME' },
        { id: 'restart', x: 630, y: 416, w: 200, h: 48, label: 'RESTART SCENE' },
      ];
    case 'sceneComplete':
      return [{ id: 'next', x: 480, y: 416, w: 240, h: 48, label: 'NEXT SCENE' }];
    case 'timeUp':
      return [{ id: 'retry', x: 480, y: 416, w: 240, h: 48, label: 'RETRY SCENE' }];
    case 'gameComplete':
      return [{ id: 'again', x: 480, y: 500, w: 240, h: 50, label: 'PLAY AGAIN' }];
    default:
      return [];
  }
}

function text(ctx, str, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function roundedRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawButton(ctx, btn) {
  roundedRect(ctx, btn.x, btn.y, btn.w, btn.h, 10, GOLD);
  roundedRect(ctx, btn.x, btn.y + btn.h - 8, btn.w, 8, 4, 'rgba(0,0,0,0.12)');
  text(ctx, btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1, 'bold 19px system-ui, sans-serif', '#23180a', 'center');
}

function drawStars(ctx, cx, y, count, size) {
  const str = '★'.repeat(count) + '☆'.repeat(3 - count);
  text(ctx, str, cx, y, `${size}px Georgia, serif`, GOLD, 'center');
}

// ---------- in-play drawing ----------

function drawHeader(ctx, game) {
  const scene = currentScene(game);
  const remaining = scene.differences.length - game.found.size;
  text(ctx, `SCENE ${game.sceneIndex + 1} · ${scene.name.toUpperCase()}`, 24, 26, 'bold 17px system-ui, sans-serif', INK);
  text(ctx, `Hints left: ${game.hintsLeft}`, 24, 48, '13px system-ui, sans-serif', 'rgba(238,243,248,0.65)');
  text(ctx, `${remaining} TO FIND`, CANVAS_W / 2, 32, 'bold 31px system-ui, sans-serif', remaining <= 3 ? '#ff9d5c' : INK, 'center');
  text(ctx, `SCORE ${game.score}`, CANVAS_W - 24, 26, 'bold 19px system-ui, sans-serif', GOLD, 'right');
  const secs = Math.max(0, Math.ceil(game.timeLeft));
  text(ctx, `${secs}s`, CANVAS_W - 24, 48, '13px system-ui, sans-serif', secs <= 20 ? '#ff7a5c' : 'rgba(238,243,248,0.65)', 'right');
}

function drawTimerBar(ctx, game) {
  const scene = currentScene(game);
  const frac = Math.max(0, game.timeLeft / scene.timeLimit);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, TIMER_Y, CANVAS_W, TIMER_H);
  ctx.fillStyle = frac > 0.5 ? '#57b96a' : frac > 0.25 ? '#f2b63c' : '#e2604d';
  ctx.fillRect(0, TIMER_Y, CANVAS_W * frac, TIMER_H);
}

function drawMarker(ctx, x, y, diff, foundAt, now) {
  const p = Math.min(1, (now - foundAt) / MARKER_BLOOM_MS);
  const ease = 1 - Math.pow(1 - p, 3);
  const pulse = p >= 1 ? 1 + 0.03 * Math.sin(now / 300 + diff.x) : 1;
  const r = diff.r * (0.35 + 0.5 * ease) * pulse;
  ctx.save();
  ctx.globalAlpha = 0.25 * p;
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = p;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 240, 200, 0.9)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, r - 3.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPanels(ctx, game, now) {
  const scene = currentScene(game);
  const variants = new Set(scene.differences.map((d) => d.key));
  const shaking = now < game.shakeUntil;
  const shakeX = shaking ? Math.sin(now * 0.09) * 3 * ((game.shakeUntil - now) / SHAKE_MS) : 0;

  text(ctx, 'THE TRUE HARBOUR', LEFT_X + 2, 84, 'bold 12px system-ui, sans-serif', 'rgba(238,243,248,0.6)');
  text(ctx, 'THE CHANGED HARBOUR', RIGHT_X + 2, 84, 'bold 12px system-ui, sans-serif', 'rgba(238,243,248,0.6)');

  for (const [panelIdx, originX] of [[0, LEFT_X], [1, RIGHT_X]]) {
    ctx.save();
    ctx.translate(originX + shakeX, PANEL_Y);
    ctx.beginPath();
    ctx.rect(0, 0, PANEL, PANEL);
    ctx.clip();
    drawPanel(ctx, scene, panelIdx === 1 ? variants : new Set());
    // Found markers bloom on both panels at once.
    for (const diff of scene.differences) {
      if (game.found.has(diff.id)) drawMarker(ctx, diff.x, diff.y, diff, game.markers.get(diff.id) ?? now, now);
    }
    // Hint ring around one unfound difference.
    if (game.hint && now < game.hint.until) {
      const diff = scene.differences.find((d) => d.id === game.hint.diffId);
      if (diff) {
        const phase = ((now - game.hint.start) / 300) % 1;
        ctx.save();
        ctx.globalAlpha = 0.95 * (1 - phase);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(diff.x, diff.y, 12 + phase * 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    // Miss ripples: a red X that expands and fades where the click landed.
    for (const ripple of game.ripples) {
      if (ripple.panel !== panelIdx) continue;
      const age = now - ripple.t;
      if (age < 0 || age > RIPPLE_MS) continue;
      const p = age / RIPPLE_MS;
      const s = 6 + p * 13;
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.strokeStyle = '#ff5c48';
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ripple.x - s, ripple.y - s);
      ctx.lineTo(ripple.x + s, ripple.y + s);
      ctx.moveTo(ripple.x + s, ripple.y - s);
      ctx.lineTo(ripple.x - s, ripple.y + s);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    // Panel frame.
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(originX + shakeX, PANEL_Y, PANEL, PANEL);
  }
}

// ---------- overlays ----------

function dimPanels(ctx) {
  ctx.fillStyle = 'rgba(8, 14, 24, 0.74)';
  ctx.fillRect(0, PANEL_Y - 18, CANVAS_W, CANVAS_H - PANEL_Y + 18);
}

function card(ctx, y, h) {
  roundedRect(ctx, 300, y, 600, h, 16, '#1b2f47');
  ctx.strokeStyle = 'rgba(242, 182, 60, 0.5)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(300, y, 600, h, 16);
  ctx.stroke();
}

function drawTitle(ctx, game, now) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#1a2c4e');
  grad.addColorStop(1, '#0d1624');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  text(ctx, 'TIDELINE HARBOUR', CANVAS_W / 2, 62, 'bold 52px Georgia, serif', GOLD, 'center');
  text(ctx, 'S P O T   T H E   D I F F E R E N C E', CANVAS_W / 2, 106, '16px system-ui, sans-serif', 'rgba(238,243,248,0.75)', 'center');

  // A live preview of scene 1: both panels, small, side by side.
  const scene = SCENES[0];
  const scale = 0.55;
  const size = PANEL * scale;
  const y = 140;
  for (const [panelIdx, x] of [[0, CANVAS_W / 2 - size - 10], [1, CANVAS_W / 2 + 10]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.rect(0, 0, PANEL, PANEL);
    ctx.clip();
    drawPanel(ctx, scene, panelIdx === 1 ? new Set(scene.differences.map((d) => d.key)) : new Set());
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
  }
  text(ctx, 'Three harbours, three tides. Click anything that changed between the two pictures —', CANVAS_W / 2, 478, '16px system-ui, sans-serif', INK, 'center');
  text(ctx, 'but mind the clock: a wrong click costs 3 seconds, and when the timer runs out the tide comes in.', CANVAS_W / 2, 502, '16px system-ui, sans-serif', INK, 'center');
  for (const btn of overlayButtons(game)) drawButton(ctx, btn);
  text(ctx, 'H hint · P pause · M mute · R restart', CANVAS_W / 2, 636, '13px system-ui, sans-serif', 'rgba(238,243,248,0.5)', 'center');
}

function drawSceneComplete(ctx, game) {
  dimPanels(ctx);
  card(ctx, 236, 264);
  const scene = currentScene(game);
  text(ctx, 'SCENE COMPLETE', CANVAS_W / 2, 282, 'bold 30px Georgia, serif', GOLD, 'center');
  text(ctx, scene.name, CANVAS_W / 2, 314, '16px system-ui, sans-serif', 'rgba(238,243,248,0.75)', 'center');
  drawStars(ctx, CANVAS_W / 2, 356, game.sceneStars[game.sceneIndex] ?? 0, 40);
  text(ctx, `Time bonus +${Math.round(game.timeLeft)} · Scene score ${game.sceneScores[game.sceneIndex] ?? 0}`, CANVAS_W / 2, 394, '17px system-ui, sans-serif', INK, 'center');
  for (const btn of overlayButtons(game)) drawButton(ctx, btn);
}

function drawTimeUp(ctx, game) {
  dimPanels(ctx);
  card(ctx, 236, 264);
  const scene = currentScene(game);
  text(ctx, 'THE TIDE CAME IN', CANVAS_W / 2, 282, 'bold 30px Georgia, serif', '#ff9d5c', 'center');
  text(ctx, `You found ${game.found.size} of ${scene.differences.length} differences in ${scene.name}.`, CANVAS_W / 2, 330, '17px system-ui, sans-serif', INK, 'center');
  text(ctx, 'The harbour is under water — for now.', CANVAS_W / 2, 360, '15px system-ui, sans-serif', 'rgba(238,243,248,0.7)', 'center');
  for (const btn of overlayButtons(game)) drawButton(ctx, btn);
}

function drawPaused(ctx, game) {
  dimPanels(ctx);
  card(ctx, 236, 264);
  text(ctx, 'PAUSED', CANVAS_W / 2, 300, 'bold 32px Georgia, serif', INK, 'center');
  text(ctx, 'The tide waits for no one — except now.', CANVAS_W / 2, 344, '16px system-ui, sans-serif', 'rgba(238,243,248,0.75)', 'center');
  for (const btn of overlayButtons(game)) drawButton(ctx, btn);
}

function drawGameComplete(ctx, game) {
  dimPanels(ctx);
  card(ctx, 176, 400);
  text(ctx, 'HARBOUR COMPLETE', CANVAS_W / 2, 222, 'bold 32px Georgia, serif', GOLD, 'center');
  text(ctx, 'You beat all three tides of Tideline Harbour.', CANVAS_W / 2, 256, '16px system-ui, sans-serif', 'rgba(238,243,248,0.8)', 'center');
  text(ctx, `${game.score}`, CANVAS_W / 2, 312, 'bold 54px system-ui, sans-serif', INK, 'center');
  text(ctx, 'TOTAL SCORE', CANVAS_W / 2, 348, '13px system-ui, sans-serif', 'rgba(238,243,248,0.6)', 'center');
  SCENES.forEach((scene, i) => {
    const y = 392 + i * 32;
    text(ctx, scene.name, 420, y, '16px system-ui, sans-serif', INK);
    text(ctx, `${game.sceneScores[i] ?? 0} pts`, 640, y, '16px system-ui, sans-serif', 'rgba(238,243,248,0.8)');
    const stars = '★'.repeat(game.sceneStars[i] ?? 0) + '☆'.repeat(3 - (game.sceneStars[i] ?? 0));
    text(ctx, stars, 780, y, '18px Georgia, serif', GOLD, 'right');
  });
  for (const btn of overlayButtons(game)) drawButton(ctx, btn);
}

// ---------- top level ----------

export function drawGame(ctx, game, now) {
  ctx.fillStyle = PAGE;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  if (game.screen === 'title') {
    drawTitle(ctx, game, now);
    return;
  }
  drawHeader(ctx, game);
  drawTimerBar(ctx, game);
  drawPanels(ctx, game, now);
  if (game.screen === 'paused') drawPaused(ctx, game);
  else if (game.screen === 'sceneComplete') drawSceneComplete(ctx, game);
  else if (game.screen === 'timeUp') drawTimeUp(ctx, game);
  else if (game.screen === 'gameComplete') drawGameComplete(ctx, game);
}
