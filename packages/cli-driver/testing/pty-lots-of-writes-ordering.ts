const os = require('os')
const stripAnsi = require('strip-ansi')
import { spawn } from 'node-pty'
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

  // let allData = []
  // client.on('data', (chunk) => {
  //   allData.push(chunk)
  // })

  let commands = []
  const commandCount = 200
  client.write('echo "" > tmp.txt\r')
  for (let i = 0; i < commandCount; i++) {
    commands.push(`echo ${i} >> tmp.txt # ${buildLine(Math.random() * (13200 - 1) + 1)} \r`)

  }

  for (let i = 0; i < commands.length; i++) {
    client.write(commands[i])
  }
  await wait(5000)

  // console.log(allData)
  client.destroy()
}
main()

function wait (t= 300) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, t)
  })
}
function buildLine (n) {
  let s = ''
  for (let i = 0; i < n; i++) {
    s += i
  }
  return s
}
