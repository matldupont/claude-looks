import { atom, read, update } from 'claude-code'
import type { EngineInterface as Engine, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { PALETTES } from './palettes.js'
import { MATRIX } from './matrix.js'
import { TOKYO } from './tokyo.js'
import { HIVE } from './hive.js'
import { PREDATOR } from './predator.js'

const NAMES = Object.keys(PALETTES)

// Matrix answers typing: the rain surges while the person types and a bright band
// sweeps down on send. Only state changes reach the shader, never one per key.
const typing = atom({ plugin: 'looks', key: 'typing' } as const, 0)
const sent = atom({ plugin: 'looks', key: 'sent' } as const, 0)

const build = (name: string): ThemeSetArgs => {
  const p = PALETTES[name]!
  const { theme } = makeColors(p.colors)
  const look: ThemeSetArgs = { colors: theme }

  if (p.colors.dark && !p.colors.light) {
    look.overrideColorScheme = 'dark'
  }

  if (p.scene !== undefined) {
    look.backdrop = { scene: p.scene, glass: p.glass ?? false }
  }

  if (p.style !== undefined) {
    look.style = p.style
  }

  if (p.sound !== undefined) {
    look.sound = p.sound
  }

  return look
}

// Horizon at y=470. Grid lines slide toward the viewer.
const lines = [0, 1, 2, 3, 4, 5, 6, 7]
  .map(i => {
    const y = 490 + i * i * 9 + i * 8
    return `<line class="h" x1="0" x2="1600" y1="${y}" y2="${y}" style="animation-delay:${-i}s"/>`
  })
  .join('')
const spokes = [-12, -8, -5, -3, -1.5, 0, 1.5, 3, 5, 8, 12]
  .map(k => `<line class="v" x1="800" y1="470" x2="${800 + k * 260}" y2="900"/>`)
  .join('')

const SYNTHWAVE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0620"/><stop offset="0.6" stop-color="#2a0f4d"/><stop offset="1" stop-color="#7a1a78"/></linearGradient>
<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14d"/><stop offset="0.55" stop-color="#ff5fa2"/><stop offset="1" stop-color="#b020e0"/></linearGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0f4d"/><stop offset="1" stop-color="#0d0620"/></linearGradient>
<clipPath id="below"><rect x="0" y="470" width="1600" height="430"/></clipPath>
<mask id="cut"><rect width="1600" height="470" fill="#fff"/><rect x="0" y="380" width="1600" height="6" fill="#000"/><rect x="0" y="408" width="1600" height="10" fill="#000"/><rect x="0" y="438" width="1600" height="14" fill="#000"/></mask>
</defs>
<style>
.h{stroke:#ff2bd6;stroke-width:2;opacity:0.7;animation:flow 8s linear infinite}
.v{stroke:#ff2bd6;stroke-width:1.5;opacity:0.45}
.glow{animation:pulse 6s ease-in-out infinite}
@keyframes flow{0%{transform:translateY(-40px);opacity:0}15%{opacity:0.7}100%{transform:translateY(420px);opacity:0.9}}
@keyframes pulse{0%,100%{opacity:0.75}50%{opacity:1}}
</style>
<rect width="1600" height="900" fill="url(#sky)"/>
<circle class="glow" cx="800" cy="330" r="260" fill="#ff2bd6" opacity="0.18"/>
<circle cx="800" cy="330" r="190" fill="url(#sun)" mask="url(#cut)"/>
<rect x="0" y="470" width="1600" height="430" fill="url(#floor)"/>
<line x1="0" x2="1600" y1="470" y2="470" stroke="#ff7be8" stroke-width="3"/>
<g clip-path="url(#below)">${spokes}${lines}</g>
</svg>`

const SCENES: Record<string, { source: string; alt: string }> = {
  synthwave: { source: SYNTHWAVE, alt: 'A synthwave sun over a neon grid' },
  tokyo: { source: TOKYO, alt: 'Rain falling on a neon-lit Tokyo street at night' },
  hive: { source: HIVE, alt: 'A ship’s service corridor overgrown by ribbed, wet growth, with cold light at the far end' },
  predator: { source: PREDATOR, alt: 'A night jungle in thermal vision, with a hunter’s glyph readout and wrist countdown' },
}

// A project's theme: `~/.claude/looks/projects.json`, `{ "<project>": "<theme>" | "off" }`.
// The project is the main checkout's folder name, so every worktree of a repo shares it.
const projectsFile = async ($: Engine) => {
  const home = await $.env.get('HOME')

  return home === undefined ? null : `${home}/.claude/looks/projects.json`
}

type Projects = Record<string, string>

// The file's entries, {} when it is missing, or null when it is there but not a JSON object.
const readProjects = async ($: Engine): Promise<Projects | null> => {
  const path = await projectsFile($)

  if (path === null) return {}
  let text: string

  try {
    text = await $.fs.read(path)
  } catch {
    return {}
  }

  try {
    const parsed: unknown = JSON.parse(text)

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const out: Projects = {}

    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string') out[k] = v.trim().toLowerCase()
    }

    return out
  } catch {
    return null
  }
}

const tail = (path: string) => path.replace(/\/+$/, '').split('/').pop() ?? ''

// The project key: the folder holding git's common dir (so a worktree maps to its main
// checkout), else the working directory's own folder name.
const projectOf = async ($: Engine): Promise<string> => {
  const cwd = await $.session.cwd()

  try {
    const ran = await $.process.run(
      ['git', '--no-optional-locks', 'rev-parse', '--path-format=absolute', '--git-common-dir'],
      { cwd, timeoutMs: 5000 },
    )

    if (ran.exitCode === 0) {
      const common = ran.stdout.trim().replace(/\/+$/, '')

      if (common !== '') {
        const name = tail(common)
        // `<checkout>/.git` names the checkout; a bare `repo.git` names itself.
        const key = name === '.git' ? tail(common.slice(0, -'/.git'.length)) : name.replace(/\.git$/, '')

        if (key !== '') return key
      }
    }
  } catch {
    // Not a git repo, or git missing: the folder name below.
  }

  return tail(cwd)
}

const isTheme = (name: unknown): name is string => typeof name === 'string' && (name === 'off' || NAMES.includes(name))

// What is drawn now: a theme name or 'off'. The session's project key.
let current = 'synthwave'
let project = ''
// The projects.json mtime last acted on.
let seen = -1

async function globalTheme($: Engine) {
  const saved = await $.store.get('theme')

  return isTheme(saved) ? saved : 'synthwave'
}

// This project's entry when the file names a known theme, else the global choice.
async function resolve($: Engine) {
  const entry = (await readProjects($))?.[project]

  return isTheme(entry) ? entry : await globalTheme($)
}

async function apply($: Engine, name: string) {
  current = name

  if (name === 'off') {
    await $.theme.clear()

    return
  }
  // A desktop surface may attach after the session starts: session.attach sets the
  // theme again then, so an early refusal here is not worth showing.
  await $.theme.set(build(name))
}

// Edits to projects.json reach open sessions within a few seconds: one stat per tick,
// and a read only when the file's mtime moved.
async function fileStamp($: Engine) {
  const path = await projectsFile($)

  if (path === null) return 0

  try {
    return (await $.fs.stat(path)).mtimeMs
  } catch {
    return 0
  }
}

const LIST = `off, ${NAMES.join(', ')}`

async function projectCommand($: Engine, arg: string): Promise<string> {
  const path = await projectsFile($)
  const entries = await readProjects($)

  if (path === null) return 'Cannot find your home folder, so projects.json cannot be written.'

  if (entries === null) return `${path} is not a JSON object; fix or delete it first.`

  const entry = entries[project]

  if (arg === '') {
    return `Project ${project}: ${isTheme(entry) ? entry : `not set (uses global ${await globalTheme($)})`}. Use /look project <name|off|clear>.`
  }

  if (arg !== 'clear' && !isTheme(arg)) return `No theme "${arg}". Try: ${LIST}, or clear.`

  const nextEntries = { ...entries }

  if (arg === 'clear') delete nextEntries[project]
  else nextEntries[project] = arg

  await $.fs.write(path, `${JSON.stringify(nextEntries, null, 2)}\n`)
  seen = await fileStamp($)
  const want = await resolve($)
  await apply($, want)

  return arg === 'clear'
    ? `Project ${project} cleared; it uses the global theme (${want}).`
    : `Project ${project}: ${arg}. New sessions in ${project} open in it.`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'look',
      description: `Switch theme: ${NAMES.join(', ')}; /look project <name> for this project`,
    })
    project = await projectOf($)
    seen = await fileStamp($)
    await apply($, await resolve($))

    $.clock.every(5000, () => {
      void (async () => {
        const stamp = await fileStamp($)

        if (stamp === seen) return
        seen = stamp
        const want = await resolve($)

        if (want !== current) await apply($, want)
      })().catch(() => undefined)
    })

    return next(e)
  })

  on('session.attach', async ($, e, next) => {
    seen = await fileStamp($)
    await apply($, await resolve($))

    return next(e)
  })

  let idle: { cancel: () => void } | undefined
  let settle: { cancel: () => void } | undefined
  let isTyping = false

  on('prompt.edit', ($, e, next) => {
    if (PALETTES[current]?.rain !== undefined) {
      if (!isTyping) {
        isTyping = true
        void update($, typing, () => 1)
      }
      idle?.cancel()
      idle = $.clock.after(600, () => {
        isTyping = false
        void update($, typing, () => 0)
      })
    }

    return next(e)
  })

  on('prompt.submit', ($, e, next) => {
    if (PALETTES[current]?.rain !== undefined) {
      idle?.cancel()
      isTyping = false
      void update($, typing, () => 0)
      void update($, sent, () => 1)
      settle?.cancel()
      settle = $.clock.after(1200, () => void update($, sent, () => 0))
    }

    return next(e)
  }).catch(() => undefined)

  on('command.run', { command: 'look' }, async ($, e) => {
    const args = e.args.trim().toLowerCase()
    const [word = '', ...rest] = args.split(/\s+/)

    if (word === 'project') {
      return { text: await projectCommand($, rest.join(' ')) }
    }

    const name = args

    if (name === '') {
      const entry = (await readProjects($))?.[project]
      const projectLine = isTheme(entry) ? entry : 'not set'

      return {
        text: `Themes: ${LIST}. Now: ${current}. Project ${project}: ${projectLine}. Global: ${await globalTheme($)}. Use /look <name> (global) or /look project <name|off|clear>.`,
      }
    }

    if (!isTheme(name)) {
      return { text: `No theme "${name}". Try: ${LIST}.` }
    }

    const entry = (await readProjects($))?.[project]
    const note = isTheme(entry) ? ` Project ${project} still opens in ${entry}; /look project clear to use the global theme here.` : ''

    if (name === 'off') {
      await $.store.set('theme', 'off')
      await apply($, 'off')

      return { text: `Theme off. Pick one again with /look <name>.${note}` }
    }
    const set = await $.theme.set(build(name))

    if (set.isDrawn) {
      current = name
      await $.store.set('theme', name)
    }

    return { text: set.isDrawn ? `Theme: ${name}.${note}` : `Not drawn: ${set.reason}` }
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    const { Shader, Svg } = $.ui.resolve(e)
    // The Matrix family shares one rain, tinted by the palette's `rain` colour.
    const rain = PALETTES[e.props.scene]?.rain

    if (rain !== undefined) {
      const [cr, cg, cb, wr, wg, wb] = rain
      const values = { surge: await read($, typing), wave: await read($, sent), cr, cg, cb, wr, wg, wb }

      return (
        <Shader module="./matrix.shader.ts" values={values}>
          <Svg source={MATRIX} alt="Digital rain falling on black" />
        </Shader>
      )
    }

    const scene = SCENES[e.props.scene]

    if (scene === undefined) {
      return next(e)
    }

    if (e.props.scene === 'hive') {
      return (
        <Shader module="./hive.shader.ts">
          <Svg source={scene.source} alt={scene.alt} />
        </Shader>
      )
    }

    if (e.props.scene === 'predator') {
      return (
        <Shader module="./predator.shader.ts">
          <Svg source={scene.source} alt={scene.alt} />
        </Shader>
      )
    }

    return <Svg source={scene.source} alt={scene.alt} />
  })
}
