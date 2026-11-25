// Predator: a night jungle seen through a thermal mask. Cold foliage, a warm body hiding
// in it, a hunter's glyph readout building down the left edge, and a wrist gauntlet in
// the top-right corner counting down slot by slot. Pure vector, slow CSS motion only.
// The glyphs are our own: short slanted strokes on a small grid, lit a few at a time.
const rnd = seed => {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const r = rnd(1987)

// Stroke slots of one glyph cell, 20 wide by 28 tall.
const SLOTS = [
  [4, 3, 9, 9],
  [16, 3, 11, 9],
  [10, 10, 10, 17],
  [3, 15, 8, 12],
  [17, 15, 12, 12],
  [10, 18, 4, 24],
  [10, 18, 16, 24],
  [3, 8, 3, 15],
  [12, 4, 18, 4],
  [6, 25, 13, 25],
  [17, 19, 17, 25],
]

// A glyph is 3 to 5 slots, always one of the middle three so it holds together.
export const glyph = () => {
  const picked = new Set([2 + Math.floor(r() * 3)])
  const n = 3 + Math.floor(r() * 3)
  while (picked.size < n) {
    picked.add(Math.floor(r() * SLOTS.length))
  }
  return [...picked].map(i => SLOTS[i])
}

const strokes = (g, x, y, s) =>
  g.map(([a, b, c, d]) => `M${(x + a * s).toFixed(1)} ${(y + b * s).toFixed(1)}L${(x + c * s).toFixed(1)} ${(y + d * s).toFixed(1)}`).join('')

// Jungle fronds: a curved stem with leaves along it, all cold.
const frond = (x, y, len, angle, side, fill) => {
  const rad = (angle * Math.PI) / 180
  const dx = Math.cos(rad)
  const dy = Math.sin(rad)
  let leaves = ''
  for (let i = 1; i < 12; i++) {
    const t = i / 12
    const bend = t * t * 60 * side
    const px = x + dx * len * t - dy * bend
    const py = y + dy * len * t + dx * bend
    const l = 95 * (1 - t * 0.55)
    for (const k of [-1, 1]) {
      const la = rad + k * 0.85 + side * t * 0.4
      const ex = px + Math.cos(la) * l
      const ey = py + Math.sin(la) * l
      const mx = (px + ex) / 2 - Math.sin(la) * l * 0.32 * k
      const my = (py + ey) / 2 + Math.cos(la) * l * 0.32 * k
      const nx = (px + ex) / 2 + Math.sin(la) * l * 0.2 * k
      const ny = (py + ey) / 2 - Math.cos(la) * l * 0.2 * k
      leaves += `M${px.toFixed(0)} ${py.toFixed(0)}Q${mx.toFixed(0)} ${my.toFixed(0)} ${ex.toFixed(0)} ${ey.toFixed(0)}Q${nx.toFixed(0)} ${ny.toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)}Z`
    }
  }
  const ex = x + dx * len - dy * 60 * side
  const ey = y + dy * len + dx * 60 * side
  const cx = x + dx * len * 0.5 - dy * 15 * side
  const cy = y + dy * len * 0.5 + dx * 15 * side
  return `<path d="M${x} ${y}Q${cx.toFixed(0)} ${cy.toFixed(0)} ${ex.toFixed(0)} ${ey.toFixed(0)}" stroke="${fill}" stroke-width="5" fill="none"/><path d="${leaves}" fill="${fill}"/>`
}

// Thermal colors run cold to hot: the far leaves near black-blue, nearer ones violet,
// and a few sun-warmed ones toward magenta.
const back = [
  frond(-40, 60, 460, 25, 1, '#100b26'),
  frond(-30, 520, 420, -15, -1, '#100b26'),
  frond(-60, 900, 420, -50, 1, '#100b26'),
  frond(1640, 40, 480, 155, -1, '#100b26'),
  frond(1650, 560, 440, 195, 1, '#100b26'),
  frond(1660, 950, 420, 230, -1, '#100b26'),
  frond(260, 960, 380, -78, 1, '#100b26'),
  frond(1340, 960, 400, -102, -1, '#100b26'),
  frond(560, -40, 300, 100, -1, '#0d0920'),
  frond(1060, -40, 300, 80, 1, '#0d0920'),
].join('')

const front = [
  frond(-60, 260, 400, 8, 1, '#1d1446'),
  frond(-50, 740, 380, -30, -1, '#1d1446'),
  frond(1660, 300, 420, 172, -1, '#1d1446'),
  frond(1660, 780, 400, 210, 1, '#1d1446'),
].join('')

const warmLeaves = [frond(-40, 420, 300, -8, 1, '#3a1650'), frond(1650, 470, 300, 186, -1, '#3a1650')].join('')

// Readout down the left edge: glyphs that build one stroke at a time, then fade away.
const READ_X = 58
let readout = ''
for (let i = 0; i < 8; i++) {
  const g = glyph()
  const y = 190 + i * 60
  const segs = g
    .map((seg, j) => {
      const d = (i * 0.9 + j * 0.25).toFixed(2)
      const path = strokes([seg], READ_X, y, 1.8)
      return `<g class="rs" style="animation-delay:${d}s"><path class="halo" d="${path}"/><path class="core" d="${path}"/></g>`
    })
    .join('')
  readout += segs
}

// Gauntlet: four slots that go dark one by one, then all light again.
let slots = ''
for (let i = 0; i < 4; i++) {
  const g = glyph()
  const path = strokes(g, 22 + i * 52, 20, 1.75)
  slots += `<g class="s${i}"><path class="halo" d="${path}"/><path class="core" d="${path}"/></g>`
}
// The scene fills the window by cropping, the top and bottom off a wide one and the
// sides off a tall one, so the size rules in the style move the panel back into the
// corner that shows, below the window's own buttons.
const GAUNTLET = `<g transform="translate(1330 78)"><g class="gnt">
<path d="M0 10L14 0H228L240 12V96L226 108H12L0 96Z" fill="#0b0816" stroke="#3a2a5a" stroke-width="2"/>
<path d="M8 16L18 8H222L232 18V92L222 100H18L8 90Z" fill="#06040c"/>
${slots}
<path d="M18 86H222" stroke="#3a1410" stroke-width="3"/>
<rect class="bar" x="18" y="84.5" width="204" height="3" fill="#ff2a1a"/>
</g></g>`

// Warm bodies hiding in the foliage: thermal blobs, white-hot core to red edge.
const warm = (id, cx, cy, rx, ry, delay) =>
  `<ellipse class="heat" style="animation-delay:${delay}s" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`

export const PREDATOR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="sky" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#0c0920"/><stop offset="0.6" stop-color="#070513"/><stop offset="1" stop-color="#030208"/></radialGradient>
<radialGradient id="hot"><stop offset="0" stop-color="#fff6c8"/><stop offset="0.25" stop-color="#ffd23a"/><stop offset="0.5" stop-color="#ff6a00"/><stop offset="0.75" stop-color="#c4102a" stop-opacity="0.7"/><stop offset="1" stop-color="#5a0a5a" stop-opacity="0"/></radialGradient>
<radialGradient id="body" cx="0.5" cy="0.3" r="0.75"><stop offset="0" stop-color="#ffe27a"/><stop offset="0.3" stop-color="#ff9a1a"/><stop offset="0.6" stop-color="#e0301a"/><stop offset="0.85" stop-color="#9a0f4a"/><stop offset="1" stop-color="#4a0c5a"/></radialGradient>
<radialGradient id="limb" cx="0.5" cy="0.2" r="0.9"><stop offset="0" stop-color="#ff8a1a"/><stop offset="0.5" stop-color="#d0201e"/><stop offset="1" stop-color="#5a0c5a"/></radialGradient>
<radialGradient id="face" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.35" stop-color="#ffe14a"/><stop offset="0.7" stop-color="#ff7a10"/><stop offset="1" stop-color="#c0182a"/></radialGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07050e" stop-opacity="0"/><stop offset="1" stop-color="#1e0a30"/></linearGradient>
<radialGradient id="mild"><stop offset="0" stop-color="#ff8a1a"/><stop offset="0.45" stop-color="#c4102a" stop-opacity="0.8"/><stop offset="1" stop-color="#3a0a5a" stop-opacity="0"/></radialGradient>
</defs>
<style>
.sway{transform-box:fill-box;animation:sway 14s ease-in-out infinite}
.sway2{transform-box:fill-box;animation:sway 19s ease-in-out infinite reverse}
@keyframes sway{0%,100%{transform:rotate(-0.6deg)}50%{transform:rotate(0.6deg)}}
.heat{animation:breathe 7s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:0.55}50%{opacity:0.8}}
.lock{fill:#ff1a0a;animation:breathe 3s ease-in-out infinite}
.halo{fill:none;stroke:#ff2a1a;stroke-width:11;stroke-linecap:round;opacity:0.16}
.core{fill:none;stroke:#ff3a22;stroke-width:4.6;stroke-linecap:round}
.rs{opacity:0.85;animation:build 16s linear infinite}
@keyframes build{0%{opacity:0}4%{opacity:0.85}70%{opacity:0.85}85%{opacity:0}100%{opacity:0}}
.s0{animation:s0 40s linear infinite}
.s1{animation:s1 40s linear infinite}
.s2{animation:s2 40s linear infinite}
.s3{animation:s3 40s linear infinite}
@keyframes s0{0%,18%{opacity:1}21%,94%{opacity:0.1}97%,100%{opacity:1}}
@keyframes s1{0%,38%{opacity:1}41%,94%{opacity:0.1}97%,100%{opacity:1}}
@keyframes s2{0%,58%{opacity:1}61%,94%{opacity:0.1}97%,100%{opacity:1}}
@keyframes s3{0%,78%{opacity:1}81%,94%{opacity:0.1}97%,100%{opacity:1}}
@media (min-aspect-ratio: 16/9){.gnt{transform:translate(0px,50px)}}
@media (min-aspect-ratio: 2/1){.gnt{transform:translate(0px,117px)}}
@media (min-aspect-ratio: 12/5){.gnt{transform:translate(0px,183px)}}
@media (min-aspect-ratio: 3/1){.gnt{transform:translate(0px,250px)}}
@media (max-aspect-ratio: 16/9){.gnt{transform:translate(-125px,0px)}.pl{transform:translate(125px,0px)}.pr{transform:translate(-60px,0px)}}
@media (max-aspect-ratio: 3/2){.gnt{transform:translate(-260px,0px)}.pl{transform:translate(260px,0px)}.pr{transform:translate(-130px,0px)}}
@media (max-aspect-ratio: 6/5){.gnt{transform:translate(-395px,0px)}.pl{transform:translate(395px,0px)}.pr{transform:translate(-200px,0px)}}
@media (max-aspect-ratio: 9/10){.gnt{transform:translate(-530px,0px)}.pl{transform:translate(530px,0px)}.pr{transform:translate(-330px,0px)}}
.bar{transform-box:fill-box;transform-origin:left;animation:drain 40s linear infinite}
@keyframes drain{0%{transform:scaleX(1)}94%{transform:scaleX(0)}100%{transform:scaleX(1)}}
</style>
<rect width="1600" height="900" fill="url(#sky)"/>
<rect y="560" width="1600" height="340" fill="url(#ground)"/>
<g class="sway" opacity="0.9">${back}</g>
${warm('mild', 330, 360, 20, 14, -4)}
<g class="pr"><g class="heat">
<path d="M1124 548Q1124 516 1158 508L1172 504L1200 504L1216 508Q1248 516 1250 548L1256 640L1244 800H1132L1118 640Z" fill="url(#body)"/>
<path d="M1126 540Q1104 560 1100 620L1094 700Q1104 712 1114 702L1122 630Z M1248 540Q1270 560 1274 616L1290 676Q1282 690 1270 682L1252 628Z" fill="url(#limb)"/>
<path d="M1172 490L1200 490L1202 510L1170 510Z" fill="url(#limb)"/>
<path d="M1160 466Q1160 438 1186 436Q1212 438 1212 466Q1212 494 1186 500Q1160 494 1160 466Z" fill="url(#face)"/>
</g>
<g class="lock"><circle cx="1179" cy="456" r="3.4"/><circle cx="1193" cy="456" r="3.4"/><circle cx="1186" cy="468" r="3.4"/></g>
<g class="sway2">${frond(1060, 960, 340, -62, 1, '#1d1446')}${frond(1420, 960, 320, -128, -1, '#1d1446')}</g></g>
<g class="sway2">${front}</g>
<g class="sway">${warmLeaves}</g>
<g class="pl">${readout}</g>
${GAUNTLET}
</svg>`
