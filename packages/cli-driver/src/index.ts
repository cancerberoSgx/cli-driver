import * as os from 'os'
import { spawn } from 'node-pty'
import { ITerminal, IPtyForkOptions } from 'node-pty/lib/interfaces'
import { EventEmitter } from 'events'
import { resolve } from 'dns'

/**
 * Usage example:
 * ```js
 * const client = new CmdDriver()
 * await client.start()
 * TODO
 * ```
 */
class CmdDriver extends EventEmitter {

  public static EVENT_DATA: string = 'pty-data'

  public static WAIT_TIMEOUT: number = 3000

  private shellCommand: string

  private ptyProcess: ITerminal

  private data: Array<CmdDriverData> = []

  private defaultOptions: CmdDriverOptions = {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.cwd,
    env: process.env
  }

  public start (options?: CmdDriverOptions): Promise<void> {
    options = options || {}
    this.shellCommand = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
    const ptyOptions = Object.assign({}, this.defaultOptions, options)
    this.ptyProcess = spawn(this.shellCommand, [], ptyOptions)
    this.ptyProcess.on('data', data => {
      this.emit(CmdDriver.EVENT_DATA, data)
    })
    this.on(CmdDriver.EVENT_DATA,data => {
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
    return new Promise(resolve => {
      if (predicate) {
      } else {
        this.once(CmdDriver.EVENT_DATA, data => resolve(data))
      }
    })
  }

  // private allData: string = ''
  // private allDataLastIndex: number = 0

  public getAllData (): Promise<string> {
    // TODO: make it performant by storing all data and only concatenate from allDataLastIndex
    let ad = ''
    this.data.forEach(d => ad += d.data)
    return Promise.resolve(ad)
  }

  /**
   * get current data from last time enter() was issued
   */
  public getLastEnterCurrentData (): Promise<String> {
    return Promise.resolve('')
  }

  public destroy (): Promise<void > {
    this.ptyProcess.destroy()
    return Promise.resolve()
  }

  private handleData (data: string): any {
    this.data.push({
      data,
      timestamp: Date.now()
    })
    // console.log('handleData BEGIN', data, 'handleData END')
  }

}

export default CmdDriver

interface CmdDriverOptions extends IPtyForkOptions {

}

interface CmdDriverData {
  data:string
  timestamp:number
}
