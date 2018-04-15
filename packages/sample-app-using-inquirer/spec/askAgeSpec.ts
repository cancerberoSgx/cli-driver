import { Driver } from 'cli-driver'

describe('askAge', () => {
  it('askAge should not allow to proceed age under 18', async () => {
    const client = new Driver()
    await client.start({
      // notSilent: true
    })
    await client.enter('node lib/src/askAge')
    await client.waitForDataAndEnter('Enter your age', '')
    await client.waitForDataAndEnter('Invalid age', '13')
    await client.waitForDataAndEnter('You cannot proceed with 13 years old. Good bye', 'node lib/src/askAge')
    await client.waitForDataAndEnter('Enter your age', '20')
    await client.waitForDataAndEnter('Since you are 20 years old you can proceed. Welcome', '')
    await client.destroy()
  })
})

jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000
