// Rainy Tokyo: night skyline, neon signs, rain, and a wet street. Pure vector.
const rnd = seed => {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const r = rnd(42)

const BASE = 640
const towers = []
for (let x = -20; x < 1620; ) {
  const w = 70 + Math.floor(r() * 110)
  const h = 150 + Math.floor(r() * 330)
  towers.push({ x, w, h })
  x += w + Math.floor(r() * 12)
}

const shade = ['#0b0e22', '#0e1228', '#090c1c']
const body = towers
  .map((t, i) => `<rect x="${t.x}" y="${BASE - t.h}" width="${t.w}" height="${t.h}" fill="${shade[i % 3]}"/>`)
  .join('')

const windows = towers
  .map(t => {
    let out = ''
    for (let wy = BASE - t.h + 16; wy < BASE - 20; wy += 22) {
      for (let wx = t.x + 10; wx < t.x + t.w - 14; wx += 18) {
        if (r() < 0.16) {
          const c = r() < 0.5 ? '#ffd27a' : r() < 0.5 ? '#ff6fb5' : '#6fe7ff'
          out += `<rect x="${wx}" y="${wy}" width="7" height="10" fill="${c}" opacity="${(0.35 + r() * 0.45).toFixed(2)}"/>`
        }
      }
    }
    return out
  })
  .join('')

// Neon signs: [x, y, w, h, color, delay]
const SIGNS = [
  [150, 330, 46, 150, '#ff3d9a', 0],
  [520, 270, 120, 36, '#38d9ff', 1.3],
  [980, 300, 40, 170, '#ff3d9a', 2.1],
  [1280, 360, 130, 34, '#ffc857', 0.7],
]
const signs = SIGNS.map(
  ([x, y, w, h, c, d]) =>
    `<g class="neon" style="animation-delay:${-d}s"><rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" fill="${c}" opacity="0.14"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="4"/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="${c}" opacity="0.28"/></g>`,
).join('')

const reflections = SIGNS.map(
  ([x, , w, , c]) => `<rect x="${x - 4}" y="${BASE}" width="${w + 8}" height="230" fill="url(#ref-${c.slice(1)})" opacity="0.5"/>`,
).join('')
const refDefs = [...new Set(SIGNS.map(s => s[4]))]
  .map(
    c =>
      `<linearGradient id="ref-${c.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="0.6"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`,
  )
  .join('')

const rain = Array.from({ length: 70 }, () => {
  const x = Math.floor(r() * 1700) - 50
  const len = 36 + Math.floor(r() * 50)
  const dur = (0.8 + r() * 0.7).toFixed(2)
  const delay = (-r() * 2).toFixed(2)
  const op = (0.18 + r() * 0.3).toFixed(2)

  return `<line class="rain" x1="${x}" y1="-100" x2="${x - 8}" y2="${-100 + len}" opacity="${op}" style="animation-duration:${dur}s;animation-delay:${delay}s"/>`
}).join('')

const ripples = [
  [260, 760],
  [700, 820],
  [1100, 740],
  [1420, 840],
]
  .map(
    ([x, y], i) =>
      `<ellipse class="rip" cx="${x}" cy="${y}" rx="30" ry="7" style="animation-delay:${-i * 0.9}s"/>`,
  )
  .join('')

export const TOKYO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060f"/><stop offset="0.7" stop-color="#1a1236"/><stop offset="1" stop-color="#4a1a52"/></linearGradient>
<linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1d3c"/><stop offset="1" stop-color="#05060f"/></linearGradient>
${refDefs}
</defs>
<style>
.rain{stroke:#9fb4ff;stroke-width:1.4;animation:fall 1s linear infinite}
.neon{animation:flick 5s ease-in-out infinite}
.rip{fill:none;stroke:#9fb4ff;stroke-width:1.5;opacity:0;transform-box:fill-box;transform-origin:center;animation:ripple 3.6s ease-out infinite}
@keyframes fall{from{transform:translate(0,0)}to{transform:translate(-60px,1050px)}}
@keyframes flick{0%,100%{opacity:1}46%{opacity:0.92}48%{opacity:0.55}50%{opacity:1}}
@keyframes ripple{0%{opacity:0.5;transform:scale(0.2)}100%{opacity:0;transform:scale(1.6)}}
</style>
<rect width="1600" height="900" fill="url(#sky)"/>
${body}${windows}${signs}
<rect x="0" y="${BASE}" width="1600" height="260" fill="url(#street)"/>
${reflections}${ripples}
${rain}
</svg>`
