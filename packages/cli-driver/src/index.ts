import { platform } from 'os'
import { spawn } from 'node-pty'
import { ITerminal, IPtyForkOptions } from 'node-pty/lib/interfaces'
import { EventEmitter } from 'events'
import { resolve } from 'dns'
import * as shell from 'shelljs'
import { writeFile, appendFile } from 'fs'
import * as path from 'path'

/**
 * Usage example:
 * ```js
 * const client = new CliDriver()
 * await client.start()
 * TODO
 * ```
 */
class CliDriver extends EventEmitter {

  // CORE
  private options: CliDriverOptions

  private shellCommand: string

  private ptyProcess: ITerminal

  public static EVENT_DATA: string = 'pty-data'

  private defaultOptions: CliDriverOptions = {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.cwd,
    env: process.env,
    debug: false,
    notSilent: false
  }

  public start (options?: CliDriverOptions): Promise<void> {
    this.options = options || {}
    this.shellCommand = platform() === 'win32' ? 'powershell.exe' : 'bash'
    const ptyOptions = Object.assign({}, this.defaultOptions, this.options)
    this.ptyProcess = spawn(this.shellCommand, [], ptyOptions)
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
    if (this.options.notSilent) {
      process.stdout.write(data)
    }
  }

  // WRITE

  /**
   * Will write given text and then press ENTER
   * @param input the string to enter
   */
  public async enter (input: string): Promise<void> {
    // console.log('ENTER: ', input)
    return this.write(input + '\r')
  }
  private lastWrite: number = 0
  /**
   * @param str writes given text. Notice that this won't submit ENTER. For that you need to append "\r" or use @link enter
   */
  public async write (str: string): Promise<void> {
    this.lastWrite = Date.now() // TODO: all the performance magic should happen here - we should acomodate all the data
    this.ptyProcess.write(str)
    return this.promiseResolve<void>()
  }

  // READ

  /**
   * get current data from last time enter() was issued
   * @param {number} lastWrite Optional get data from given time
   */
  public getDataFromLastWrite (lastWrite: number = this.lastWrite): Promise<string> {
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

  public getAllData (): Promise<string> {
    // TODO: make it performant by storing all data and only concatenate from allDataLastIndex
    let ad = ''
    this.data.forEach(d => ad += d.data)
    return Promise.resolve(ad)
  }

  // WAIT

  private _waitTimeout: number = 10000
  private _waitInterval: number = 400
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
   * @param {WaitPredicate | string} predicate condition stdout must comply with in other to stop waiting for. If none it will wait until next data chunk is received. If function that's the predicate function the data must comply with. If string, the predicate will be that new data contains this string
   * @param {number} [timeout] wait timeout in ms
   * @param {number} [interval] wait interval in ms
   * @param {number} [afterTimestamp] if provided it will ork with data after that given timestamp. By default this timestamp is the last write()'s
   * @return {Promise<String>} resolved with the matched data or rejected if no data comply with predicate before timeout
   */
  public waitForData (
    predicate?: ((data: string) => boolean) | string,
    timeout: number= this._waitTimeout,
    interval: number = this._waitInterval,
    afterTimestamp: number= this.lastWrite
  ): Promise<string> {

    // console.log('waitForData')
    let intervalId
    const realPredicate: (data: string) => boolean = typeof predicate === 'string' ? (data: string) => data.includes(predicate) : predicate

    const checkData = async (resolve) => {
      const data = await this.getDataFromTimestamp(afterTimestamp)
      if (realPredicate(data)) {
        // console.log('***MATCH***', predicate.toString(), JSON.stringify({ data }), '***MATCH***')
        clearInterval(intervalId)
        this.promiseResolve(data, resolve)
      } else {
        // console.log('**NO MATCH**', predicate.toString(), JSON.stringify({ data }), '**NO MATCH**')
        setTimeout(async () => {
          checkData(resolve)
        }, timeout)
      }
    }
    // TODO: make me faster please!
    return new Promise<string>((resolve, reject) => {
      if (predicate) {
        intervalId = setInterval(async () => {
          checkData(resolve)
        }, interval)
        setTimeout(() => {
          this.promiseReject('TIMEOUT, use CmdClient.waitTimeout property to increase it ?', reject)
        }, timeout)
      } else {
        this.once(CliDriver.EVENT_DATA, data => resolve(data))
      }
    })
  }

  /**
   *
   * @param {WaitPredicate | string } predicate same as @link{waitForData}
   * @param {string} commandToEnter same as @link{write}
   * @param {number}[timeout] same as @link{waitForData}
   * @param {number}[interval] same as @link{waitForData}
   * @param {number}[afterTimestamp] same as @link{waitForData}
   * @return {Promise<string>} same as @link{waitForData}
   */
  public waitForDataAndEnter (
    predicate: ((data: string) => boolean) | string,
    commandToEnter: string,
    timeout: number= this._waitTimeout,
    interval: number = this._waitInterval,
    afterTimestamp: number = this.lastWrite
  ): Promise<string> {
    // console.log('waitForDataAndEnter')
    return new Promise<string>((resolve, reject) => {
      this.waitForData(predicate, timeout, interval, afterTimestamp).then(async data => {
        await this.enter(commandToEnter)
        this.promiseResolve(data, resolve)
      }).catch(ex => {
        this.promiseReject(ex, reject)
      })
    })
  }

  // MISC

  public dumpState (): Promise < CliDriverDump > {
    return Promise.resolve({
      data: this.data,
      lastWrite: this.lastWrite,
      shellCommand: this.shellCommand
    })
  }
  private debug (text: string): Promise<void> {
    return new Promise(resolve => {
      if (typeof this.options.debug === 'string') {
        shell.mkdir('-p', path.dirname(this.options.debug))
        appendFile(this.options.debug, text, () => {
          resolve()
        })
      } else if (this.options.debug) {
        console.log(text)
        resolve()
      } else {
        resolve()
      }
    })
  }
  private promiseResolve<T> (resolveWith?: T, resolve?: (arg: T) => any): Promise<T> {
    if (resolve) {
      resolve(resolveWith)
    }
    return Promise.resolve(resolveWith)
  }
  private async promiseReject<T> (rejectWith: T, reject?: (arg: T) => any): Promise < T > {
    await this.debug(`promise rejected, printing state::

    ${JSON.stringify(await this.dumpState())}

    `)
    if (reject) {
      reject(rejectWith)
    }
    return Promise.reject(rejectWith)
  }

  public async wait (ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

}

export default CliDriver

/**@function
 * @name WaitPredicate
 * @param {string} data
 * @return {boolean}
 */

interface CliDriverDump {
  data: Array<CliDriverData>
  lastWrite: number
}

interface CliDriverOptions extends IPtyForkOptions {
  /**
   * If string debug information will be dumped to a file with that name after client finish or an error is thrown. If boolean to stdout
   * @type {string | boolean}
   */
  debug?: string | boolean,
  notSilent?: boolean
}

interface CliDriverData {
  data: string
  timestamp: number
}
