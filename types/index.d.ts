export type Limit = { kind: string; percentUsed: number; resetsAt?: string }
export type Gauge = { usedKb: number; totalKb: number }
export type Snapshot = { limits: Limit[]; disk: Gauge | null; mem: Gauge | null }

declare module 'claude-code' {
  interface PluginState {
    'sys-band': { snap: Snapshot | null; isHidden: boolean }
  }
}
