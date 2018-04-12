const Driver = require('../lib/src').Driver
const shell = require('shelljs')

async function main(){



const client = new Driver()
await client.open({
    // name: 'xterm',
    notSilent: true,
    cwd: shell.pwd().toString(),
    env: process.env,
    debug: true
    // encoding: 'unicode'
})

// client.getPtyProcess().slave.write

// client.ptyProcess.slave

// await client.waitTime(500)
console.log(process.pid, client.ptyProcess.process.pid, client.ptyProcess.slave.pid, client.ptyProcess.w.master.pid)

// await client.waitTime(500)
// client.enter('cd tmp')
// await client.waitTime(500)
// client.enter('ls')
// await client.waitTime(500)
// client.enter('echo $TERM')
// await client.waitTime(500)

// client.write('more tr' + tab + tab)
// await client.waitTime(2500)
// client.enter('ls')
// await client.waitTime(500)
// client.enter('more tr' + tab + tab)
// await client.waitTime(2500)
await client.destroy()
}

main()