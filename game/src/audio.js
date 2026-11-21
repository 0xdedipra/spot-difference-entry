// Tideline Harbour — generated sound effects.
// One clear job: small WebAudio chimes and thuds, synthesised in code (no
// audio files). The context is created lazily on the first user gesture,
// as browsers require, and everything is a silent no-op in shot mode or
// when muted.

let ctx = null;
let muted = false;
let enabled = true; // main.js turns this off for screenshot states

export function setAudioEnabled(on) {
  enabled = on;
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

// Must be called from a user-gesture handler at least once.
export function unlockAudio() {
  if (!enabled || ctx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  } catch {
    ctx = null;
  }
}

function tone(freq, startOffset, duration, type, volume) {
  if (!enabled || muted || !ctx) return;
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFound() {
  tone(659.25, 0, 0.16, 'sine', 0.16); // E5
  tone(880, 0.09, 0.24, 'sine', 0.16); // A5
}

// A soft low thud when a click misses.
export function playMiss() {
  tone(96, 0, 0.18, 'sine', 0.22);
  tone(64, 0.02, 0.2, 'triangle', 0.12);
}

// A tiny tick for buttons.
export function playClick() {
  tone(520, 0, 0.07, 'square', 0.05);
}

// A short rising arpeggio when a scene is completed.
export function playComplete() {
  tone(523.25, 0, 0.16, 'sine', 0.14);
  tone(659.25, 0.1, 0.16, 'sine', 0.14);
  tone(783.99, 0.2, 0.3, 'sine', 0.14);
}
