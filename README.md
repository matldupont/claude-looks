# looks

A mod for the Claude desktop app that adds switchable themes, some with moving backdrops and sound. Switch with `/look <name>`; `/look` lists them and `/look off` clears the theme. Your choice is remembered across reloads and sessions.

| Theme | What it is |
| --- | --- |
| `synthwave` | Neon purple and pink, with an animated striped sun over a sliding grid |
| `tokyo` | Rainy neon night street, falling rain, flickering signs, and a quiet rain soundscape |
| `matrix` | Green digital rain drawn on the GPU with its own glyphs, plus click bursts |
| `predator` | Night jungle in thermal vision: hunter's glyph readout, a wrist-gauntlet countdown, three laser dots that track your cursor, and a cloaked walker on the GPU; jungle sound |
| `midnight` | Navy with a blue accent |
| `forest` | Deep green with a mint accent |
| `ember` | Near-black with amber |
| `paper` | Warm paper in light mode, with a dark variant |

Sound (tokyo, predator) plays only after you press the speaker in the session title bar. Themes draw in the desktop app and the mobile app, not in a terminal. If the `matrix` or `predator` shader can't run on your machine, you get a simpler SVG version.

## Install

At the prompt of a terminal session:

```
/plugin install looks --marketplace matldupont/claude-looks
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `matldupont/claude-looks`, then Add plugin.

## Adding a theme

Palettes live in `hooks/palettes.js` and are built with `makeColors` from `hooks/make-colors.js`. In dark mode `surface-3` must be at least as light as `surface-2` and stay close to `surface-0`, or the whole theme fails to paint.

MIT licensed.
