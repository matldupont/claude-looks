# looks

A mod for the Claude desktop app that adds switchable themes, some with moving backdrops and sound. Switch with `/look <name>`; `/look` lists them and `/look off` clears the theme. Your choice is remembered across reloads and sessions, and each project can have its own (below).

| Theme | What it is |
| --- | --- |
| `synthwave` | Neon purple and pink, with an animated striped sun over a sliding grid |
| `tokyo` | Rainy neon night street, falling rain, flickering signs, and a quiet rain soundscape |
| `matrix` | Green digital rain drawn on the GPU with its own glyphs, plus click bursts |
| `predator` | Night jungle in thermal vision: hunter's glyph readout, a wrist-gauntlet countdown, three laser dots that track your cursor, and a cloaked walker on the GPU; jungle sound |
| `hive` | A ship's service corridor being overgrown by wet, ribbed biomechanical growth, raymarched in 3D on the GPU: your cursor aims a helmet lamp, ceiling lights die as the growth spreads over 45 minutes, and a low hull drone plays |
| `midnight` | Navy with a blue accent |
| `forest` | Deep green with a mint accent |
| `ember` | Near-black with amber |
| `paper` | Warm paper in light mode, with a dark variant |

Sound (tokyo, predator, hive) plays only after you press the speaker in the session title bar. Themes draw in the desktop app and the mobile app, not in a terminal. If the `matrix`, `predator` or `hive` shader can't run on your machine, you get a simpler SVG version; `hive` needs a fast GPU. After you switch themes, the backdrop starts following your cursor once you next send a message.

## Per-project themes

Give a project its own theme with `/look project <name>`; `/look project off` keeps that project unthemed, and `/look project clear` drops its entry so it follows your global theme again. `/look <name>` still sets the global theme, and `/look` lists the themes with this project's and the global choice.

The entries live in a plain file, `~/.claude/looks/projects.json`, keyed by the folder name of the project's main checkout, so every worktree of a repo shares one entry:

```json
{
  "sidebar": "tokyo",
  "slipway": "midnight",
  "scratch": "off"
}
```

A project not in the file uses the global theme. A missing file, or one that isn't a JSON object, means the global theme everywhere; `/look project` won't overwrite a broken file. Any session or script can edit the file. Open sessions pick up a change within about five seconds (the mod checks the file's modification time every 5 s), and new sessions open in it.

## Install

At the prompt of a terminal session:

```
/plugin install looks --marketplace matldupont/claude-looks
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `matldupont/claude-looks`, then Add plugin.

## Adding a theme

Palettes live in `hooks/palettes.js` and are built with `makeColors` from `hooks/make-colors.js`. In dark mode `surface-3` must be at least as light as `surface-2` and stay close to `surface-0`, or the whole theme fails to paint.

MIT licensed.
