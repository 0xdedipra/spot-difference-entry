// Tideline Harbour — scene data: palettes and difference catalogues.
// One clear job: describe WHAT each scene looks like and WHERE its
// differences hide. No drawing, no game logic — data only.
//
// Every difference has:
//   id    unique within the scene
//   key   the variant key the painter checks when drawing the right panel
//   x, y  centre of the difference, in panel coordinates (panel is 560x560)
//   r     click radius around that centre (generous but fair)
//   label a short name, shown in the scene-complete summary

const MORNING = {
  sky: ['#6fb7dd', '#a8d8ee', '#fdf0cd'],
  celestial: 'sun',
  celestialColor: '#ffd94d',
  glow: 'rgba(255, 214, 90, 0.35)',
  sea: ['#3d8fa8', '#256b84'],
  hill: '#7fae9b',
  quay: '#b3a284',
  quayDark: '#8d7c60',
  houses: ['#e8d8b0', '#d9a066', '#a8c8b8', '#e0b8a0'],
  roofs: ['#a8542f', '#8a4a3a', '#5f7a6a', '#96503a'],
  lanternGlow: false,
  stars: false,
  waterSparkle: 'rgba(255, 244, 190, 0.5)',
};

const DAY = {
  sky: ['#3f9fd8', '#83cbf0', '#eafaff'],
  celestial: 'sun',
  celestialColor: '#ffdf5e',
  glow: 'rgba(255, 223, 94, 0.35)',
  sea: ['#2f9db8', '#1d6f8e'],
  hill: '#6fae94',
  quay: '#bfae8e',
  quayDark: '#97835f',
  houses: ['#f0e0b8', '#e0aa6e', '#b0d0c0', '#e8c0a8'],
  roofs: ['#b85c33', '#96503f', '#6a8574', '#a85840'],
  lanternGlow: false,
  stars: false,
  waterSparkle: 'rgba(255, 255, 220, 0.55)',
};

const DUSK = {
  sky: ['#232c5c', '#8a4468', '#ff9e5e'],
  celestial: 'moon',
  celestialColor: '#f4ecd8',
  glow: 'rgba(244, 236, 216, 0.25)',
  sea: ['#3a4a7d', '#1d2c52'],
  hill: '#3c4468',
  quay: '#6e5c68',
  quayDark: '#4e4050',
  houses: ['#7a6480', '#8a5f6a', '#5f6a80', '#7d5f5a'],
  roofs: ['#3a3050', '#463448', '#333d55', '#40304a'],
  lanternGlow: true,
  stars: true,
  waterSparkle: 'rgba(220, 225, 255, 0.4)',
};

export const SCENES = [
  {
    name: 'Morning Mooring',
    timeLimit: 150,
    seed: 1101,
    palette: MORNING,
    differences: [
      { id: 'flag', key: 'flag-color', x: 512, y: 124, r: 24, label: 'Lighthouse flag changed colour' },
      { id: 'clock', key: 'clock-time', x: 138, y: 214, r: 26, label: 'Clock tower tells another time' },
      { id: 'boat', key: 'boat-moved', x: 209, y: 398, r: 65, label: 'Rowboat drifted along the quay' },
      { id: 'gull', key: 'gull-extra', x: 305, y: 92, r: 24, label: 'An extra gull joined the sky' },
      { id: 'window', key: 'window-lit', x: 262, y: 280, r: 18, label: 'A lit window went dark' },
      { id: 'sail', key: 'sail-color', x: 330, y: 358, r: 32, label: 'Sail changed colour' },
      { id: 'crates', key: 'crates-count', x: 66, y: 520, r: 30, label: 'One fish crate vanished' },
    ],
  },
  {
    name: 'Market Day',
    timeLimit: 180,
    seed: 2202,
    palette: DAY,
    differences: [
      { id: 'awning', key: 'awning-stripes', x: 116, y: 460, r: 42, label: 'Fish stall awning lost stripes' },
      { id: 'sign', key: 'sign-letter', x: 116, y: 492, r: 28, label: 'A letter changed on the fish sign' },
      { id: 'sign2', key: 'sign2-letter', x: 450, y: 496, r: 26, label: 'A letter changed on the tea sign' },
      { id: 'awning2', key: 'awning2-color', x: 450, y: 464, r: 38, label: 'Tea stall awning changed colour' },
      { id: 'barrel', key: 'barrel-moved', x: 316, y: 520, r: 38, label: 'A barrel rolled sideways' },
      { id: 'lantern', key: 'lantern-missing', x: 356, y: 442, r: 24, label: 'A lantern head is missing' },
      { id: 'buoy', key: 'buoy-color', x: 88, y: 424, r: 20, label: 'Buoy changed colour' },
      { id: 'smoke', key: 'smoke-gone', x: 302, y: 220, r: 26, label: 'Chimney smoke stopped' },
      { id: 'cloud', key: 'cloud-gone', x: 255, y: 52, r: 40, label: 'A cloud blew away' },
    ],
  },
  {
    name: 'Lantern Dusk',
    timeLimit: 210,
    seed: 3303,
    palette: DUSK,
    differences: [
      { id: 'stripe', key: 'lighthouse-stripe', x: 498, y: 247, r: 30, label: 'Lighthouse stripe changed colour' },
      { id: 'reflection', key: 'reflection-gone', x: 498, y: 385, r: 34, label: 'Lighthouse reflection vanished' },
      { id: 'moon', key: 'moon-crescent', x: 468, y: 84, r: 38, label: 'The full moon thinned to a crescent' },
      { id: 'star', key: 'star-appears', x: 108, y: 58, r: 22, label: 'A bright new star appeared' },
      { id: 'window2', key: 'window2-dark', x: 358, y: 280, r: 18, label: 'A dark window lit up' },
      { id: 'bulb', key: 'lamp-bulb-missing', x: 286, y: 458, r: 16, label: 'One string light went out' },
      { id: 'lamp', key: 'lighthouse-light', x: 498, y: 162, r: 24, label: 'The lighthouse lamp went out' },
      { id: 'gullgone', key: 'gull-missing', x: 180, y: 120, r: 24, label: 'A gull left the sky' },
      { id: 'pennant', key: 'flag2-color', x: 140, y: 138, r: 18, label: 'Tower pennant changed colour' },
      { id: 'house', key: 'house-color', x: 352, y: 292, r: 34, label: 'A house was repainted' },
      { id: 'boat', key: 'boat-moved', x: 209, y: 398, r: 65, label: 'Rowboat drifted along the quay' },
      { id: 'window', key: 'window-lit', x: 262, y: 280, r: 18, label: 'A lit window went dark' },
    ],
  },
];
