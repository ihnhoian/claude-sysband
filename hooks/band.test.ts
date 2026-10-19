import { expect, test } from 'claude-code/testing'

import { describe, parseDf, parseMeminfo } from './register'

test('df와 meminfo를 읽어 한 줄로 그린다', () => {
  const disk = parseDf('Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/root 10485760 2621440 7864320 25% /\n')
  const mem = parseMeminfo('MemTotal:       8388608 kB\nMemFree: 100 kB\nMemAvailable:   6291456 kB\n')
  expect(disk).toEqual({ usedKb: 2621440, totalKb: 10485760 })
  expect(mem).toEqual({ usedKb: 2097152, totalKb: 8388608 })
  const line = describe({ limits: [{ kind: 'five_hour', percentUsed: 23.5 }], disk, mem })
  expect(line).toBe('사용량 5시간 77% 남음  │  디스크 2.5/10.0G (25%)  │  메모리 2.0/8.0G (25%)')
})
