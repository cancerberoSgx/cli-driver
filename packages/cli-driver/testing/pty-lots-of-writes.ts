const stripAnsi = require('strip-ansi')
import { spawn } from 'node-pty'
import * as assert from 'assert'

function wait (t= 300) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, t)
  })
}

async function lotsOfWritesIHaveToWait () {
  let client = spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
  })

  let allData = ''
  client.on('data', (chunk) => {
    allData += chunk
  })

  for (let i = 0; i < 10; i++) {
    client.write(`echo ${i}\r`)
  }
  client.write('echo "thelastecho"\r')

  await wait(2000) // if you remove this wait() then the next assert fails - basically because writes are not sync and we are executing many

  assert.ok(allData.includes('thelastecho'), 'alldata should include the last echo')

  client.kill()
}

lotsOfWritesIHaveToWait()
