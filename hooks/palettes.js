// Inputs for makeColors, one per theme. `scene` names a moving backdrop.
const dark = (s0, s1, s2, s3, t1, t2, t3) => ({
  gray: {
    anchors: {
      'surface-0': s0,
      'surface-1': s1,
      'surface-2': s2,
      'surface-3': s3,
      'text-primary': t1,
      'text-secondary': t2,
      'text-muted': t3,
    },
  },
})

export const PALETTES = {
  synthwave: {
    scene: 'synthwave',
    glass: { blur: 10, tint: '#140a24', opacity: 0.45 },
    colors: {
      label: 'Synthwave',
      roles: { accent: '#ff2bd6', danger: '#ff4d6d', success: '#3df5a7', warning: '#ffd166', pro: '#9d7bff' },
      dark: dark('#140a24', '#1d0f33', '#241240', '#281446', '#f6ecff', '#d4c0f2', '#ad97d2'),
      codeTheme: { dark: 'synthwave-84' },
    },
  },
  tokyo: {
    scene: 'tokyo',
    glass: { blur: 12, tint: '#0a0d1a', opacity: 0.5 },
    sound: {
      ambience: {
        reverb: 0.3,
        layers: [
          { wave: 'pink', drone: true, gain: 0.22, filter: { type: 'lowpass', hz: 3500 }, tremolo: { hz: 0.15, depth: 0.2 } },
          { wave: 'crackle', scatter: 9, gain: 0.14, pan: -0.3, filter: { type: 'highpass', hz: 1500 } },
          { wave: 'crackle', scatter: 6, gain: 0.12, pan: 0.4, filter: { type: 'highpass', hz: 2000 } },
          { wave: 'brown', drone: true, gain: 0.12, filter: { type: 'lowpass', hz: 220 }, tremolo: { hz: 0.08, depth: 0.4 } },
        ],
      },
      cues: {
        done: { reverb: 0.4, layers: [{ wave: 'sine', notes: ['E5', 'B5'], step: 0.12, gain: 0.2 }] },
      },
    },
    colors: {
      label: 'Rainy Tokyo',
      roles: { accent: '#ff3d9a', danger: '#ff5a6e', success: '#2de2c4', warning: '#ffc857', pro: '#38d9ff' },
      dark: dark('#0a0d1a', '#10142a', '#161b36', '#1a1f3b', '#e8ecff', '#b9c0e6', '#8f98c4'),
    },
  },
  matrix: {
    scene: 'matrix',
    glass: { blur: 6, tint: '#000a04', opacity: 0.72 },
    style: { Text: { fontFamily: ['mono'] }, ToolUse: { fontFamily: ['mono'] } },
    colors: {
      label: 'Matrix',
      roles: { accent: '#00ff66', danger: '#ff4d4d', success: '#39ff88', warning: '#d4ff3a', pro: '#5ef0d0' },
      dark: dark('#000a04', '#041409', '#07200f', '#0a2712', '#d2ffe0', '#8ee8aa', '#5fbf80'),
      codeTheme: { dark: 'nord' },
    },
  },
  midnight: {
    colors: {
      label: 'Midnight',
      roles: { accent: '#4da3ff', danger: '#ff6b6b', success: '#4ade80', warning: '#fbbf24', pro: '#a78bfa' },
      dark: dark('#0b1220', '#101a2c', '#16233a', '#1a2842', '#e6edf7', '#b8c4d8', '#93a1ba'),
    },
  },
  forest: {
    colors: {
      label: 'Forest',
      roles: { accent: '#7bd88f', danger: '#e5736a', success: '#8fd694', warning: '#e0b45a', pro: '#b39ddb' },
      dark: dark('#0e1a14', '#142419', '#1a2e21', '#1e3326', '#e8f3ea', '#bcd3c1', '#97b09d'),
    },
  },
  ember: {
    colors: {
      label: 'Ember',
      roles: { accent: '#ff9f1c', danger: '#ff5d4d', success: '#9bd36a', warning: '#ffcb47', pro: '#d99cff' },
      dark: dark('#16100b', '#1f1710', '#291e15', '#2e2218', '#f7ead8', '#d9c4a6', '#b39f84'),
    },
  },
  paper: {
    colors: {
      label: 'Paper notebook',
      roles: { accent: '#2f5d8c', danger: '#b3392f', success: '#4e7d3a', warning: '#a86f14', pro: '#6d4f94' },
      light: {
        gray: {
          anchors: {
            'surface-0': '#efe6d3',
            'surface-1': '#f4ecdc',
            'surface-2': '#faf5e9',
            'text-primary': '#2a241d',
            'text-secondary': '#544a3d',
            'text-muted': '#6a5f50',
          },
        },
      },
      dark: dark('#1f1a15', '#28221b', '#312a22', '#3a3229', '#f0e7d7', '#cfc4b2', '#aca08d'),
    },
  },
}
