// Tideline Harbour — a tiny seeded RNG.
// One clear job: deterministic pseudo-randomness, so the left and right
// panels (and every screenshot) render byte-identical decoration.

// mulberry32: a small, fast, well-distributed 32-bit generator.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A float in [min, max).
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

// An integer in [min, max] inclusive.
export function intRange(rng, min, max) {
  return Math.floor(range(rng, min, max + 1));
}

// Pick one element of an array.
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
