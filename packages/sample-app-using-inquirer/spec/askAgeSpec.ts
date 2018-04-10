import { Driver } from 'cli-driver'

async function waitAndEnterExpecting (client, waitFor, dataToEnter) {
  const data = await client.waitForDataAndEnter(waitFor, dataToEnter)
  expect(data).toContain(waitFor)
  return Promise.resolve(data)
}

describe('askAge', () => {
  it('askAge should not allow to proceed age under 18', async (done) => {
    const client = new Driver()
    await client.start({ notSilent: true })
    await client.enter('node lib/src/askAge')
    await waitAndEnterExpecting(client, 'Enter your age', '')
    await waitAndEnterExpecting(client, 'Invalid age', '13')
    await waitAndEnterExpecting(client, 'You cannot proceed with 13 years old. Good bye', 'node lib/src/askAge')
    await waitAndEnterExpecting(client, 'Enter your age', '20')
    await waitAndEnterExpecting(client, 'Since you are 20 years old you can proceed. Welcome', '')
    await client.destroy()
    done()
  })
})

jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000
