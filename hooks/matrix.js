// Backdrop under the Matrix shader: a plain dark field with the same vignette the shader
// draws, so nothing visibly changes when the shader is ready and the rain starts.
// Where no shader plays, this is all that shows.
export const MATRIX = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="vig" cx="0.5" cy="0.5" r="0.7"><stop offset="0.4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/></radialGradient>
</defs>
<rect width="1600" height="900" fill="#000a04"/>
<rect width="1600" height="900" fill="url(#vig)"/>
</svg>`
