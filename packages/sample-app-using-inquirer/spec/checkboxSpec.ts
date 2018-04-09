// const Driver = require('cli-driver').Driver

// async function waitAndEnterExpecting (client, waitFor, dataToEnter) {
//   const data = await client.waitForDataAndEnter(waitFor, dataToEnter)
//   expect(data).toContain(waitFor)
//   return Promise.resolve(data)
// }

// describe('askAge', () => {
//   it('askAge should not allow to proceed age under 18', async () => {
//     const client = new Driver()
//     await client.start()
//     await client.enter('node lib/src/checkbox')
//     // await waitAndEnterExpecting(client, 'Enter your age', '')
//     // await waitAndEnterExpecting(client, 'Invalid age', '13')
//     // await waitAndEnterExpecting(client, 'You cannot proceed with 13 years old. Good bye', 'node lib/src/askAgeMain')
//     // await waitAndEnterExpecting(client, 'Enter your age', '20')
//     // await waitAndEnterExpecting(client, 'Since you are 20 years old you can proceed. Welcome', '')
//   })
// })

// jasmine.DEFAULT_TIMEOUT_INTERVAL = 12000
