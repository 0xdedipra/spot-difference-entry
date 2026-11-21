// Tideline Harbour — shared layout and scoring constants.
// One clear job: every magic number the other modules agree on lives here.

// Canvas and panel geometry (logical pixels; the canvas is drawn at this
// size and CSS scales it to fit the window).
export const CANVAS_W = 1200;
export const CANVAS_H = 692;
export const PANEL = 560; // each harbour panel is PANEL x PANEL
export const LEFT_X = 24;
export const RIGHT_X = 616;
export const PANEL_Y = 92;
export const HEADER_H = 60;
export const TIMER_Y = 60;
export const TIMER_H = 12;

// Scoring and pressure.
export const FIND_POINTS = 100; // points per difference found
export const TIME_BONUS_PER_FIND = 2; // seconds handed back per find
export const MISS_PENALTY_SECONDS = 3; // seconds lost per wrong click
export const HINT_COST = 25; // points per hint
export const HINTS_PER_SCENE = 3;
export const HINT_PULSE_MS = 1200; // how long a hint ring stays visible

// Marker / effect animation timings (ms).
export const MARKER_BLOOM_MS = 350;
export const RIPPLE_MS = 420;
export const SHAKE_MS = 220;
