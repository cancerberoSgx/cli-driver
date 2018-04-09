import { platform } from 'os'
import { spawn } from 'node-pty'
import { ITerminal, IPtyForkOptions } from 'node-pty/lib/interfaces'
import { DriverOptions, DriverData, IDriver, DriverDump } from './typings/cli-driver'
import { EventEmitter } from 'events'
import { resolve } from 'dns'
import * as shell from 'shelljs'
import { writeFile, appendFile } from 'fs'
import * as path from 'path'

export class Driver extends EventEmitter implements IDriver {

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

  public start (options?: DriverOptions): Promise<void> {
    this.options = options || {}
    this.shellCommand = platform() === 'win32' ? 'powershell.exe' : 'bash'
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

  public enter (input: string): Promise<void> {
    return this.write(input + '\r')
  }
  private lastWrite: number = 0
  /**
   * @param str writes given text. Notice that this won't submit ENTER. For that you need to append "\r" or use @link enter
   */
  public write (str: string): Promise<void> {
    this.lastWrite = Date.now() // TODO: all the performance magic should happen here - we should acomodate all the data
    this.ptyProcess.write(str)
    return this.promiseResolve<void>()
  }

  // READ

  public getDataFromLastWrite (lastWrite: number = this.lastWrite): Promise<string> {
    // make this more performant but storing last index and last data returned index we know is less than this.lastwrite so we dont have to iterate all the array and concatenate all again
    return this.getDataFromTimestamp(this.lastWrite)
  }
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

  public waitTimeout: number = 10000
  public waitInterval: number = 400

  public wait (ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  public waitForData (
    predicate?: ((data: string) => boolean) | string,
    timeout: number= this.waitTimeout,
    interval: number = this.waitInterval,
    afterTimestamp: number= this.lastWrite
  ): Promise<string> {

    let intervalId
    const realPredicate: (data: string) => boolean = typeof predicate === 'string' ? (data: string) => data.includes(predicate) : predicate

    const checkData = async (resolve) => {
      const data = await this.getDataFromTimestamp(afterTimestamp)
      if (realPredicate(data)) {
        clearInterval(intervalId)
        this.promiseResolve(data, resolve)
      } else {
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
        this.once(Driver.EVENT_DATA, data => resolve(data))
      }
    })
  }

  public waitForDataAndEnter (
    predicate: ((data: string) => boolean) | string,
    commandToEnter: string,
    timeout: number= this.waitTimeout,
    interval: number = this.waitInterval,
    afterTimestamp: number = this.lastWrite
  ): Promise<string> {
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

  public dumpState (): Promise < DriverDump > {
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

}
