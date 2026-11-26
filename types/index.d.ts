// What the looks mod keeps in session state.
declare module 'claude-code' {
  interface PluginState {
    looks: {
      // 1 while the person is typing, for the Matrix surge.
      typing: number
      // 1 for a moment after a send, for the Matrix wave.
      sent: number
    }
  }
}

export type LooksFlag = number
