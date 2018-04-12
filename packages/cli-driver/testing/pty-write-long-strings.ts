const os = require('os')
const pty = require('node-pty')

import { spawn } from 'node-pty'
import { rm, cat } from 'shelljs'
import * as assert from 'assert'

async function main () {
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'

  let client = spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
  })
  // client.on('error', () => {
  //   console.log('ERROR', arguments)
  // })

  const outputFile = 'letter_to_santa.txt'
  rm('-rf', outputFile)

  client.write(`cat > ${outputFile} \r`)

  const longString = buildLongString()
  console.log(`string output size: ${longString.length / 1000}K`)
  client.write(longString)

  await wait(1000) // If I remove this wait call the next assert will fail. Reason: I'm not able to know when write() finished flushing all this text so I have to wait for 5 seconds and with luck it will perform the job... :(

  const EOF = '\u001B\u0026'
  client.write(EOF)

  assert.ok(cat(outputFile).toString().length > longString.length - 200,
    `written strings length should be more or less equal to the string variable: expected ${cat(outputFile).toString().length} to be more or less ${longString.length}`)

  client.kill()
}

main()

function wait (t= 300) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, t)
  })
}

function buildLongString () {
  let s = cat(__filename).toString()
  for (let i = 0; i < 7; i++) {
    s += s // exponential!!
  }
  return s
}
