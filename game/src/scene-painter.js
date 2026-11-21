// Tideline Harbour — the harbour scene painter.
// One clear job: draw ONE 560x560 harbour panel. The same code draws both
// panels; the right panel passes a variantSet containing the keys of its
// scene's differences, and every conditional object checks its key here.
// Everything is procedural — no images, no fonts, no network.

import { mulberry32, range } from './random.js';

const W = 560;
const H = 560;
const HORIZON = 330; // sea starts here
const QUAY = 452; // foreground quay starts here

// ---------- tiny drawing helpers ----------

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- scene pieces ----------

function drawCloud(ctx, x, y, s, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  for (const [dx, dy, rx, ry] of [[0, 0, 34, 15], [-26, 4, 22, 11], [26, 4, 24, 12], [0, -9, 22, 12]]) {
    ctx.beginPath();
    ctx.ellipse(x + dx * s, y + dy * s, rx * s, ry * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGull(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 7 * s, x + 11 * s, y);
  ctx.stroke();
}

function drawStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? r : r * 0.38;
    const px = x + Math.cos(ang) * rad;
    const py = y + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function clockHand(ctx, cx, cy, frac, len, width, color) {
  const a = frac * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
  ctx.stroke();
}

function drawClockTower(ctx, palette, variants) {
  // Body, roof and pennant.
  rect(ctx, 108, 180, 60, 150, '#cfc4a8');
  rect(ctx, 108, 180, 60, 8, '#b8ab8c');
  poly(ctx, [[100, 182], [176, 182], [138, 146]], palette.roofs[1]);
  ctx.strokeStyle = '#6a5a40';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(138, 146);
  ctx.lineTo(138, 126);
  ctx.stroke();
  poly(ctx, [[138, 126], [156, 131], [138, 137]], variants.has('flag2-color') ? '#c23b2e' : '#e0a92e');
  // Clock face: 10:10 in the true panel, 4:35 in the changed one.
  circle(ctx, 138, 214, 20, '#f6efdc');
  ctx.strokeStyle = '#5a4a34';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(138, 214, 20, 0, Math.PI * 2);
  ctx.stroke();
  const changed = variants.has('clock-time');
  const hourFrac = changed ? (4 + 35 / 60) / 12 : (10 + 10 / 60) / 12;
  const minFrac = changed ? 35 / 60 : 10 / 60;
  clockHand(ctx, 138, 214, hourFrac, 10, 3.4, '#3a2f22');
  clockHand(ctx, 138, 214, minFrac, 15, 2.4, '#3a2f22');
  circle(ctx, 138, 214, 2.4, '#3a2f22');
  // Door.
  rect(ctx, 130, 292, 16, 38, '#6a4a34');
}

function drawHouse(ctx, palette, x, w, top, colorIdx, roofIdx) {
  rect(ctx, x, top, w, HORIZON - top, palette.houses[colorIdx]);
  poly(ctx, [[x - 5, top], [x + w + 5, top], [x + w / 2, top - 24]], palette.roofs[roofIdx]);
}

function drawWindow(ctx, x, y, lit, palette) {
  rect(ctx, x - 7, y - 9, 14, 18, '#5a4632');
  rect(ctx, x - 5, y - 7, 10, 14, lit ? '#ffd98a' : palette.stars ? '#2c3242' : '#bcd8e4');
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 7);
  ctx.lineTo(x, y + 7);
  ctx.stroke();
}

function drawLighthouse(ctx, palette, variants) {
  // Rocky point.
  poly(ctx, [[446, HORIZON], [452, 300], [486, 292], [520, 300], [560, 306], [560, HORIZON]], '#4c4658');
  // Tower: a trapezoid with painted bands.
  poly(ctx, [[475, HORIZON], [483, 178], [513, 178], [521, HORIZON]], '#e9e3d3');
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(475, HORIZON);
  ctx.lineTo(483, 178);
  ctx.lineTo(513, 178);
  ctx.lineTo(521, HORIZON);
  ctx.closePath();
  ctx.clip();
  rect(ctx, 470, 288, 60, 22, '#3f6d8e');
  rect(ctx, 470, 232, 60, 30, variants.has('lighthouse-stripe') ? '#e07b2a' : '#c23b2e');
  rect(ctx, 470, 192, 60, 16, '#3f6d8e');
  ctx.restore();
  // Gallery and lamp room.
  rect(ctx, 478, 172, 40, 6, '#3a3f4c');
  rect(ctx, 486, 150, 24, 24, '#2c3242');
  const lampOut = variants.has('lighthouse-light');
  if (!lampOut) {
    if (palette.lanternGlow) {
      const beam = ctx.createRadialGradient(498, 162, 2, 498, 162, 46);
      beam.addColorStop(0, 'rgba(255, 233, 150, 0.55)');
      beam.addColorStop(1, 'rgba(255, 233, 150, 0)');
      ctx.fillStyle = beam;
      ctx.fillRect(452, 116, 92, 92);
    }
    circle(ctx, 498, 162, 8, '#ffe98a');
  } else {
    circle(ctx, 498, 162, 8, '#232833');
  }
  // Flag pole and flag.
  ctx.strokeStyle = '#3a3f4c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(498, 150);
  ctx.lineTo(498, 114);
  ctx.stroke();
  poly(ctx, [[498, 115], [524, 122], [498, 130]], variants.has('flag-color') ? '#2e6fc2' : '#c23b2e');
}

function drawBoat(ctx, cx, cy) {
  poly(ctx, [[cx - 27, cy - 6], [cx + 27, cy - 6], [cx + 18, cy + 10], [cx - 18, cy + 10]], '#7a5230');
  rect(ctx, cx - 27, cy - 9, 54, 4, '#96683c');
  ctx.strokeStyle = '#5a3d22';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy - 4);
  ctx.lineTo(cx + 30, cy - 22);
  ctx.stroke();
}

function drawBarrel(ctx, cx, cy, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 15, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40, 26, 16, 0.55)';
  ctx.lineWidth = 2;
  for (const dy of [-8, 0, 8]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + dy, 15, 18, 0, Math.PI * 0.25, Math.PI * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy + dy, 15, 18, 0, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();
  }
}

function drawStall(ctx, palette, x0, awningColor, stripeCount, signText) {
  // Posts and counter.
  rect(ctx, x0 + 8, 478, 6, 66, '#6a4a34');
  rect(ctx, x0 + 146, 478, 6, 66, '#6a4a34');
  rect(ctx, x0, 500, 160, 44, '#8a6a48');
  rect(ctx, x0, 492, 160, 9, '#a87f52');
  // Awning: a slanted canopy with vertical stripes clipped to its shape.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0 - 4, 480);
  ctx.lineTo(x0 + 164, 480);
  ctx.lineTo(x0 + 152, 446);
  ctx.lineTo(x0 + 8, 446);
  ctx.closePath();
  ctx.clip();
  rect(ctx, x0 - 4, 446, 168, 34, '#efe9da');
  const sw = 168 / stripeCount;
  ctx.fillStyle = awningColor;
  for (let i = 0; i < stripeCount; i += 2) ctx.fillRect(x0 - 4 + i * sw, 446, sw, 34);
  ctx.restore();
  ctx.strokeStyle = 'rgba(60, 40, 24, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0 - 4, 480);
  ctx.lineTo(x0 + 164, 480);
  ctx.lineTo(x0 + 152, 446);
  ctx.lineTo(x0 + 8, 446);
  ctx.closePath();
  ctx.stroke();
  // Hanging sign with the stall's name.
  rect(ctx, x0 + 40, 482, 80, 21, '#5a4632');
  rect(ctx, x0 + 42, 484, 76, 17, '#f0e6cc');
  ctx.fillStyle = '#4a3423';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(signText, x0 + 80, 493);
}

// ---------- the panel itself ----------

// Draws the whole harbour into ctx, which must already be translated so
// that (0,0) is the panel's top-left corner. variantSet holds the keys of
// the differences to apply (empty for the true panel).
export function drawPanel(ctx, scene, variantSet) {
  const palette = scene.palette;
  const variants = variantSet;
  const rng = mulberry32(scene.seed); // reset per panel: identical decoration

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
  sky.addColorStop(0, palette.sky[0]);
  sky.addColorStop(0.55, palette.sky[1]);
  sky.addColorStop(1, palette.sky[2]);
  rect(ctx, 0, 0, W, HORIZON, sky);

  // Stars (dusk only).
  if (palette.stars) {
    for (let i = 0; i < 70; i++) {
      const sx = range(rng, 4, W - 4);
      const sy = range(rng, 4, 240);
      const sr = range(rng, 0.6, 1.7);
      ctx.globalAlpha = range(rng, 0.3, 0.9);
      circle(ctx, sx, sy, sr, '#ffffff');
    }
    ctx.globalAlpha = 1;
  }

  // The difference star: one bright star that only exists on the right.
  if (variants.has('star-appears')) drawStar(ctx, 108, 58, 11, '#fff3b0');

  // Sun or moon.
  const glow = ctx.createRadialGradient(468, 84, 4, 468, 84, 74);
  glow.addColorStop(0, palette.glow);
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(394, 10, 148, 148);
  if (palette.celestial === 'sun') {
    circle(ctx, 468, 84, 31, palette.celestialColor);
    circle(ctx, 468, 84, 26, '#ffe98a');
  } else if (variants.has('moon-crescent')) {
    circle(ctx, 468, 84, 29, palette.celestialColor);
    ctx.fillStyle = sky;
    ctx.beginPath();
    ctx.arc(482, 76, 25, 0, Math.PI * 2);
    ctx.fill();
  } else {
    circle(ctx, 468, 84, 29, palette.celestialColor);
    circle(ctx, 452, 74, 5, 'rgba(180, 170, 150, 0.5)');
    circle(ctx, 478, 96, 4, 'rgba(180, 170, 150, 0.5)');
  }

  // Clouds.
  const cloudAlpha = palette.stars ? 0.28 : 0.95;
  drawCloud(ctx, 90, 66, 1.0, cloudAlpha);
  if (!variants.has('cloud-gone')) drawCloud(ctx, 255, 52, 0.8, cloudAlpha);
  drawCloud(ctx, 395, 118, 1.1, cloudAlpha);

  // Gulls.
  const gullColor = palette.stars ? '#cfd6ee' : '#3c4a56';
  drawGull(ctx, 150, 140, 1.0, gullColor);
  if (!variants.has('gull-missing')) drawGull(ctx, 180, 120, 0.85, gullColor);
  drawGull(ctx, 225, 150, 1.1, gullColor);
  drawGull(ctx, 350, 105, 0.9, gullColor);
  if (variants.has('gull-extra')) drawGull(ctx, 305, 92, 1.0, gullColor);

  // Far headland on the left.
  poly(ctx, [[0, HORIZON], [0, 240], [60, 226], [128, 248], [186, 282], [214, HORIZON]], palette.hill);

  // Clock tower and houses along the far shore.
  drawClockTower(ctx, palette, variants);
  drawHouse(ctx, palette, 176, 62, 258, 0, 0);
  drawHouse(ctx, palette, 244, 70, 246, 1, 1);
  drawHouse(ctx, palette, 320, 64, 254, 2, 2);
  drawHouse(ctx, palette, 388, 54, 266, 3, 3);
  if (variants.has('house-color')) rect(ctx, 320, 254, 64, HORIZON - 254, '#d98a7a');

  // Chimney smoke on the second house.
  if (!variants.has('smoke-gone')) {
    ctx.fillStyle = palette.stars ? 'rgba(220, 220, 235, 0.5)' : 'rgba(255, 255, 255, 0.75)';
    for (const [sx, sy, sr] of [[302, 222, 7], [297, 207, 9], [306, 191, 12]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  rect(ctx, 296, 230, 12, 18, '#8a5a48');

  // Windows. The two special windows carry differences; the rest are set
  // dressing whose lit/dark pattern is fixed per palette.
  const plainLit = palette.stars;
  drawWindow(ctx, 194, 282, plainLit, palette);
  drawWindow(ctx, 220, 282, false, palette);
  drawWindow(ctx, 262, 280, !variants.has('window-lit'), palette); // special: lit -> dark
  drawWindow(ctx, 288, 280, plainLit, palette);
  drawWindow(ctx, 358, 280, variants.has('window2-dark'), palette); // special: dark -> lit
  drawWindow(ctx, 404, 288, plainLit, palette);
  drawWindow(ctx, 424, 288, false, palette);

  drawLighthouse(ctx, palette, variants);

  // Sea.
  const sea = ctx.createLinearGradient(0, HORIZON, 0, QUAY);
  sea.addColorStop(0, palette.sea[0]);
  sea.addColorStop(1, palette.sea[1]);
  rect(ctx, 0, HORIZON, W, QUAY - HORIZON, sea);

  // Lighthouse reflection: a shimmering column under the tower.
  if (!variants.has('reflection-gone')) {
    ctx.fillStyle = 'rgba(255, 214, 130, 0.30)';
    let ry = 340;
    let rw = 34;
    while (ry < 428) {
      const off = range(rng, -4, 4);
      ctx.fillRect(498 - rw / 2 + off, ry, rw, 3);
      ry += range(rng, 7, 12);
      rw = Math.max(10, rw - 2.5);
    }
  }

  // Celestial glitter path on the water.
  ctx.fillStyle = palette.waterSparkle;
  for (let i = 0; i < 26; i++) {
    const gy = range(rng, 338, 440);
    const gw = range(rng, 5, 22);
    const gx = 468 + range(rng, -16, 16) - gw / 2;
    ctx.fillRect(gx, gy, gw, 2);
  }

  // Wave dashes.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 30; i++) {
    const wx = range(rng, 6, W - 26);
    const wy = range(rng, 342, 444);
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + range(rng, 10, 22), wy);
    ctx.stroke();
  }

  // Sailboat.
  const sailColor = variants.has('sail-color') ? '#e2604d' : '#f6f2e6';
  poly(ctx, [[330, 322], [330, 376], [368, 376]], sailColor);
  poly(ctx, [[326, 330], [326, 376], [302, 376]], '#e3dcc8');
  rect(ctx, 328, 316, 3, 66, '#5a4632');
  poly(ctx, [[300, 382], [364, 382], [352, 396], [312, 396]], '#8a4a34');
  // Rowboat: moored left in the true panel, drifted right in the changed one.
  drawBoat(ctx, variants.has('boat-moved') ? 248 : 170, 398);
  // Buoy.
  poly(ctx, [[76, 424], [100, 424], [88, 402]], variants.has('buoy-color') ? '#3fae5a' : '#c23b2e');
  ellipse(ctx, 88, 428, 17, 4, 'rgba(255, 255, 255, 0.35)');

  // Quay.
  rect(ctx, 0, QUAY, W, H - QUAY, palette.quay);
  rect(ctx, 0, QUAY, W, 6, palette.quayDark);
  ctx.strokeStyle = 'rgba(70, 55, 35, 0.25)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 502);
  ctx.lineTo(W, 502);
  ctx.stroke();
  for (let x = 46; x < W; x += 74) {
    ctx.beginPath();
    ctx.moveTo(x, QUAY + 8);
    ctx.lineTo(x - 8, H);
    ctx.stroke();
  }

  // Market stalls. The fish stall's awning stripe count and sign letter
  // change; the tea stall's awning colour and sign letter change.
  drawStall(ctx, palette, 36, '#c23b2e', variants.has('awning-stripes') ? 4 : 7, variants.has('sign-letter') ? 'DISH' : 'FISH');
  drawStall(ctx, palette, 372, variants.has('awning2-color') ? '#7a4a9e' : '#2e8a7a', 6, variants.has('sign2-letter') ? 'SEA' : 'TEA');
  // Fish crates on the fish stall counter.
  for (const fx of [52, 168]) {
    rect(ctx, fx, 480, 22, 12, '#a87f52');
    ellipse(ctx, fx + 11, 480, 8, 3.4, '#7d94a6');
  }

  // Lantern posts with a string of lights between them.
  for (const lx of [216, 356]) {
    rect(ctx, lx - 3, 448, 6, 96, '#3a3f4c');
  }
  ctx.strokeStyle = 'rgba(40, 40, 50, 0.7)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(216, 452);
  ctx.quadraticCurveTo(286, 480, 356, 452);
  ctx.stroke();
  const bulbMissing = variants.has('lamp-bulb-missing');
  for (let i = 0; i < 9; i++) {
    if (bulbMissing && i === 4) continue;
    const t = 0.06 + (i / 8) * 0.88;
    const bx = (1 - t) * (1 - t) * 216 + 2 * (1 - t) * t * 286 + t * t * 356;
    const by = (1 - t) * (1 - t) * 452 + 2 * (1 - t) * t * 480 + t * t * 452;
    if (palette.lanternGlow) {
      circle(ctx, bx, by + 5, 7, 'rgba(255, 210, 110, 0.35)');
    }
    circle(ctx, bx, by + 5, 3.2, palette.lanternGlow ? '#ffd76e' : '#e8e2d0');
  }
  // Lantern heads. The right one is missing entirely in the changed panel.
  for (const lx of [216, 356]) {
    if (lx === 356 && variants.has('lantern-missing')) {
      rect(ctx, lx - 4, 446, 8, 4, '#3a3f4c');
      continue;
    }
    if (palette.lanternGlow) {
      const g = ctx.createRadialGradient(lx, 442, 2, lx, 442, 26);
      g.addColorStop(0, 'rgba(255, 214, 110, 0.6)');
      g.addColorStop(1, 'rgba(255, 214, 110, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(lx - 26, 416, 52, 52);
    }
    rect(ctx, lx - 7, 432, 14, 18, '#2c3242');
    rect(ctx, lx - 4.5, 435, 9, 12, palette.lanternGlow ? '#ffd76e' : '#cfd8de');
    poly(ctx, [[lx - 9, 432], [lx + 9, 432], [lx, 424]], '#2c3242');
  }

  // Crates by the fish stall: three in the true panel, two in the changed.
  rect(ctx, 38, 502, 28, 28, '#a87f52');
  rect(ctx, 68, 502, 28, 28, '#966f42');
  if (!variants.has('crates-count')) rect(ctx, 53, 474, 28, 28, '#b08a58');
  ctx.strokeStyle = 'rgba(70, 48, 26, 0.5)';
  ctx.lineWidth = 1.4;
  for (const [cx, cy] of [[38, 502], [68, 502]]) ctx.strokeRect(cx, cy, 28, 28);
  if (!variants.has('crates-count')) ctx.strokeRect(53, 474, 28, 28);

  // Barrels: one stands still, one rolls sideways in the changed panel.
  drawBarrel(ctx, 250, 524, '#8a6a48');
  drawBarrel(ctx, variants.has('barrel-moved') ? 336 : 296, 520, '#7a5c3c');

  // A gull standing on a bollard, watching the tide.
  rect(ctx, 416, 452, 10, 16, '#4c4658');
  ellipse(ctx, 421, 446, 10, 6, '#f2f2ee');
  circle(ctx, 429, 441, 4.4, '#f2f2ee');
  poly(ctx, [[433, 441], [439, 443], [433, 445]], '#e0a92e');
}
