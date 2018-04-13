// this is the spec in which we are working right now

import { Driver } from '../src'
import * as shell from 'shelljs'

describe('basics', () => {
  let client: Driver

  beforeAll(async () => {
    client = new Driver()
    await client.start()
    await client.waitTime(200)
  })

  afterAll(async () => {
    await client.destroy()
  })

  it('timeouts&intervals should be more or less what they say they are... ', async () => {

  })
})
