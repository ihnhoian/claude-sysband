import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Gauge, Limit, Snapshot } from '../types'

const snap = atom({ plugin: 'sys-band', key: 'snap' } as const, null)
const isHidden = atom({ plugin: 'sys-band', key: 'isHidden' } as const, false)

const LABEL: Record<string, string> = { five_hour: '5시간', seven_day: '7일', spend_limit: '한도' }

export function parseDf(out: string): Gauge | null {
  const cols = out.trim().split('\n').pop()?.trim().split(/\s+/) ?? []
  const total = Number(cols[1])
  const used = Number(cols[2])
  return total > 0 && Number.isFinite(used) ? { usedKb: used, totalKb: total } : null
}

export function parseMeminfo(text: string): Gauge | null {
  const kb = (k: string) => Number(new RegExp(`^${k}:\\s+(\\d+)`, 'm').exec(text)?.[1])
  const total = kb('MemTotal')
  const avail = kb('MemAvailable')
  return total > 0 && Number.isFinite(avail) ? { usedKb: total - avail, totalKb: total } : null
}

const pct = (g: Gauge) => Math.round((g.usedKb / g.totalKb) * 100)
const gb = (kb: number) => (kb / 1048576).toFixed(1)

export function describe(s: Snapshot): string {
  const parts: string[] = []
  const limits = s.limits.map(l => `${LABEL[l.kind] ?? l.kind} ${Math.max(0, Math.round(100 - l.percentUsed))}% 남음`)
  parts.push(limits.length ? `사용량 ${limits.join(' · ')}` : '사용량 —')
  parts.push(s.disk ? `디스크 ${gb(s.disk.usedKb)}/${gb(s.disk.totalKb)}G (${pct(s.disk)}%)` : '디스크 —')
  parts.push(s.mem ? `메모리 ${gb(s.mem.usedKb)}/${gb(s.mem.totalKb)}G (${pct(s.mem)}%)` : '메모리 —')
  return parts.join('  │  ')
}

async function refresh($: EngineInterface, limits: Limit[]): Promise<void> {
  const [disk, mem] = await Promise.all([
    $.process.run(['df', '-Pk', '/']).then(r => (r.exitCode === 0 ? parseDf(r.stdout) : null), () => null),
    $.fs.read('/proc/meminfo').then(t => parseMeminfo(String(t)), () => null),
  ])
  await update($, snap, () => ({ limits, disk, mem }))
}

export const register: Register = on => {
  let limits: Limit[] = []

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await $.command.register({ name: 'sysband', description: '사용량·디스크·메모리 표시줄 켜기/끄기' })
    limits = (await $.session.usage()).rateLimits
    await refresh($, limits)
    $.clock.every(15000, () => void refresh($, limits))
    return r
  })

  on('session.measure', async ($, e, next) => {
    limits = e.rateLimits
    await update($, snap, s => (s ? { ...s, limits } : s))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, snap)
    if (e.props.hasSurvey || s === null || (await read($, isHidden))) {
      return next(e)
    }
    const { Box, Button, Text } = $.ui.resolve(e)
    return (
      <Box>
        <Text dimColor>{describe(s)} </Text>
        <Button key="hide" label="숨기기" onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })

  on('command.run', { command: 'sysband' }, async ($, e, next) => {
    const hidden = !(await read($, isHidden))
    await update($, isHidden, () => hidden)
    return { text: hidden ? '표시줄을 숨겼습니다.' : '표시줄을 다시 켰습니다.' }
  })
}
