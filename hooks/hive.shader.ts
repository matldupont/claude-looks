// Hive, on the GPU: a raymarched corridor that the growth is rebuilding, in three passes.
// - aim: where the helmet lamp points. It trails the pointer, and with no pointer it
//   wanders as if someone were looking around.
// - march: the corridor in 3D at reduced resolution. Ribbed walls, vertebral arches,
//   corrugated conduits and a floor bundle of tubes, a lamp, ceiling lights
//   that die as the growth reaches them, an amber beacon, light at the far end, haze
//   in the lamp's beam and drifting motes.
// - glow and view: scale it up with a little bloom, grain and vignette.
// The growth spreads with time: most of the corridor is overgrown at the start, nearly
// all of it after 45 minutes. Nothing here changes faster than about twice a second, so nothing flashes.
import {
  abs,
  atan,
  type Buffer,
  buffer,
  clamp,
  cos,
  dot,
  dt,
  exp,
  floor,
  fract,
  length,
  max,
  min,
  mix,
  mod,
  normalize,
  picture,
  pointers,
  pow,
  shader,
  sin,
  size,
  smoothstep,
  step,
  time,
  vec2,
  vec3,
  vec4,
} from 'claude-code/shader'

// One texel: the lamp's aim (0 to 1 across the window, y up), the seconds since a
// pointer was last in the list, and whether it was last seen at the window's edge.
// A cursor at rest drops out of the list, so the lamp holds where it was left. It
// wanders off soon after the cursor leaves past an edge, or after a long rest.
const aim: Buffer = buffer({ size: [1, 1], float: 32, filter: 'nearest' }, () => {
  const last = aim.at(vec2(0, 0))
  const lost = last.z + dt
  let target = vec2(0.5 + 0.27 * sin(time * 0.29), 0.52 + 0.19 * sin(time * 0.47 + 1))
  let seen = lost
  let edge = time < 0.1 ? 1 : last.w

  for (const q of pointers) {
    if (q.gone == 0) {
      target = vec2(q.at.x / max(size.x, 1), q.at.y / max(size.y, 1))
      seen = 0
      edge = min(min(target.x, 1 - target.x), min(target.y, 1 - target.y)) < 0.06 ? 1 : 0
    }
  }
  const wait = edge > 0.5 ? 2.5 : 40
  const rate = seen == 0 ? 4 : 0.8 * smoothstep(wait, wait + 1.5, lost)
  let at = mix(last.xy, target, 1 - exp(-dt * rate))
  at = mix(at, vec2(0.6, 0.55), time < 0.1 ? 1 : 0)

  return vec4(at, seen, edge)
})

const hash = (q: vec2): number => fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453)

// A smooth join whose softness grows with g: hard edges on the ship as built, fused
// ones where grown. K is a constant, so there is no division to guard.
const sming = (a: number, b: number, g: number, K: number): number => {
  const h = max(K - abs(a - b), 0)

  return min(a, b) - g * h * h * (0.25 / K)
}

// How far the growth has reached at a point: 0 is the ship as built, 1 is overgrown.
const grow = (p: vec3, a: number, camZ: number, G: number): number =>
  clamp((p.z - camZ - 10 + G * 17) * 0.25 + 0.35 * sin(a * 3 + p.z * 0.7), 0, 1)

// Distance to the nearest surface, which part it is (0 wall, 1 bone, 2 tube, 3 floor)
// and how grown it is there.
const map = (p: vec3, camZ: number, G: number): vec4 => {
  const r = length(vec2(p.x, p.y * 1.1))
  const a = atan(p.y, p.x)
  const g = grow(p, a, camZ, G)
  const dz = p.z - camZ
  const near = clamp((16 - dz) * 0.1, 0, 1)

  // The hull: corrugated folds where grown, panel seams where not.
  const wall =
    1.5 -
    r -
    g * (0.07 * sin(a * 7 + p.z * 2.1) * sin(p.z * 4.3 - a * 3) + 0.016 * abs(sin(p.z * 26 + sin(a * 5 + p.z * 0.8) * 1.6)) * near) +
    (1 - g) * 0.012 * smoothstep(0.88, 0.97, abs(sin(p.z * 3.49)))

  // The floor, with a bundle of tubes running down it and clamps every few metres.
  const fl = p.y + 1
  const ci = floor(p.x * 9.0909 + 0.5)
  const rad = 0.033 + 0.0187 * hash(vec2(ci, 3))
  const fx = p.x - ci * 0.11 - 0.012 * sin(p.z * 0.9 + ci * 1.7)
  const fy = p.y + 1 - rad
  const fr = length(vec2(fx, fy))
  const ft = max(min(fr - rad * (1 + g * near * 0.08 * sin(p.z * 30 + ci)), max(fr - rad - 0.012, abs(mod(p.z + ci * 0.37, 2.2) - 1.1) - 0.035)), abs(p.x) - 0.9)
  const flo = min(fl, ft)

  // Arches every 0.9: flat frames where clean, knobbed vertebrae with spines where grown.
  const s13 = abs(sin(a * 13))
  const s2v = s13 * s13
  const spk = s2v * s2v * s2v
  const th = mix(0.06, 0.09 + 0.045 * s13, g)
  const rib = length(vec2(r - 1.47 + g * 0.06 * spk, (mod(p.z, 0.9) - 0.45) * mix(0.45, 1, g))) - th
  // Thin ribs stand off the wall until the growth thickens them, so none is a hairline.
  const rib2 = length(vec2(r - 1.49, mod(p.z + 0.45, 0.9) - 0.45)) - 0.035 * g + 0.03 * (1 - g)
  const bone = min(rib, rib2)

  // Conduits: 22 small ones against the wall and 9 thick ribbed hoses.
  const sec = floor(a * 3.5014 + 0.5)
  const la = a - sec * 0.2856
  const ha = hash(vec2(sec, 7))
  const tA = length(vec2(r * cos(la) - (1.44 - 0.03 * ha), r * sin(la))) - (0.026 + 0.02 * ha) * (1 + g * near * 0.14 * sin(p.z * 48 + sec))
  const la2 = mod(a + 0.519, 0.6981) - 0.349
  const tB = length(vec2(r * cos(la2) - 1.34, r * sin(la2))) - (0.06 + g * (0.012 * sin(p.z * 40) + 0.02 * sin(p.z * 1.3 + a * 7)))
  const tube = max(min(tA, tB), -p.y - 0.92)

  const sol = sming(bone, tube, g, 0.1)
  const env = sming(wall, flo, g, 0.15)
  const d = sming(env, sol, g, 0.08)

  let id = 0
  if (sol < env) {
    id = bone < tube ? 1 : 2
  } else if (flo < wall) {
    id = ft < fl ? 2 : 3
  }

  return vec4(d, id, g, 0)
}

const march: Buffer = buffer({ scale: 0.6, filter: 'linear' }, px => {
  const T = time + 6
  // The camera edges forward and back over five minutes, never far, so the numbers
  // stay small however long the window is open.
  const camZ = 9 * sin(T * 0.02)
  const G = 0.55 + 0.45 * min(1, time / 2700)
  const asp = size.x / max(size.y, 1)
  const uv = vec2((px.uv.x * 2 - 1) * asp, px.uv.y * 2 - 1)
  const ro = vec3(0.03 * sin(T * 0.37) + 0.01 * sin(T * 1.7), 0.06 + 0.015 * sin(T * 0.9), camZ)
  const rl = 0.02 * sin(T * 0.21)
  const rd = normalize(vec3((cos(rl) * uv.x - sin(rl) * uv.y) * 0.82, (sin(rl) * uv.x + cos(rl) * uv.y) * 0.82, 1.55))
  const am = aim.at(vec2(0, 0))
  const ld = normalize(vec3((am.x * 2 - 1) * asp * 0.82, (am.y * 2 - 1) * 0.82, 1.55))
  const lp = vec3(ro.x + 0.14, ro.y + 0.1, ro.z)

  let t = 0.05
  let m = vec4(0)
  for (let i = 0; i < 44; i++) {
    m = map(vec3(ro + rd * t), camZ, G)
    if (m.x < 0.004 * t || t > 22) {
      break
    }
    t = t + m.x * 0.85
  }
  const P = vec3(ro + rd * t)
  const id = m.y
  const g = m.z

  // The normal from three nearby samples, then a skin texture on the growth that
  // shows only in the highlights and fades with distance.
  const e = 0.002
  let n = normalize(
    vec3(
      map(vec3(P.x + e, P.y, P.z), camZ, G).x - m.x,
      map(vec3(P.x, P.y + e, P.z), camZ, G).x - m.x,
      map(vec3(P.x, P.y, P.z + e), camZ, G).x - m.x,
    ),
  )
  const skin = g * clamp((6 - t) * 0.22, 0, 1) * (id < 0.5 ? 0.06 : 0.03)
  n = normalize(vec3(n + vec3(sin(P.z * 90 + P.y * 23), sin(P.x * 85 - P.z * 31), sin(P.y * 77 + P.x * 19)) * skin))
  // Hoses and floor tubes are corrugated along their length, close up only.
  const corr = id > 1.5 && id < 2.5 ? clamp((4.5 - t) * 0.35, 0, 1) * 0.35 : 0
  n = normalize(vec3(n.x, n.y, n.z + sin(P.z * 55) * corr))
  const ao = clamp(1 - (0.12 - map(vec3(P + n * 0.12), camZ, G).x) * 5, 0.2, 1)

  // The helmet lamp.
  const Lv = vec3(lp - P)
  const dl = length(Lv)
  const L = vec3(Lv / max(dl, 0.001))
  const cone = smoothstep(0.8, 0.965, dot(vec3(-L), ld))
  const att = ((0.012 + cone) * 3.4) / (1 + dl * dl * 0.32)

  // Ceiling strips every 3.6, dead where the growth has reached; one dims now and then.
  const lz = floor(P.z / 3.6 + 0.5) * 3.6
  const lc = vec3(0, 1.22, lz)
  const fk = mod(lz / 3.6, 5)
  const dim = fk > 2.5 && fk < 3.5 ? 0.35 + 0.65 * smoothstep(0.6, 0.2, sin(T * 0.7) * sin(T * 1.3)) : 1
  const alive = (1 - grow(lc, 1.57, camZ, G)) * dim
  const Lc0 = vec3(lc - P)
  const dc = length(Lc0)
  const Lc = vec3(Lc0 / max(dc, 0.001))
  const cl = ((alive * 0.9) / (1 + dc * dc * 1.6)) * max(dot(n, Lc), 0)
  const strip = alive * step(P.y, 1.5) * step(1.12, P.y) * step(abs(P.x), 0.2) * step(abs(P.z - lz), 0.42) * step(id, 0.5)

  // The light at the far end.
  const Fp = vec3(0, 0.05, camZ + 30)
  const Lf0 = vec3(Fp - P)
  const df = length(Lf0)
  const Lf = vec3(Lf0 / max(df, 0.001))
  const fa = 6 / (1 + df * df * 0.012)

  let alb = mix(vec3(0.14, 0.15, 0.145), vec3(0.03, 0.036, 0.042), g)
  if (id > 0.5 && id < 1.5) {
    alb = mix(vec3(0.17, 0.18, 0.17), vec3(0.1, 0.11, 0.12), g)
  } else if (id > 1.5 && id < 2.5) {
    alb = mix(vec3(0.2, 0.17, 0.12), vec3(0.055, 0.062, 0.07), g)
  } else if (id > 2.5) {
    alb = mix(vec3(0.11, 0.115, 0.11), vec3(0.02, 0.024, 0.028), g)
  }
  const shin = mix(28, 140, g)
  const sk = mix(0.3, 2.4, g)
  const sp = pow(max(dot(n, normalize(vec3(L - rd))), 0), shin) * sk
  const fres = pow(1 - max(dot(n, vec3(-rd)), 0), 5)
  const spf = pow(max(dot(n, normalize(vec3(Lf - rd))), 0), shin * 0.6) * sk
  const lampC = vec3(0.86, 0.93, 1)
  const farC = vec3(0.7, 0.82, 0.95)

  let col = vec3(
    alb *
      (vec3(0.004, 0.006, 0.008) * ao +
        lampC * max(dot(n, L), 0) * att * ao +
        vec3(1, 0.74, 0.45) * cl * ao +
        farC * max(dot(n, Lf), 0) * fa * 0.25 * ao),
  )
  col = vec3(col + lampC * (sp * att + fres * g * 0.25 * att) * ao)
  col = vec3(col + farC * spf * fa * 0.18 * ao * mix(0.3, 1, g))
  col = vec3(col + vec3(1, 0.82, 0.55) * strip * 2)

  // An amber beacon turning on the ceiling ahead, until the growth takes it.
  const Bp = vec3(0, 1.05, camZ + 11)
  const bv = vec3(P - Bp)
  const bl = max(length(vec2(bv.x, bv.y)), 0.0001)
  const sw =
    (1 - grow(Bp, 1.57, camZ, G)) *
    pow(max((bv.x * cos(T * 2.2) + bv.y * sin(T * 2.2)) / bl, 0), 6) *
    (1.8 / (1 + dot(bv, bv) * 0.06))
  col = vec3(col + alb * vec3(1, 0.55, 0.18) * sw * 2)

  // Wet floor: the far light shows in it.
  if (id > 2.5 && g > 0.2) {
    const rr = vec3(rd - n * (2 * dot(n, rd)))
    const fo = vec3(Fp - P)
    const ft2 = max(dot(fo, rr), 0)
    const fh = length(vec3(fo - rr * ft2))
    col = vec3(col + (farC * g * 0.05 * (0.2 + fres) * step(0.001, ft2)) / (fh * fh * 0.02 + 0.02))
  }

  // Fog, brightening toward the light at the end.
  const fog = 1 - exp(-t * 0.11)
  const rz = max(rd.z, 0)
  const rz8 = rz * rz * rz * rz * rz * rz * rz * rz
  const rz40 = rz8 * rz8 * rz8 * rz8 * rz8
  const rz200 = rz40 * rz40 * rz40 * rz40 * rz40
  const fogC = vec3(vec3(0.006, 0.009, 0.012) + farC * (0.9 * rz200 * rz200 * rz200 * rz200 + 0.06 * rz40))
  col = mix(col, fogC, fog)

  // Haze in the lamp's beam.
  let vol = 0
  const tm = min(t, 9)
  for (let i = 0; i < 4; i++) {
    const sx = ((i + hash(vec2(px.pixel.x + i * 3.1, px.pixel.y))) * 0.25) * tm
    const q = vec3(ro + rd * sx)
    const v = vec3(q - lp)
    const dv = max(length(v), 0.001)
    const c = smoothstep(0.86, 0.975, dot(v, ld) / dv)
    const dust = 0.55 + 0.45 * sin(q.x * 6 + T * 0.4) * sin(q.z * 4 + T * 0.2)
    vol = vol + (c * dust) / (1 + dv * dv * 0.35)
  }
  col = vec3(col + lampC * vol * (tm * 0.25) * 0.05)

  // Motes drifting in planes the camera passes through, lit where the beam is.
  for (let i = 0; i < 3; i++) {
    const zl = (floor(camZ / 1.1) + i + 1) * 1.1
    const pd = zl - ro.z
    if (pd < t && pd > 0.2) {
      const P2 = vec3(ro + rd * (pd / max(rd.z, 0.1)))
      const w = vec2(P2.x / 0.3, P2.y / 0.3 + T * 0.05)
      const cell = floor(w)
      const f = vec2(fract(w) - 0.5)
      const off = vec2((hash(vec2(cell + 1.3 + zl)) - 0.5) * 0.3, (hash(vec2(cell + 2.7 + zl)) - 0.5) * 0.3)
      const r0 = min(0.3, 0.04 + 0.05 / pd)
      const disc = smoothstep(r0, r0 * 0.55, length(vec2(f - off))) * step(0.86, hash(vec2(cell + zl * 1.7))) * smoothstep(0.45, 1.4, pd)
      const c2 = smoothstep(0.82, 0.97, dot(normalize(vec3(P2 - lp)), ld))
      col = vec3(col + lampC * disc * (c2 * 0.5 + 0.02) * 0.5)
    }
  }

  col = vec3(1 - exp(vec3(col * -1.35)))
  col = vec3(pow(col, vec3(0.4545)))

  return vec4(col, 1)
})

// The bloom, worked out small and smoothed on the way up, so the full-size pass
// reads it once.
const glow: Buffer = buffer({ scale: 0.15, filter: 'linear' }, p => {
  let bloom = vec3(0)
  const asp = size.x / max(size.y, 1)
  for (let i = 0; i < 6; i++) {
    const an = i * 1.047 + 0.3
    const o = vec2(cos(an) * 0.012, sin(an) * 0.012 * asp)
    bloom = vec3(bloom + max(vec3(march.sample(vec2(p.uv + o * 1.6)).xyz - 0.45), 0) * 1.6)
  }

  return vec4(bloom, 1)
})

const view = picture(p => {
  const c = vec2(p.uv - 0.5)
  let col = vec3(march.sample(p.uv).xyz)
  col = vec3(col + glow.sample(p.uv).xyz * 0.1)
  // Grain that changes twice a second, never faster.
  col = vec3(col + (hash(vec2(p.pixel + floor(time * 2) * 13.1)) - 0.5) * 0.03)
  col = vec3(col * (1 - 0.85 * dot(c, c)))
  col = vec3(col * smoothstep(0, 1.2, time))

  return vec4(col, 1)
})

export default shader({ fps: 30, passes: [aim, march, glow, view] })
