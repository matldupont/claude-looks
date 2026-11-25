// Digital rain on the GPU: a grid of cells, each column a falling head with a fading
// trail, each cell a procedurally drawn katakana-like glyph that keeps changing.
// Cheap on purpose: four hashes a pixel, each sliced into bytes for its random numbers.
import {
  abs,
  clamp,
  exp,
  floor,
  fract,
  int,
  length,
  max,
  mod,
  picture,
  pointers,
  shader,
  size,
  smoothstep,
  step,
  time,
  unsigned,
  vec3,
  vec4,
} from 'claude-code/shader'

const CW = 11 // cell width, points
const CH = 16 // cell height, points

// A 32-bit scramble. Its four bytes each make one random number.
const mix = (n: int): int => {
  let x = n
  x = int(x ^ (x >>> 16))
  x = int(x * 73244475)
  x = int(x ^ (x >>> 16))
  x = int(x * 73244475)
  x = int(x ^ (x >>> 16))

  return x
}

// A byte (0 to 255) as a number from 0 to 1.
const unit = (v: int): number => unsigned(v) * 0.003921569

const rain = picture(p => {
  const fy = size.y - p.point.y
  const col = floor(p.point.x / CW)
  const row = floor(fy / CH)
  const c = int(col)
  const r = int(row)
  const rows = size.y / CH

  // Per column: speed, trail length and where its head is now.
  const hc = mix(int(c + 1013))
  const speed = 8 + 14 * unit(int(hc & 255))
  const trail = 14 + 32 * unit(int((hc >>> 8) & 255))
  const period = rows + trail + 4 + 14 * unit(int((hc >>> 16) & 255))
  // Rain starts from nothing: each column waits its turn (up to 3s), then its head
  // enters from the top. `time` counts from when the shader is ready.
  const wait = unit(int((hc >>> 24) & 255)) * 3
  const t = max(time - wait, 0)
  const head = mod(t * speed, period)
  const d = head - row - 1000 * step(time, wait)

  // Each cell swaps its glyph every few seconds.
  const hr = mix(int(c * 7919 + r * 104729))
  const rate = 0.25 + 0.7 * unit(int(hr & 255))
  const k = int(floor(time * rate + unit(int((hr >>> 8) & 255)) * 10))
  const ga = mix(int(c * 7919 + r * 104729 + k * 613))
  const gb = mix(int(ga + 1))

  // A glyph is a few strokes: a bar across, a bar down, a slash, a second bar.
  const u0 = fract(p.point.x / CW)
  const v = fract(fy / CH)
  const gu = 1 - (u0 - 0.14) / 0.72 // mirrored, as in the film
  const gv = (v - 0.12) / 0.76
  const inside = step(0, gu) * step(gu, 1) * step(0, gv) * step(gv, 1)
  const w = 0.08
  const g1 = unit(int(ga & 255))
  const g2 = unit(int((ga >>> 8) & 255))
  const g3 = unit(int((ga >>> 16) & 255))
  const g4 = unit(int((ga >>> 24) & 255))
  const g5 = unit(int(gb & 255))
  const g6 = unit(int((gb >>> 8) & 255))
  const g7 = unit(int((gb >>> 16) & 255))
  const g8 = unit(int((gb >>> 24) & 255))
  const g9 = unit(int((hr >>> 16) & 255))

  const bar1 = step(abs(gv - (0.1 + 0.8 * g1)), w) * step(0.35 * g2, gu) * step(gu, 0.65 + 0.35 * g3)
  const bar2 = step(abs(gu - (0.2 + 0.6 * g4)), w) * step(0.3 * g5, gv) * step(gv, 0.7 + 0.3 * g6)
  const slant = g8 > 0.5 ? gv : 1 - gv
  const bar3 = step(0.45, g7) * step(abs(gu - slant), w * 1.3)
  const bar4 = step(0.6, g9) * step(abs(gv - (0.1 + 0.8 * g3)), w) * step(0.2, gu) * step(gu, 0.8)
  const ink = max(max(bar1, bar2), max(bar3, bar4)) * inside

  // Lit only in the trail behind the head; the head cell itself is near white.
  const lit = step(0, d) * step(d, trail)
  const fade = exp(-d * (3.2 / trail))
  const isHead = step(d, 1) * step(0, d)
  let glow = clamp(fade, 0, 1) * lit
  let head1 = isHead
  let on = lit

  // A press drops a bright burst of heads down the columns around the pointer.
  for (const q of pointers) {
    if (q.down > 0) {
      const pcol = floor(q.at.x / CW)
      const prow = floor((size.y - q.at.y) / CH)
      const across = abs(col - pcol)
      const dq = prow + q.age * 48 - row
      const inBurst = step(0, dq) * step(dq, 26) * step(across, 6)
      const bw = exp(-dq * 0.12) * exp(-across * 0.4) * inBurst
      glow = max(glow, bw)
      head1 = max(head1, step(dq, 1) * inBurst * exp(-across * 0.4))
      on = max(on, inBurst)
    }
  }
  const rgb = vec3(0.05, 1, 0.4) * glow + vec3(0.8, 1, 0.85) * head1
  const a = ink * on

  // A faint dim ghost of the grid in the dark, so the field never looks empty.
  const ghost = ink * 0.05 * step(0.8, unit(int((hr >>> 24) & 255))) * smoothstep(0, 3, time)

  const around = length(p.uv - 0.5)
  const vig = 1 - 0.7 * smoothstep(0.35, 0.85, around)
  const bg = vec3(0, 0.04, 0.016)
  const lum = (rgb * a + vec3(0, 1, 0.4) * ghost) * vig

  return vec4(bg * vig + lum, 1)
})

export default shader({ fps: 30, passes: [rain] })
