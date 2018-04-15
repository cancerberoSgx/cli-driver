const os = require('os');
const stripAnsi = require('strip-ansi');
const spawn = require("node-pty").spawn;

async function main() {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    let client = spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    });

    console.log(client._socket.destroyed)
    client.write('ls\r');
    await wait()
    client.destroy();
    await wait()
    console.log(client._socket.destroyed)
}
main();
function wait(t = 300) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, t);
    });
}