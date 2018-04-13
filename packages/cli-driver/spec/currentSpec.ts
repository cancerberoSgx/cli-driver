// this is the spec in which we are working right now

import { Driver } from '../src'
import * as shell from 'shelljs'

describe('write() and enter()', () => {

  // it('write waitAfterEnter/waitAfterWrite paramter should keep it waiting no matter if the command tasks short time', async () => {
  //   let client: Driver = new Driver()
  //   await client.start({ notSilent: true })
  //   const time = (input?): number | [number, number] => {
  //     let hrtime
  //     if (!input) {
  //       return process.hrtime()
  //     } else {
  //       hrtime = process.hrtime(input)
  //       const nanoseconds = (hrtime[0] * 1e9) + hrtime[1]
  //       return nanoseconds / 1e6
  //     }
  //   }

  //   const strip = require('strip-ansi')
  //   async function getAllDataStriped (client: Driver) {
  //     const data = await client.getAllData()
  //     return strip(data)
  //   }

  //   let t1: any = time()
  //   await client.enter('echo 123')
  //   let data: any = await client.waitForData({ predicate: '123', interval: 20 , timeout: 600, rejectOnTimeout: false })
  //   expect(data.type).not.toBe(Driver.ERROR_TYPE)
  //   t1 = time(t1)

  //   let t2: any = time()
  //   await client.enter('echo 123', 500) // notice the second number
  //   data = await client.waitForData({ predicate: '123', interval: 20 , timeout: 600, rejectOnTimeout: false })
  //   expect(data.type).not.toBe(Driver.ERROR_TYPE)

  //   t2 = time(t2)

  //   if (Math.abs(t1 - t2) < 500 - t1 * 2) {
  //     fail('waitAfterEnter didnt make write() to take more time')
  //   }
  //   await client.destroy()

  // })

  // it('write waitAfterEnter/waitAfterWrite paramter should keep it waiting no matter if the command tasks short time', async () => {
  //   let client: Driver = new Driver()
  //   await client.start({ notSilent: true })
  //   const time = (input?): number | [number, number] => {
  //     let hrtime
  //     if (!input) {
  //       return process.hrtime()
  //     } else {
  //       hrtime = process.hrtime(input)
  //       const nanoseconds = (hrtime[0] * 1e9) + hrtime[1]
  //       return nanoseconds / 1e6
  //     }
  //   }

  //   const strip = require('strip-ansi')
  //   async function getAllDataStriped (client: Driver) {
  //     const data = await client.getAllData()
  //     return strip(data)
  //   }

  //   let t1: any = time()
  //   await client.enter('echo 123')
  //   let data: any = await client.waitForData({ predicate: '123', interval: 20 , timeout: 600, rejectOnTimeout: false })
  //   expect(data.type).not.toBe(Driver.ERROR_TYPE)
  //   t1 = time(t1)

  //   let t2: any = time()
  //   await client.enter('echo 123', 500) // notice the second number
  //   data = await client.waitForData({ predicate: '123', interval: 20 , timeout: 600, rejectOnTimeout: false })
  //   expect(data.type).not.toBe(Driver.ERROR_TYPE)

  //   t2 = time(t2)

  //   if (Math.abs(t1 - t2) < 500 - t1 * 2) {
  //     fail('waitAfterEnter didnt make write() to take more time')
  //   }
  //   await client.destroy()

  // })

})
