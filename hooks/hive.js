// Hive, painted: the fallback the app shows where the shader doesn't play (mobile,
// Reduce Motion, a slow GPU). A ship's service corridor in one-point perspective,
// half taken over by ribbed, wet growth, with cold light at the far end. Built at
// load from a seeded generator and kept under the 131,072-character scene limit.
const rnd = (seed => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
})(1979)

const VP = { x: 800, y: 410 }
const DEPTHS = [1.25, 0.9, 0.66, 0.48, 0.35, 0.255, 0.185, 0.135, 0.1]
const n0 = v => Math.round(v)
const n1 = v => Math.round(v * 10) / 10

const oct = (d, s = 1) => {
  const hw = 760 * d * s
  const top = VP.y - 470 * d * s
  const bot = VP.y + 520 * d * s
  const c = 170 * d * s
  const L = VP.x - hw
  const R = VP.x + hw
  return [[L + c, top], [R - c, top], [R, top + c], [R, bot - c], [R - c, bot], [L + c, bot], [L, bot - c], [L, top + c]]
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const quad = (n, f, i) => [n[i], n[(i + 1) % 8], f[(i + 1) % 8], f[i]]
const qp = (q, u, v) => lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v)
const P = pts => pts.map(p => `${n0(p[0])},${n0(p[1])}`).join(' ')
const line = (a, b, col, w) => `<path d="M${n0(a[0])} ${n0(a[1])}L${n0(b[0])} ${n0(b[1])}" stroke="${col}" stroke-width="${n1(w)}"/>`
const mixHex = (a, b, t) => {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = s => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t)
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`
}

const DEFS = `<defs>
<radialGradient id="bone" cx="0.42" cy="0.36" r="0.62"><stop offset="0" stop-color="#5d6670"/><stop offset="0.5" stop-color="#262d34"/><stop offset="1" stop-color="#0b0e11"/></radialGradient>
<radialGradient id="far" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#eef6ff"/><stop offset="0.35" stop-color="#9fb6cc"/><stop offset="1" stop-color="#1a232c"/></radialGradient>
<radialGradient id="pool"><stop offset="0" stop-color="#ffd59a" stop-opacity="0.2"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>
<radialGradient id="haze"><stop offset="0" stop-color="#cfe2f5" stop-opacity="0.45"/><stop offset="0.4" stop-color="#8aa4bd" stop-opacity="0.14"/><stop offset="1" stop-color="#8aa4bd" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx="0.5" cy="0.46" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/></radialGradient>
<pattern id="haz" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="22" height="22" fill="#12171b"/><rect width="11" height="22" fill="#9a7128"/></pattern>
<filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>`

// The ship as built: frames, pipe runs, panels, ceiling strips, grating.
const base = () => {
  let s = '<rect width="1600" height="900" fill="#05070a"/>'
  const FACE = ['#1a2026', '#1d242b', '#161c22', '#12171c', '#0e1216', '#12171c', '#161c22', '#1d242b']
  for (let k = 0; k < DEPTHS.length - 1; k++) {
    const d = DEPTHS[k]
    const n = oct(d)
    const f = oct(DEPTHS[k + 1])
    const t = k / (DEPTHS.length - 1)
    for (let i = 0; i < 8; i++) {
      s += `<polygon points="${P(quad(n, f, i))}" fill="${mixHex(FACE[i], '#0a0d10', t * 0.4)}"/>`
    }
    const fq = quad(n, f, 4)
    for (const v of [0.25, 0.5, 0.75]) {
      s += line(qp(fq, 0, v), qp(fq, 1, v), '#080a0c', 2.4 * d)
    }
    for (const e of [2, 6]) {
      const q = quad(n, f, e)
      for (const [u0, th, col] of [[0.07, 0.035, '#28313a'], [0.115, 0.025, '#232b33'], [0.15, 0.02, '#2c3640']]) {
        const u = e === 2 ? u0 : 1 - u0 - th
        s += `<polygon points="${P([qp(q, u, 0), qp(q, u + th, 0), qp(q, u + th, 1), qp(q, u, 1)])}" fill="${col}"/>`
      }
      s += `<polygon points="${P([qp(q, 0.3, 0.12), qp(q, 0.8, 0.12), qp(q, 0.8, 0.88), qp(q, 0.3, 0.88)])}" fill="#182027" stroke="#28323b" stroke-width="${n1(1.6 * d)}"/>`
    }
    if (k !== 3) {
      const cq = quad(n, f, 0)
      const pc = qp(fq, 0.5, 0.3)
      s += `<ellipse cx="${n0(pc[0])}" cy="${n0(pc[1])}" rx="${n0(320 * d)}" ry="${n0(70 * d)}" fill="url(#pool)"/>`
      s += `<polygon points="${P([qp(cq, 0.4, 0.1), qp(cq, 0.6, 0.1), qp(cq, 0.6, 0.34), qp(cq, 0.4, 0.34)])}" fill="#ffd9a0" opacity="${(0.9 - k * 0.09).toFixed(2)}"/>`
    }
  }
  const fl = quad(oct(1.25), oct(0.1), 4)
  for (let u = 0.08; u < 0.95; u += 0.06) {
    s += line(qp(fl, u, 0), qp(fl, u, 1), '#090b0e', 2.5)
  }
  s += `<polygon points="${P(oct(0.1))}" fill="url(#far)"/>`
  for (const d of DEPTHS) {
    const o = oct(d)
    s += `<polygon points="${P(o)}" fill="none" stroke="#1f272e" stroke-width="${n1(34 * d)}"/>`
    s += `<polygon points="${P(o)}" fill="none" stroke="#3a4651" stroke-width="${n1(2.5 * d)}"/>`
  }
  s += '<rect x="411" y="745" width="779" height="16" fill="url(#haz)"/>'
  s += '<rect x="594" y="587" width="413" height="9" fill="url(#haz)"/>'
  s += '<text x="800" y="104" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="3" fill="#8e9aa5">TETHYS-7 · SERVICE DECK C · FRAME 14</text>'
  s += '<rect x="284" y="392" width="28" height="36" fill="#29323a" stroke="#4a5763"/><path d="M291 402l6 8-6 8M298 402l6 8-6 8" fill="none" stroke="#c0882c" stroke-width="2"/>'
  s += '<rect x="1288" y="392" width="28" height="36" fill="#29323a" stroke="#4a5763"/><circle cx="1302" cy="410" r="8" fill="none" stroke="#c0882c" stroke-width="2"/><path d="M1302 400v20" stroke="#c0882c" stroke-width="2"/>'
  return s
}

// The growth: ribbed conduits down the walls, vertebrae along the frames, strands
// and drips from the ceiling. Shaded oil to steel-blue bone.
const growth = () => {
  let s = ''
  const TD = [1.25, 0.9, 0.66, 0.48, 0.35, 0.255]
  const TUBES = [[2, 0.22], [2, 0.3], [2, 0.38], [2, 0.74], [6, 0.26], [6, 0.62], [6, 0.7], [6, 0.78], [1, 0.3], [1, 0.5], [1, 0.7], [7, 0.35], [7, 0.55], [0, 0.12], [0, 0.88], [3, 0.5], [5, 0.45]]
  for (const [edge, u0] of TUBES) {
    const ph = rnd() * 6
    const wid = 18 + rnd() * 16
    const pts = TD.map((d, j) => {
      const o = oct(d, 0.975)
      const u = Math.min(0.95, Math.max(0.05, u0 + Math.sin(j * 1.1 + ph) * 0.06))
      return [lerp(o[edge], o[(edge + 1) % 8], u), d]
    })
    for (let j = 0; j < pts.length - 1; j++) {
      const [p, d1] = pts[j]
      const [q, d2] = pts[j + 1]
      const w = (wid * (d1 + d2)) / 2
      const dd = `M${n0(p[0])} ${n0(p[1])}L${n0(q[0])} ${n0(q[1])}`
      s += `<path d="${dd}" stroke="#14191e" stroke-width="${n1(w)}" stroke-linecap="round"/>`
      s += `<path d="${dd}" stroke="#46525e" stroke-width="${n1(w * 0.36)}" stroke-linecap="round"/>`
      s += `<path d="${dd}" stroke="#0a0d10" stroke-width="${n1(w * 1.02)}" stroke-dasharray="${n1(w * 0.16)} ${n1(w * 0.36)}"/>`
    }
  }
  for (const d of [0.9, 0.66, 0.48, 0.35]) {
    const o = oct(d, 0.985)
    s += `<polygon points="${P(o)}" fill="none" stroke="#161b20" stroke-width="${n1(22 * d)}"/>`
    for (let i = 0; i < 8; i++) {
      const a = o[i]
      const b = o[(i + 1) % 8]
      const step = 44 * d
      const count = Math.max(1, Math.floor(Math.hypot(b[0] - a[0], b[1] - a[1]) / step))
      const ang = n0((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI)
      for (let k = 0; k < count; k++) {
        const p = lerp(a, b, (k + 0.5) / count)
        s += `<ellipse cx="${n0(p[0])}" cy="${n0(p[1])}" rx="${n1(step * 0.6)}" ry="${n1((15 + rnd() * 5) * d)}" transform="rotate(${ang} ${n0(p[0])} ${n0(p[1])})" fill="url(#bone)"/>`
      }
    }
  }
  for (let i = 0; i < 34; i++) {
    const k = 1 + Math.floor(rnd() * 4)
    const e = [0, 0, 1, 7][Math.floor(rnd() * 4)]
    const d = DEPTHS[k]
    const o = oct(d, 0.99)
    const [x, y] = lerp(o[e], o[(e + 1) % 8], 0.05 + rnd() * 0.9)
    const len = (30 + rnd() * 130) * d
    const w = (2.5 + rnd() * 3.5) * d
    s += `<path d="M${n1(x - w)} ${n0(y)}L${n1(x + w)} ${n0(y)}Q${n1(x + w * 0.35)} ${n0(y + len * 0.6)} ${n0(x)} ${n0(y + len)}Q${n1(x - w * 0.35)} ${n0(y + len * 0.6)} ${n1(x - w)} ${n0(y)}Z" fill="#20262c"/>`
    s += `<circle cx="${n0(x)}" cy="${n0(y + len + w * 0.5)}" r="${n1(w * 0.8)}" fill="url(#bone)"/>`
  }
  return s
}

// Where the growth has reached: soft blobs around the far end and two vents.
const reach = () => {
  let s = '<mask id="grow" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900"><g filter="url(#soft)">'
  const SRC = [[800, 410, 1], [1470, 130, 0.9], [1400, 800, 0.8], [150, 820, 0.85]]
  for (let i = 0; i < 64; i++) {
    const [sx, sy, k] = SRC[i % 4]
    const a = rnd() * Math.PI * 2
    const r0 = Math.pow(rnd(), 0.75) * 820
    const start = (r0 / 820) * 0.7 * k + rnd() * 0.08
    const R = (110 + rnd() * 170) * Math.min(1, Math.max(0, (0.62 - start) / 0.24))
    if (R > 1) {
      s += `<circle cx="${n0(sx + Math.cos(a) * r0)}" cy="${n0(sy + Math.sin(a) * r0 * 0.8)}" r="${n0(R)}" fill="#fff"/>`
    }
  }
  return `${s}</g></mask>`
}

export const HIVE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
<style>
.breathe{animation:breathe 9s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:0.8}50%{opacity:1}}
</style>
${DEFS}${reach()}</defs>
${base()}<g mask="url(#grow)">${growth()}</g>
<ellipse class="breathe" cx="800" cy="410" rx="300" ry="230" fill="url(#haze)"/>
<ellipse cx="800" cy="410" rx="40" ry="34" fill="#f4faff" opacity="0.85" filter="url(#bloom)"/>
<rect width="1600" height="900" fill="url(#vig)"/>
</svg>`
