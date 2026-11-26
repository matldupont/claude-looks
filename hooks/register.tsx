import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { PALETTES } from './palettes.js'
import { MATRIX } from './matrix.js'
import { TOKYO } from './tokyo.js'
import { HIVE } from './hive.js'
import { PREDATOR } from './predator.js'

const NAMES = Object.keys(PALETTES)

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
  matrix: { source: MATRIX, alt: 'Green digital rain falling on black' },
  tokyo: { source: TOKYO, alt: 'Rain falling on a neon-lit Tokyo street at night' },
  hive: { source: HIVE, alt: 'A ship’s service corridor overgrown by ribbed, wet growth, with cold light at the far end' },
  predator: { source: PREDATOR, alt: 'A night jungle in thermal vision, with a hunter’s glyph readout and wrist countdown' },
}

export const register: Register = on => {
  let current = 'synthwave'

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'look',
      description: `Switch theme: ${NAMES.join(', ')}`,
    })
    const saved = await $.store.get('theme')

    if (saved === 'off') {
      current = 'off'

      return next(e)
    }

    if (typeof saved === 'string' && NAMES.includes(saved)) {
      current = saved
    }
    // A desktop surface may attach after the session starts: the hook below sets the
    // theme again then, so an early refusal here is not worth showing.
    await $.theme.set(build(current))

    return next(e)
  })

  on('session.attach', async ($, e, next) => {
    if (current !== 'off') {
      await $.theme.set(build(current))
    }

    return next(e)
  })

  on('command.run', { command: 'look' }, async ($, e) => {
    const name = e.args.trim().toLowerCase()

    if (name === '') {
      return { text: `Themes: off, ${NAMES.join(', ')}. Now: ${current}. Use /look <name>.` }
    }

    if (name === 'off') {
      await $.theme.clear()
      current = 'off'
      await $.store.set('theme', 'off')

      return { text: 'Theme off. Pick one again with /look <name>.' }
    }

    if (!NAMES.includes(name)) {
      return { text: `No theme "${name}". Try: off, ${NAMES.join(', ')}.` }
    }
    const set = await $.theme.set(build(name))

    if (set.isDrawn) {
      current = name
      await $.store.set('theme', name)
    }

    return { text: set.isDrawn ? `Theme: ${name}` : `Not drawn: ${set.reason}` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    const scene = SCENES[e.props.scene]

    if (scene === undefined) {
      return next(e)
    }
    const { Shader, Svg } = $.ui.resolve(e)

    if (e.props.scene === 'matrix') {
      return (
        <Shader module="./matrix.shader.ts">
          <Svg source={scene.source} alt={scene.alt} />
        </Shader>
      )
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
