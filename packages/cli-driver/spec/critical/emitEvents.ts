import { Driver } from '../../src'
import * as shell from 'shelljs'
import { time } from '../../src/time'

describe('emit events', () => {
  it('should emit events data, start and exit accordingly', async () => {
    let client: Driver = new Driver()

    let handlers = {
      data: jasmine.createSpy(),
      exit: jasmine.createSpy(),
      start: jasmine.createSpy()
    }

    client.on('data', handlers.data)
    client.on('start', handlers.start)
    client.on('exit', handlers.exit)

    await client.start({
      // notSilent: true
    })
    // client.enter('\x1b]2;holaholahola\x1b\\')
    // await client.waitTime(2000)

    await client.enter('node -p "3/4"', 100)

    await client.destroy()

    expect(handlers.start.calls.count()).toBe(1)
    expect(handlers.exit.calls.count()).toBe(1)
    expect(handlers.data.calls.count()).toBeGreaterThan(0)
    expect(!!handlers.data.calls.allArgs().find(a => a.find(b => b.includes('3/4')))).toBe(true)
    expect(!!handlers.data.calls.allArgs().find(a => a.find(b => b.includes('0.75')))).toBe(true)

    expect(handlers.data)
  })
})
