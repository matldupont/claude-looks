// Fallback digital rain, kept light: no masks. A glyph-pattern rect per column with a
// background-colored fade over its top, falling slowly. Pure vector.
let s = 7
const r = () => {
  s = (s * 16807) % 2147483647
  return (s - 1) / 2147483646
}

const COLS = 40
const columns = Array.from({ length: COLS }, (_, i) => {
  const x = 12 + i * 40
  const h = 300 + Math.floor(r() * 380)
  const dur = (14 + r() * 14).toFixed(1)
  const delay = (-r() * 20).toFixed(1)
  const op = (0.4 + r() * 0.5).toFixed(2)

  return `<g class="col" opacity="${op}" style="animation-duration:${dur}s;animation-delay:${delay}s"><rect x="${x}" y="0" width="14" height="${h}" fill="url(#cells)"/><rect x="${x - 1}" y="0" width="16" height="${h}" fill="url(#fade)"/><rect x="${x}" y="${h - 16}" width="14" height="16" fill="#d8ffe4"/></g>`
}).join('')

export const MATRIX = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
<defs>
<pattern id="cells" width="14" height="18" patternUnits="userSpaceOnUse"><rect x="1" y="2" width="5" height="3" fill="#2dff7a"/><rect x="8" y="2" width="4" height="8" fill="#2dff7a"/><rect x="1" y="8" width="6" height="2" fill="#2dff7a"/><rect x="3" y="12" width="9" height="3" fill="#2dff7a"/></pattern>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000a04" stop-opacity="1"/><stop offset="0.85" stop-color="#000a04" stop-opacity="0"/></linearGradient>
<radialGradient id="vig" cx="0.5" cy="0.5" r="0.7"><stop offset="0.4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></radialGradient>
</defs>
<style>
.col{animation:drop 20s linear infinite}
@keyframes drop{from{transform:translateY(-720px)}to{transform:translateY(950px)}}
</style>
<rect width="1600" height="900" fill="#000a04"/>
${columns}
<rect width="1600" height="900" fill="url(#vig)"/>
</svg>`
