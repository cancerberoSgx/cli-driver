// this is the spec in which we are working right now

import { Driver } from '../src'
import * as shell from 'shelljs'

describe('waitUntilSuccessHandler and waitUntilRejectHandler global listeners', () => {

  let client: Driver

  beforeEach(async () => {
    client = new Driver()

    client.start({
      notSilent: true,
      waitUntilRejectOnTimeout: false
    })
  })

  afterEach(async () => {
    await client.destroy()
  })

  it('one can install global listeners to be notified on all  successful predicate match', async () => {
  })

})
