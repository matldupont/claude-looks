// Predator, on the GPU, over the jungle Svg:
// - the shoulder cannon's three red dots, which track the pointer with a hunter's lag,
//   tighten to a lock when it rests, and wander and hold on their own when it is gone;
// - the pointer itself shows warm, a small thermal glow, since the person is the prey;
// - a slow heat haze, and every so often a cloaked figure walking across, seen only as
//   the jungle bending around its outline.
import {
  abs,
  PI,
  type Buffer,
  buffer,
  clamp,
  cos,
  dot,
  exp,
  floor,
  fract,
  length,
  max,
  min,
  mix,
  mod,
  picture,
  pointers,
  scene,
  shader,
  sin,
  size,
  smoothstep,
  dt,
  time,
  vec2,
  vec3,
  vec4,
} from 'claude-code/shader'

// One texel: x, y of the aim in points, and how locked it is (0 to 1).
const aim: Buffer = buffer({ size: [1, 1], float: 32, filter: 'nearest' }, p => {
  const last = aim.at(vec2(0, 0))

  // On its own: drift to a new spot, then hold there, every 11 seconds.
  const k = floor(time / 11)
  const hold = smoothstep(0.35, 0.95, fract(time / 11))
  const ta = vec2(0.5 + 0.34 * sin(k * 2.1), 0.55 + 0.25 * sin(k * 1.3 + 1))
  const tb = vec2(0.5 + 0.34 * sin(k * 2.1 + 2.1), 0.55 + 0.25 * sin(k * 1.3 + 2.3))
  let target = mix(ta, tb, hold) * size
  let still = smoothstep(0.85, 1, hold) + smoothstep(0.2, 0, fract(time / 11))
  let rate = 1.4

  // A pointer in the window takes over; the newest one wins.
  for (const q of pointers) {
    if (q.gone == 0) {
      target = q.at
      const moved = length(q.at - q.was)
      still = smoothstep(1.5, 0, moved)
      rate = 3.2
    }
  }

  const start = time < 0.1 ? 1 : 0
  const pos = mix(last.xy, target, start + (1 - start) * (1 - exp(-dt * rate)))
  const lock = mix(last.z, still, 1 - exp(-dt * 2.5))

  return vec4(pos, lock, 1)
})

// Distance to a segment, for the walker's limbs.
const seg = (q: vec2, a: vec2, b: vec2): number => {
  const pa = q - a
  const ba = b - a
  const h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0, 1)

  return length(pa - ba * h)
}

const view = picture(p => {
  const a = aim.at(vec2(0, 0))
  const at = a.xy
  const lock = a.z
  const fade = smoothstep(0, 0.8, time)

  // Heat haze: a slow sideways shimmer, stronger toward the bottom.
  const haze = 0.0012 * (1.2 - p.uv.y) * sin(p.uv.y * 38 + time * 1.3) * sin(p.uv.x * 9 - time * 0.4)
  let uv = p.uv + vec2(haze, 0)

  // The cloaked hunter: crosses in 26 seconds, every 55. Seen side on, walking right:
  // hunched, head thrust forward, knees and elbows bent, dreadlocks hanging back.
  // The stride is tied to how far it has gone, so planted feet don't slide.
  const cyc = mod(time + 52, 55)
  const walking = smoothstep(0, 1.5, cyc) * smoothstep(26, 24.5, cyc)
  const h = size.y * 0.55
  const cx = -0.12 * size.x + (cyc / 26) * size.x * 1.24
  const stride = h * 0.36
  const ph = (PI * cx) / stride
  const bob = abs(sin(ph)) * h * 0.018
  const base = size.y * 0.06
  const hip = vec2(cx, base + h * 0.48 + bob)
  const chest = vec2(cx + h * 0.05, base + h * 0.66 + bob)
  const neck = vec2(cx + h * 0.1, base + h * 0.76 + bob)
  const head = vec2(cx + h * 0.17, base + h * 0.8 + bob)
  const shoulder = vec2(cx + h * 0.08, base + h * 0.71 + bob)

  // One leg: the foot swings back on the ground, then lifts and comes forward.
  // The knee sits ahead of the line from hip to foot, more so when the foot is up.
  const leg = (q: vec2, phase: number): number => {
    const lift = max(0, -sin(phase))
    const foot = vec2(cx + stride * 0.5 * cos(phase), base + lift * h * 0.09)
    const knee = vec2((hip.x + foot.x) * 0.5 + h * (0.05 + 0.07 * lift), (hip.y + foot.y) * 0.5)
    const thigh = seg(q, hip, knee) - h * 0.05
    const shin = seg(q, knee, foot) - h * 0.034
    const toe = seg(q, foot, vec2(foot.x + h * 0.07, foot.y)) - h * 0.018

    return min(min(thigh, shin), toe)
  }
  // One arm swings against its leg, the forearm carried forward.
  const arm = (q: vec2, phase: number): number => {
    const swing = -cos(phase) * h * 0.07
    const elbow = vec2(shoulder.x + swing * 0.7 - h * 0.02, shoulder.y - h * 0.17)
    const hand = vec2(elbow.x + h * 0.07 + swing * 0.6, elbow.y - h * 0.13)
    const upper = seg(q, shoulder, elbow) - h * 0.03
    const fore = seg(q, elbow, hand) - h * 0.024

    return min(upper, fore)
  }
  // A smooth join, so limbs grow out of the body instead of meeting as sticks.
  const smin = (a: number, b: number): number => {
    const k = h * 0.035
    const m = max(k - abs(a - b), 0) / k

    return min(a, b) - m * m * k * 0.25
  }

  const q = p.point
  let d = smin(seg(q, hip, chest) - h * 0.055, seg(q, chest, neck) - h * 0.07)
  d = min(d, seg(q, neck, head) - h * 0.028)
  d = min(d, length((q - head) * vec2(0.9, 1.15)) - h * 0.04)
  d = smin(d, leg(q, ph))
  d = smin(d, arm(q, ph))
  d = min(d, leg(q, ph + PI))
  d = min(d, arm(q, ph + PI))
  for (const i of [0, 1, 2]) {
    const top = vec2(head.x - h * (0.025 + 0.01 * i), head.y + h * (0.025 - 0.012 * i))
    const sway = sin(ph * 0.5 + i) * h * 0.01
    const tip = vec2(top.x - h * 0.04 + sway, top.y - h * (0.12 + 0.015 * i))
    d = min(d, seg(q, top, tip) - h * 0.008)
  }

  const w = h * 0.04
  const edge = smoothstep(w, 0, abs(d)) * walking
  const inside = smoothstep(2, -2, d) * walking
  const out = p.point - vec2(cx + h * 0.06, base + h * 0.55)
  const dir = out / max(length(out), 1)
  const bend = (dir * (edge * 9 + inside * 3)) / size
  const ripple = vec2(sin(p.point.y * 0.09 + time * 2), 0) * inside * 1.5 / size
  uv = uv + bend + ripple

  // The edge splits the colors a little, as the cloak does.
  const split = (vec2(2.5, 0) * edge) / size
  const red = scene.sample(uv + split).x
  const mid = scene.sample(uv)
  const blue = scene.sample(uv - split).z
  let rgb = vec3(red, mid.y, blue) + vec3(0.25, 0.55, 0.75) * edge * 0.12

  // The pointer is warm: a small thermal glow under it, red edge to a yellow core.
  const near = length(p.point - at)
  const heat = exp(-near * near / 900) * (0.35 + 0.25 * lock)
  rgb = rgb + vec3(1, 0.35, 0.05) * heat * 0.5 + vec3(1, 0.85, 0.4) * heat * heat * 0.6

  // Three red dots in a triangle, tighter and brighter as the lock settles.
  const spread = mix(15, 7, lock)
  const turn = time * 0.15 * (1 - lock)
  let dots = 0
  for (const i of [0, 1, 2]) {
    const ang = turn + i * 2.0944 + 1.5708
    const c = at + vec2(cos(ang), sin(ang)) * spread
    const r = length(p.point - c)
    dots = max(dots, smoothstep(2.6, 1.4, r) + exp(-r * r / 40) * (0.35 + 0.4 * lock))
  }
  rgb = mix(rgb, vec3(1, 0.08, 0.04), clamp(dots, 0, 1) * fade)

  return vec4(rgb, 1)
})

export default shader({ fps: 30, passes: [aim, view] })
