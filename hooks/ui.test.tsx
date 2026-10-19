import { expect, mock, test } from 'claude-code/testing'

test('/sysband로 숨기고 다시 켠다, 입력창 위에 한 줄로 그린다', async ($, on) => {
  mock.clock(on)
  on('session.start', () => ({ cwd: '/' }))
  on('session.usage', () => ({ value: { startedAt: 0, context: {} as never, rateLimits: [{ kind: 'five_hour', percentUsed: 23 }, { kind: 'seven_day', percentUsed: 41 }] } }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: 'F 1 U A C M\n/dev/vda 264212084 9388396 31455216 23% /\n', stderr: '' } }))
  on('fs.read', () => ({ value: 'MemTotal: 16479424 kB\nMemAvailable: 15932748 kB\n' }))
  on('command.register', () => ({ value: {} }))
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  await $.session.start({ cwd: '/' } as never)

  const band = await $.ui.mount({ plugin: 'sys-band', surface: 'terminal', component: 'AbovePrompt', props: { hasSurvey: false } })
  const line = await band.find({ type: 'Text', text: /사용량/ })
  console.log('표시줄 →', line?.text)
  expect(line).toBeDefined()

  const off = await $.command.run({ command: 'sysband', args: '' } as never)
  console.log('/sysband →', off.text)
  expect(await band.find({ type: 'Text', text: /사용량/ })).toBeUndefined()
  const on2 = await $.command.run({ command: 'sysband', args: '' } as never)
  console.log('/sysband →', on2.text)
  expect(await band.find({ type: 'Text', text: /사용량/ })).toBeDefined()
})
