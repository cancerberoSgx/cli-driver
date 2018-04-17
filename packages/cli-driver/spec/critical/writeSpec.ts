// this is the spec in which we are working right now

import { Driver } from '../../src'
import * as shell from 'shelljs'
import { time } from '../../src/time'

describe('write', () => {
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
  })

  it('write waitAfterEnter paramter should keep it waiting no matter if the command tasks short time', async () => {
    let client: Driver = new Driver()
    await client.start({
      // notSilent: true
    })

    let t1: any = time()
    await client.enter('echo 123')
    let data: any = await client.forData({ predicate: '123', interval: 20 , timeout: 600, rejectOnTimeout: false })
    expect(data.type).not.toBe(Driver.ERROR_TYPE)
    t1 = time(t1)

    let t2: any = time()
    await client.enter('echo 123', 500) // notice the second number
    data = await client.forData({ predicate: '123', interval: 20 , timeout: 600, rejectOnTimeout: false })
    expect(data.type).not.toBe(Driver.ERROR_TYPE)
    t2 = time(t2)

    if (Math.abs(t1 - t2) < 500 - t1 * 2) {
      fail('waitAfterEnter didnt make write() to take more time')
    }
    await client.destroy()

  })

  it('write waitAfterEnter/waitAfterWrite can be setted globally in Driver options', async () => {
    let client: Driver = new Driver()
    await client.start({
      // notSilent: true,
      // try to prove that both values are independen
      waitAfterEnter: 500,
      waitAfterWrite: 50
    })

    let t1: any = time()
    await client.enter('echo 123', 20) // we set locally a much lesser value for waitAfterEnter it should override the global one)
    let data: any = await client.forData({ predicate: '123', interval: 20 , timeout: 600, rejectOnTimeout: false })
    expect(data.type).not.toBe(Driver.ERROR_TYPE)
    t1 = time(t1)

    let t2: any = time()
    await client.enter('echo 123') // waitAfterEnter was set globally!
    data = await client.forData({ predicate: '123', interval: 20 , timeout: 600, rejectOnTimeout: false })
    expect(data.type).not.toBe(Driver.ERROR_TYPE)
    t2 = time(t2)

    if (Math.abs(t1 - t2) < 500 - t1 * 2) {
      fail('waitAfterEnter didnt make write() to take more time')
    }
    await client.destroy()

  })

// it('lets play with node and the interactive terminal', async () => {
//   await client.enter('node -p "(10+7)+\'years ago...\'"', 100)

// })

})
