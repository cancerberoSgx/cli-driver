const Driver = require('../lib/src').Driver
const ansi = require('../lib/src').ansi
const csi = ' \x1b['

async function main () {

  const client = new Driver()

  await client.start({ notSilent: true })

  client.write('echo seba')
  await client.waitTime(1000)
  client.write('\x7f') 

  // const EOF = '\x1b!@\x04'
  // await client.enter('\u001B\u000C')

  await client.waitTime(1000)

  await client.destroy()

}

main()
