import * as os from 'os'
import { spawn } from 'node-pty'
import { ITerminal, IPtyForkOptions } from 'node-pty/lib/interfaces'
import { EventEmitter } from 'events'
import { resolve } from 'dns'

/**
 * Usage example:
 * ```js
 * const client = new CliDriver()
 * await client.start()
 * TODO
 * ```
 */
class CliDriver extends EventEmitter {

  ptyProcess: ITerminal
  // CORE

  public static EVENT_DATA: string = 'pty-data'
  private defaultOptions: CliDriverOptions = {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.cwd,
    env: process.env
  }
  public start (options?: CliDriverOptions): Promise<void> {
    options = options || {}
    const shellCommand = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
    const ptyOptions = Object.assign({}, this.defaultOptions, options)
    this.ptyProcess = spawn(shellCommand, [], ptyOptions)
    this.ptyProcess.on('data', data => {
      this.emit(CliDriver.EVENT_DATA, data)
    })
    this.on(CliDriver.EVENT_DATA,data => {
      this.handleData(data)
    })
    return Promise.resolve()
  }
  public destroy (): Promise<void > {
    this.ptyProcess.destroy()
    return Promise.resolve()
  }

  private data: Array<CliDriverData> = []
  private handleData (data: string): any {
    this.data.push({
      data,
      timestamp: Date.now()
    })
  }

  // WRITE

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
    this.lastWrite = Date.now() // TODO: all the performance magic should happen here - we should acomodate all the data
    return Promise.resolve()
  }

  // READ

  /**
   * get current data from last time enter() was issued
   * @param {number} lastWrite Optional get data from given time
   */
  public getDataFromLastWrite (lastWrite: number= this.lastWrite): Promise<string> {
    // make this more performant but storing last index and last data returned index we know is less than this.lastwrite so we dont have to iterate all the array and concatenate all again
    return this.getDataFromTimestamp(this.lastWrite)
  }
  /**
   * @param {number} timestamp Optional get data from given time
   */
  public getDataFromTimestamp (timestamp: number): Promise<string> {
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
  // private allData: string = ''
  // private allDataLastIndex: number = 0

  public getAllData (): Promise<string> {
    // TODO: make it performant by storing all data and only concatenate from allDataLastIndex
    let ad = ''
    this.data.forEach(d => ad += d.data)
    return Promise.resolve(ad)
  }

  // WAIT

  private _waitTimeout: number = 10000
  private _waitInterval: number = 500
  /**
   * for how long wait* function will wait until it return a rejected promise
   * @type {number}
   */
  public set waitTimeout (t: number) {
    this._waitTimeout = t
  }
  /**
   * how periodically wait* functions will poll to check given predicate
   * @type {number}
   */
  public set waitInterval (t: number) {
    this._waitInterval = t
  }

  /**
   * will wait until new data matches given predicate. If not predicate is given will return the next data chunk that comes.
   * @param {Function} predicate
   * @param {number} [timeout]
   * @param {number} [interval]
   */
  public waitForData (predicate?: (data: string) => boolean,
  timeout: number= this._waitTimeout, interval: number = this._waitInterval,
  afterTimestamp: number= this.lastWrite): Promise<string> {
    let intervalId
    const checkData = async (resolve) => {
      const data = await this.getDataFromTimestamp(afterTimestamp)
      if (predicate(data)) {
        clearInterval(intervalId)
        resolve(data)
      } else {
        setTimeout(async () => {
          checkData(resolve)
        }, timeout)
      }
    }
    // TODO: make me faster please!
    const promise = new Promise<string>((resolve, reject) => {
      if (predicate) {
        intervalId = setInterval(async () => {
          checkData(resolve)
        }, interval)
        setTimeout(() => {
          reject('TIMEOUT, use CmdClient.waitTimeout property to increase it ?')
        }, timeout)
      } else {
        this.once(CliDriver.EVENT_DATA, data => resolve(data))
      }
    })
    return promise
  }

  // MISC

  public dumpState (): Promise < CliDriverDump > {
    return Promise.resolve({ data: this.data, lastWrite: this.lastWrite })
  }

}

export default CliDriver

interface CliDriverDump {
  data: Array<CliDriverData>
  lastWrite: number
}

interface CliDriverOptions extends IPtyForkOptions {

}

interface CliDriverData {
  data: string
  timestamp: number
}
