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
  hive: {
    scene: 'hive',
    glass: { blur: 8, tint: '#06080a', opacity: 0.55 },
    style: {
      // The person's words on a riveted steel plate with a hazard-striped corner.
      UserMessage: {
        color: '#eef1f2',
        backgroundColor: '#141a1f',
        paddingX: 14,
        paddingY: 10,
        fill: {
          vector: {
            viewBox: 96,
            slice: 20,
            paths: [
              { d: 'M0 0H96V96H0Z', color: '#141a1f' },
              { d: 'M0.5 0.5H95.5V95.5H0.5Z', strokeWidth: 1, color: '#34404a' },
              { d: 'M1 1H6V4L1 9ZM1 12L6 7V12L1 17Z', color: '#c88a2c' },
              { d: 'M88.4 6a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0ZM88.4 90a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z', color: '#5a6873' },
            ],
          },
        },
      },
      // Claude's on a dark console panel: amber bracket corners and a small sensor mark.
      AssistantMessage: {
        color: '#e3e8ea',
        backgroundColor: '#090d10',
        paddingTop: 22,
        paddingX: 14,
        paddingBottom: 12,
        fill: {
          vector: {
            viewBox: 96,
            slice: 26,
            paths: [
              { d: 'M0 0H96V96H0Z', color: '#090d10' },
              { d: 'M0.5 0.5H95.5V95.5H0.5Z', strokeWidth: 1, color: '#1c252c' },
              { d: 'M0.75 14V0.75H14M82 0.75H95.25V14M95.25 82V95.25H82M14 95.25H0.75V82', strokeWidth: 1.5, color: '#f0a43a' },
              { d: 'M8 11a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', strokeWidth: 1.2, color: '#f0a43a' },
              { d: 'M10.8 11a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0Z', color: '#f0a43a' },
            ],
          },
        },
      },
      ToolUse: { color: '#7cf2a0', fontFamily: ['mono'], backgroundColor: '#04090a', borderColor: '#173a2a', borderWidth: 1, radius: 2, paddingX: 8 },
    },
    sound: {
      ambience: {
        reverb: 0.35,
        layers: [
          // The hull: a low rumble, the engines' hum and the air scrubbers.
          { wave: 'brown', drone: true, gain: 0.18, filter: { type: 'lowpass', hz: 120 }, tremolo: { hz: 0.07, depth: 0.35 } },
          { wave: 'sine', drone: true, notes: [43, 86], gain: 0.03, tremolo: { hz: 0.11, depth: 0.25 } },
          { wave: 'pink', drone: true, gain: 0.045, filter: { type: 'bandpass', hz: 2000, to: 2600 }, tremolo: { hz: 0.25, depth: 0.5 } },
          // Metal groaning under strain, off to either side now and then.
          { wave: 'saw', scatter: 0.06, notes: ['B1', 'A1', 'C2'], glide: -5, attack: 1, release: 3, gain: 0.06, pan: -0.4, filter: { type: 'lowpass', hz: 260 } },
          { wave: 'saw', scatter: 0.04, notes: ['G1', 'A1'], glide: -4, attack: 0.8, release: 2.6, gain: 0.05, pan: 0.5, filter: { type: 'lowpass', hz: 240 } },
          // Drips, echoing down the deck.
          { wave: 'sine', scatter: 0.35, notes: ['B6', 'A6', 'D7', 'F#6'], glide: -7, attack: 0.002, release: 0.18, gain: 0.04, pan: -0.3 },
          { wave: 'sine', scatter: 0.25, notes: ['C7', 'G6', 'E7'], glide: -7, attack: 0.002, release: 0.16, gain: 0.035, pan: 0.45 },
        ],
      },
      cues: {
        send: { layers: [{ wave: 'square', notes: [1250, 1650], step: 0.06, attack: 0.002, release: 0.04, gain: 0.06, filter: { type: 'bandpass', hz: 1800 } }] },
        tool: { reverb: 0.5, layers: [{ wave: 'sine', notes: [1180], attack: 0.004, release: 0.9, gain: 0.1 }] },
        done: { reverb: 0.35, layers: [{ wave: 'triangle', notes: ['D6', 'A5', 'D5'], step: 0.14, release: 0.6, gain: 0.1 }] },
        error: { layers: [{ wave: 'saw', notes: [420, 310, 420, 310], step: 0.24, attack: 0.01, release: 0.2, gain: 0.06, filter: { type: 'lowpass', hz: 1400 } }] },
      },
    },
    colors: {
      label: 'Hive',
      roles: { accent: '#f0a43a', danger: '#ff5a4d', success: '#7cf2a0', warning: '#ffd24a', pro: '#8fb8d8' },
      dark: dark('#06080a', '#0b0f12', '#10151a', '#131a1f', '#e2e6e8', '#b4bcc2', '#86909a'),
    },
  },
  predator: {
    scene: 'predator',
    glass: { blur: 8, tint: '#07050e', opacity: 0.6 },
    style: {
      // The person is the prey: warm, thermal. Claude is the hunter: cold, with the
      // cannon's three red dots in the corner of each reply.
      UserMessage: {
        color: '#fff1e0',
        backgroundColor: '#2a0c10',
        fill: { gradient: { shape: 'radial', stops: ['#5c1c08', '#3a0c12', '#1c0818'] } },
        borderColor: '#ff6a00',
        borderWidth: 1,
        radius: 3,
      },
      AssistantMessage: {
        color: '#e6ecff',
        backgroundColor: '#0a0e22',
        paddingTop: 20,
        paddingX: 14,
        paddingBottom: 12,
        fill: {
          vector: {
            viewBox: 96,
            slice: 26,
            paths: [
              { d: 'M0 6L6 0H96V90L90 96H0Z', color: '#0a0e22' },
              { d: 'M0.5 6.5L6.5 0.5H95.5V89.5L89.5 95.5H0.5Z', strokeWidth: 1, color: '#26336e' },
              { d: 'M8.2 9a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0ZM15.2 9a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0ZM11.7 14.6a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0Z', color: '#ff2a1a' },
            ],
          },
        },
      },
      ToolUse: { color: '#ffb070', fontFamily: ['mono'], backgroundColor: '#120812', borderColor: '#4a1c1c', borderWidth: 1, radius: 2, paddingX: 8 },
    },
    sound: {
      ambience: {
        reverb: 0.35,
        layers: [
          { wave: 'brown', drone: true, gain: 0.16, filter: { type: 'lowpass', hz: 180 }, tremolo: { hz: 0.07, depth: 0.4 } },
          { wave: 'pink', drone: true, gain: 0.06, filter: { type: 'bandpass', hz: 2600, to: 3400 }, tremolo: { hz: 0.4, depth: 0.5 } },
          { wave: 'crackle', scatter: 3, gain: 0.07, pan: -0.4, filter: { type: 'highpass', hz: 3000 } },
          { wave: 'crackle', scatter: 2, gain: 0.06, pan: 0.5, filter: { type: 'highpass', hz: 3500 } },
          // The hunter's clicking call, now and then, from somewhere off to one side.
          { wave: 'square', scatter: 0.05, notes: [70, 70, 70, 70, 70, 70], step: 0.055, attack: 0.002, release: 0.03, gain: 0.08, pan: 0.6, filter: { type: 'bandpass', hz: 900 } },
        ],
      },
      cues: {
        send: { layers: [{ wave: 'square', notes: [160, 160, 160], step: 0.05, attack: 0.002, release: 0.03, gain: 0.12, filter: { type: 'bandpass', hz: 1400 } }] },
        tool: { layers: [{ wave: 'square', notes: [190], attack: 0.002, release: 0.03, gain: 0.08, filter: { type: 'bandpass', hz: 1600 } }] },
        done: { reverb: 0.3, layers: [{ wave: 'triangle', notes: ['A4', 'E4', 'A3'], step: 0.12, release: 0.5, gain: 0.14 }] },
        error: { layers: [{ wave: 'saw', notes: [110], glide: -12, release: 0.6, gain: 0.1, filter: { type: 'lowpass', hz: 800 } }] },
      },
    },
    colors: {
      label: 'Predator',
      roles: { accent: '#ff6a00', danger: '#ff2433', success: '#a6f03c', warning: '#ffd23a', pro: '#c44dff' },
      dark: dark('#07050e', '#0d0a1a', '#130f24', '#161128', '#fff1e0', '#f2c9a0', '#c99a7a'),
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
