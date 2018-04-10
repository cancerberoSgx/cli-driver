import { platform } from 'os'
import { spawn } from 'node-pty'
import { ITerminal } from 'node-pty/lib/interfaces'
import { DriverOptions, DriverData, DriverDump } from './interfaces'
import { EventEmitter } from 'events'
import { resolve } from 'dns'
import * as shell from 'shelljs'
import { appendFile } from 'fs'
import * as path from 'path'

/**
 * Usage example:
 *
 * ```js
 * import { Driver } from 'cli-driver'
 * const client = new Driver()
 * const options = {cwd: '/home/sg/myproject', noSilent: true}
 * client.start()
 * client.enter('ls')
 *
 * // now we wait until package.json is printed in stdout
 * const data = await client.waitForData(data => data.includes('package.json'))
 * ```
 *
 * The options are documented [[DriverOptions]]
 */

export class Driver extends EventEmitter {

  // CORE
  private options: DriverOptions

  private shellCommand: string

  private ptyProcess: ITerminal

  public static EVENT_DATA: string = 'data'

  private defaultOptions: DriverOptions = {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.cwd,
    env: process.env,
    debug: false,
    notSilent: false
  }

  /**
   * Starts the client with given options. Will spawn a new terminal
   * @param options
   */
  public start (options?: DriverOptions): Promise<void> {
    this.options = options || {}
    this.shellCommand = this.systemIsWindows() ? 'powershell.exe' : 'bash'
    const ptyOptions = Object.assign({}, this.defaultOptions, this.options)
    this.ptyProcess = spawn(this.shellCommand, [], ptyOptions)
    this.ptyProcess.on('data', data => {
      this.emit(Driver.EVENT_DATA, data)
    })
    this.on(Driver.EVENT_DATA,data => {
      this.handleData(data)
    })
    return Promise.resolve()
  }

  public systemIsWindows (): boolean {
    return platform() === 'win32'
  }

  /**
   * destroy current terminal
   */
  public destroy (): Promise<void > {
    this.ptyProcess.destroy()
    return Promise.resolve()
  }

  private data: Array<DriverData> = []
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

  private lastWrite: number = 0
  /**
   * Writes given text in the terminal
   * @param str writes given text. Notice that this won't submit ENTER. For that you need to append "\r" or use [[enter]]s
   */
  public write (input: string): Promise<void> {
    this.debugCommand({ name: 'write', args: [input] })
    this.lastWrite = Date.now() // TODO: all the performance magic should happen here - we should acomodate all the data
    this.ptyProcess.write(input)
    return this.promiseResolve<void>()
  }
  private writeToEnter (input: string): string {
    return input + '\r'
  }
  /**
   * Will write given text and then press ENTER. Just like [[write]] but appending `'\r'`
   * @param input the string to enter
   */
  public enter (input: string): Promise<void> {
    return this.write(this.writeToEnter(input))
  }

  // READ
  /**
   * Get data from last time [[write]] was issued. Remember that other methods like [[enter]] could also end up calling [[write]]
   * @param lastWrite Optional get data from given time
   */
  public getDataFromLastWrite (lastWrite: number = this.lastWrite): Promise<string> {
    // TODO: make me faster, please ! could be storing  last index and last data returned index we know is less than this.lastwrite so we dont have to iterate all the array and concatenate all again
    return this.getDataFromTimestamp(this.lastWrite)
  }
  /**
   * Get data printed after given timestamp
   */
  public getDataFromTimestamp (timestamp: number): Promise<string> {
    // TODO: make me faster please !  could be storing  last index and last data returned index we know is less than this.lastwrite so we dont have to iterate all the array and concatenate all again
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
   * get all the data collected from [[start]]
   */
  public getAllData (): Promise<string> {
    // TODO: make me faster, please !! I think we can solve much of all the performance problems by storing all data and only concatenate from allDataLastIndex
    let ad = ''
    this.data.forEach(d => ad += d.data)
    return Promise.resolve(ad)
  }

  // WAIT

  /**
   * for how long``wait*` function will wait until it return a rejected promise
   */
  public waitTimeout: number = 10000

  /**
   * how periodically `wait*` functions will poll to check given predicate
   */
  public waitInterval: number = 400

  /**
   *the more generic want* method on which all the others are based. Returns a promise that is resolved only when given predicate is fullfilled or rejected if timeout ms passes. THe implementation will be calling the predicate function like polling each interval [[waitInterval]] milliseconds.
   * @param predicate
   * @param timeout default value is [[waitTimeout]]
   * @param interval default value is [[waitInterval]]
   */
  public waitUntil<T> (
    predicate: () => Promise<T | boolean>,
    timeout: number= this.waitTimeout,
    interval: number = this.waitInterval
  ): Promise<T> {
    let intervalId

    const checkData = async (resolve) => {
      const result = await predicate()
      if (result) {
        this.promiseResolve(result, resolve)
        clearInterval(intervalId)
      } else {
        setTimeout(async () => {
          checkData(resolve)
        }, timeout)
      }
    }
    // TODO: make me faster please!
    return new Promise<T>((resolve, reject) => {
      if (predicate) {
        intervalId = setInterval(async () => {
          checkData(resolve)
        }, interval)
        setTimeout(() => {
          const predicateDump = JSON.stringify({
            predicate: typeof predicate === 'string' ? predicate : typeof predicate === 'function' ? predicate.toString() : predicate + ''
          })
          this.promiseReject(`waitUntil timeout. Perhaps you want to increase driver.waitTimeout ?\n. Tip about the waitUntil call:${predicateDump}`, reject)
        }, timeout)
      } else {
        this.once(Driver.EVENT_DATA, data => resolve(data))
      }
    })
  }
/**
  * Wait until new data matches given predicate. If not predicate is given will return the next data chunk that comes. Based on [[waitUntil]]
  * @param predicate condition stdout must comply with in other to stop waiting for. If none it will wait until next data chunk is received. If function that's the predicate function the data must comply with. If string, the predicate will be that new data contains this string
  * @param timeout wait timeout in ms
  * @param interval wait interval in ms
  * @param afterTimestamp if provided it will ork with data after that given timestamp. By default this timestamp is the last write()'s
  * @return resolved with the matched data or rejected if no data comply with predicate before timeout
  */
  public waitForData (
    predicate?: ((data: string) => boolean) | string,
    timeout: number= this.waitTimeout,
    interval: number = this.waitInterval,
    afterTimestamp: number= this.lastWrite
  ): Promise<string> {

    const realPredicate: () => Promise < string | boolean > = async () => {
      const data = await this.getDataFromTimestamp(afterTimestamp)
      if (typeof predicate === 'string') {
        return data.includes(predicate) ? data : false
      } else if (predicate instanceof Function) {
        return predicate(data) ? data : false
      } else {
        return true
      }
    }
    return this.waitUntil<string>(realPredicate, timeout, interval)
  }

  /**
   * @param predicate same as in [[waitForData]]
   * @param commandToEnter same as in [[write]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @return {Promise<string>} same as in [[waitForData]]
   */
  public waitForDataAndEnter (
    predicate: ((data: string) => boolean) | string,
    commandToEnter: string,
    timeout: number= this.waitTimeout,
    interval: number = this.waitInterval,
    afterTimestamp: number = this.lastWrite
  ): Promise<string> {
    return this.waitForDataAndWrite(predicate, commandToEnter, timeout, interval, afterTimestamp)
  }

  /**
   * @param  commandToEnter same as in [[write]]
   * @param predicate same as in [[waitForData]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @return same as in [[waitForData]]
   */
  public enterAndWaitForData (
    input: string,
    predicate: ((data: string) => boolean) | string,
    timeout: number= this.waitTimeout,
    interval: number = this.waitInterval,
    afterTimestamp: number = this.lastWrite
  ): Promise<string> {
    return this.writeAndWaitForData(this.writeToEnter(input), predicate)
  }

  /**
   * @param  commandToEnter same as in [[write]]
   * @param predicate same as in [[waitForData]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @return same as in [[waitForData]]
   */
  public async writeAndWaitForData (
    input: string,
    predicate: ((data: string) => boolean) | string,
    timeout: number= this.waitTimeout,
    interval: number = this.waitInterval,
    afterTimestamp: number = this.lastWrite
  ): Promise<string> {
    await this.write(input)
    return this.waitForData(predicate, timeout, interval, afterTimestamp)
  }

  /**
   * @param predicate same as in [[waitForData]]
   * @param commandToEnter same as in [[write]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @return {Promise<string>} same as in [[waitForData]]
   */
  public waitForDataAndWrite (
    predicate: ((data: string) => boolean) | string,
    commandToEnter: string,
    timeout: number= this.waitTimeout,
    interval: number = this.waitInterval,
    afterTimestamp: number = this.lastWrite
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.waitForData(predicate, timeout, interval, afterTimestamp).then(async data => {
        await this.write(commandToEnter)
        this.promiseResolve(data, resolve)
      }).catch(ex => {
        this.promiseReject(ex, reject)
      })
    })
  }

  /**
   *
   * @param ms will resolve the promise only when given number of milliseconds passed
   */
  public waitTime (ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  // MISC

  public dumpState (): Promise < DriverDump > {
    return Promise.resolve({
      data: this.data,
      lastWrite: this.lastWrite,
      shellCommand: this.shellCommand
    })
  }

  private debug (text: string): Promise < void > {
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

  private debugCommand (cmd: any): any {
    if (this.options.debug) {
      console.log('COMMAND', cmd)
    }
  }

  private promiseResolve<T> (resolveWith ?: T, resolve ?: (arg: T) => any): Promise < T > {
    if (resolve) {
      resolve(resolveWith)
    }
    return Promise.resolve(resolveWith)
  }
  private async promiseReject<T> (rejectWith: T, reject ?: (arg: T) => any): Promise < T > {
    if (reject) {
      reject(rejectWith)
    }
    return Promise.reject(rejectWith)
  }

}
