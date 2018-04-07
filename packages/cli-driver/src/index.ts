import * as os from 'os'
import { spawn } from 'node-pty'
import { ITerminal, IPtyForkOptions } from 'node-pty/lib/interfaces'

/**
 * Usage example:
 * ```js
 * const client = new CmdDriver()
 * await client.start()
 * ```
 */
class CmdDriver {

  shellCommand: string

  ptyProcess: ITerminal

  defaultOptions: CmdDriverOptions = {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
  }

  public start (options?: CmdDriverOptions): Promise<void> {
    options = options || {}
    this.shellCommand = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
    const ptyOptions = Object.assign({}, this.defaultOptions, options)
    this.ptyProcess = spawn(this.shellCommand, [], ptyOptions)
    this.ptyProcess.on('data', (data) => {
      this.handleData(data)
    })
    return Promise.resolve()
  }

  /**
   * Will write given text and then press ENTER
   * @param str the string to enter
   */
  public enter (str: string): Promise<void> {
    return this.write(str + '\r')
  }

  public write (str: string): Promise<void> {
    this.ptyProcess.write(str)
    return Promise.resolve()
  }

  public waitForData (predicate?: (data: string) => boolean): Promise<string> {
    return Promise.resolve('')
  }

  public destroy (): Promise<void > {
    this.ptyProcess.destroy()
    return Promise.resolve()
  }

  private handleData (data: string): any {
    console.log('handleData', data)
  }
}

export default CmdDriver

interface CmdDriverOptions extends IPtyForkOptions {

}

// var os = require('os')
// var pty = require('node-pty')

// var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'

// ptyProcess.on('data', function (data) {
//   console.log(data)
// })

// ptyProcess.write('ls\r')
// ptyProcess.resize(100, 40)
// ptyProcess.write('ls\r')

// setTimeout(() => {
//   ptyProcess.destroy()
// }, 2000)
