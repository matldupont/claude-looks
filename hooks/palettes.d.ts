import type { ThemeSetArgs } from 'claude-code'

export const PALETTES: Record<
  string,
  {
    scene?: string
    rain?: readonly [number, number, number, number, number, number]
    glass?: { blur: number; tint?: string; opacity: number }
    style?: ThemeSetArgs['style']
    sound?: ThemeSetArgs['sound']
    colors: Parameters<typeof import('./make-colors.js').makeColors>[0]
  }
>
