// Tideline Harbour — player input.
// One clear job: turn pointer clicks and key presses into game actions.
// It knows the canvas geometry (which panel a click landed in, which
// overlay button was pressed) and hit-tests clicks against the scene's
// difference catalogue; main.js supplies the handlers that act on them.

import { LEFT_X, RIGHT_X, PANEL_Y, PANEL } from './config.js';

// Convert a pointer event into canvas logical coordinates, accounting
// for CSS scaling of the canvas element.
export function eventToCanvas(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

// If the point is inside a panel, return { panel, x, y } in panel
// coordinates; otherwise null.
export function panelAt(px, py) {
  if (py < PANEL_Y || py >= PANEL_Y + PANEL) return null;
  if (px >= LEFT_X && px < LEFT_X + PANEL) return { panel: 0, x: px - LEFT_X, y: py - PANEL_Y };
  if (px >= RIGHT_X && px < RIGHT_X + PANEL) return { panel: 1, x: px - RIGHT_X, y: py - PANEL_Y };
  return null;
}

// Find an unfound difference whose click circle contains the panel point.
export function hitTest(scene, found, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const diff of scene.differences) {
    if (found.has(diff.id)) continue;
    const d = Math.hypot(x - diff.x, y - diff.y);
    if (d <= diff.r && d < bestDist) {
      best = diff;
      bestDist = d;
    }
  }
  return best;
}

// Wire pointer and keyboard input. handlers: {
//   onPanelClick(hit, diffOrNull, now), onButton(id), onKey(action) }
export function attachInput(canvas, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = eventToCanvas(canvas, event);
    handlers.onCanvasPoint(x, y);
  });
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'h') handlers.onKey('hint');
    else if (key === 'p') handlers.onKey('pause');
    else if (key === 'm') handlers.onKey('mute');
    else if (key === 'r') handlers.onKey('restart');
    else if (key === ' ' || key === 'enter') handlers.onKey('confirm');
  });
}
