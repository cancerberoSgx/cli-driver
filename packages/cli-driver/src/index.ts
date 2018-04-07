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

  private lastWrite: number = 0

  /**
   * @param str writes given text. Notice that this won't submit ENTER. For that you need to append "\r" or use @link enter
   */
  public write (str: string): Promise<void> {
    this.ptyProcess.write(str)
    this.lastWrite = Date.now()
    return Promise.resolve()
  }

  /**
   * get current data from last time enter() was issued
   * @param {number} lastWrite Optional get data from given time
   */
  public getDataFromLastWrite (lastWrite: number= this.lastWrite): Promise<String> {
    // make this more performant but storing last index and last data returned index we know is less than this.lastwrite so we dont have to iterate all the array and concatenate all again
    return this.getDataFromTimestamp(this.lastWrite)
  }
  /**
   * @param {number} timestamp Optional get data from given time
   */
  public getDataFromTimestamp (timestamp: number): Promise<String> {
    // make this more performant but storing last index and last data returned index we know is less than this.lastwrite so we dont have to iterate all the array and concatenate all again
    let i = 0
    for (; i < this.data.length; i++) {
      if (this.data[i].timestamp > timestamp) {
        break
      }
    }
    let dataFrom = ''
    for (; i < this.data.length; i++) {
      dataFrom += this.data[i].data
    }
    return Promise.resolve(dataFrom)
  }
  /**
   * will wait until new data matches given predicate. If not predicate is given will return the next data chunk that comes.
   * @param {Function} predicate
   */
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

  public destroy (): Promise<void > {
    this.ptyProcess.destroy()
    return Promise.resolve()
  }

  private handleData (data: string): any {
    this.data.push({
      data,
      timestamp: Date.now()
    })
  }

  public dumpState (): Promise<Object> {
    return Promise.resolve({ data: this.data, lastWrite: this.lastWrite })
  }

}

export default CmdDriver

interface CmdDriverOptions extends IPtyForkOptions {

}

interface CmdDriverData {
  data: string
  timestamp: number
}
