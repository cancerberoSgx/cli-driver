import { platform } from 'os'
import { spawn, IPty } from 'node-pty'
import { DriverOptions, DriverData, DriverDump, WaitUntilOptions, WriteAndWaitForDataOptions, WaitForDataOptions, DriverError } from './interfaces'
import { EventEmitter } from 'events'
import { resolve } from 'dns'
import * as shell from 'shelljs'
import { appendFile } from 'fs'
import * as path from 'path'
import { waitFor } from './waitFor'

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

  private ptyProcess: IPty

  private defaultOptions: DriverOptions = {
    cols: 80,
    rows: 30,
    cwd: process.env.cwd,
    env: process.env,
    debug: false,
    notSilent: false,
    waitAfterWrite: 0,
    waitAfterEnter: 0,
    name: 'xterm',
    waitUntilRejectOnTimeout: true,
    shellCommand: () => Driver.systemIsWindows() ? 'powershell.exe' : 'bash',
    waitUntilTimeoutHandler: () => undefined,
    waitUntilSuccessHandler: () => undefined,
    waitUntilTimeout: 10000,
    waitUntilInterval: 200
  }

  /**
   * Starts the client with given options. Will spawn a new terminal
   */
  public start (options?: DriverOptions): Promise<void> {
    this.options = Object.assign({}, this.defaultOptions, options || {})
    this.ptyProcess = spawn(this.options.shellCommand(), [], this.options)
    this.registerDataListeners()
    return this.waitTime(200)
  }

  private registerDataListeners (): any {
    this.ptyProcess.on('data', data => {
      this.emit('data', data)
    })
    this.on('data', data => {
      this.handleData(data)
    })
  }

  public static systemIsWindows (): boolean {
    return platform() === 'win32'
  }

  /**
   * destroy current terminal
   */
  public destroy (): Promise<void > {
    this.ptyProcess.kill()
    return this.waitTime(200)
  }

  public getPtyProcess (): IPty {
    return this.ptyProcess
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

  public static ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT: 'ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT' = 'ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT'
  public static ERROR_WAITUNTIL_TIMEOUT: 'ERROR_WAITUNTIL_TIMEOUT' = 'ERROR_WAITUNTIL_TIMEOUT'
  public static ERROR_TYPE: 'cli-driver-error' = 'cli-driver-error'
  private buildError (code: string, description?): DriverError {
    return {
      code,
      description,
      type: Driver.ERROR_TYPE,
      toString: function () {return `${this.code} : ${this.description}`}
    }
  }

  // WRITE

  private lastWrite: number = 0
  /**
   * Writes given text in the terminal
   * @param str writes given text. Notice that this won't submit ENTER. For that you need to append "\r" or use [[enter]]s
   * @param waitAfterWrite number of milliseconds after which resolve write / enter promise. Default: 0
   */
  public write (input: string, waitAfterWrite: number = this.options.waitAfterWrite): Promise<void> {
    return new Promise(resolve => {
      this.debugCommand({ name: 'write', args: [input] })
      this.lastWrite = Date.now() // TODO: all the performance magic should happen here - we should accommodate all the data
      this.ptyProcess.write(input, (flushed) => { //  TODO: timeout if flushed is never true or promise is never resolved?
        if (flushed) {
          setTimeout(() => {
            resolve()
          }, waitAfterWrite)
        }
      })
    })
  }

  private writeToEnter (input: string): string {
    return input + '\r'
  }

  /**
   * Will write given text and then press ENTER. Just like [[write]] but appending `'\r'`
   * @param input the string to enter
   * @param waitAfterWrite number of milliseconds after which resolve write / enter promise. Default: 0
   */
  public enter (input: string, waitAfterEnter: number= this.options.waitAfterEnter): Promise<void> {
    return this.write(this.writeToEnter(input), waitAfterEnter)
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
      if (this.data[i].timestamp >= timestamp - this.options.waitUntilInterval / 2) { // TODO magic
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
   * the more generic want* method on which all the others are based. Returns a promise that is resolved only when given predicate is fulfilled or rejected if timeout ms passes. THe implementation will be calling the predicate function like polling each interval [[waitInterval]] milliseconds.
   * @param predicate a function that if return a truthy value will stop the polling
   * @param timeout default value is [[waitTimeout]]
   * @param interval default value is [[waitInterval]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @returns A promise resolved with the return value of the predicate if it ever return truthy or in other case if the predicate never returns truthy in given timeout it will be rejected unless rejectOnTimeout===false in which case the promise is resolved with false
   */
  public waitUntil<T> (
    predicate: ((...args: any[]) => (Promise<T | boolean> | T | boolean)) | WaitUntilOptions<T> | T,
    timeout: number= this.options.waitUntilTimeout,
    interval: number = this.options.waitUntilInterval,
    rejectOnTimeout: boolean= this.options.waitUntilRejectOnTimeout
  ): Promise<T | false | DriverError> {

    if (typeof predicate === 'object' && (predicate as WaitUntilOptions<T>).predicate) {
      const options = (predicate as WaitUntilOptions< T >)
      predicate = options.predicate
      timeout = options.timeout || this.options.waitUntilTimeout
      interval = options.interval || this.options.waitUntilInterval
      rejectOnTimeout = (options.rejectOnTimeout === false || this.options.waitUntilRejectOnTimeout === false) ? false : true
    }
    if (interval >= timeout) {
      const error = this.buildError(Driver.ERROR_WAITUNTIL_INTERVAL_GREATER_THAN_TIMEOUT)
      return rejectOnTimeout ? Promise.reject(error) : Promise.resolve(error)
    }

    if (typeof predicate === 'function') {
      return new Promise<T | false | DriverError>((resolve, reject) => {
        waitFor(predicate, interval, timeout)
        .then(data => {

          this.options.waitUntilSuccessHandler(data as any, predicate)
          resolve(data as any)
        })
        .catch(() => {
          const rejectMessage = `${Driver.ERROR_WAITUNTIL_TIMEOUT} on whenUntil() !
          Perhaps you want to increase driver.waitTimeout ? Description of the failed predicate:\n
          ${Driver.printWaitUntilPredicate(predicate)}\n          `
          const error = this.buildError(Driver.ERROR_WAITUNTIL_TIMEOUT, rejectMessage)
          this.options.waitUntilTimeoutHandler(error, predicate)
          if (rejectOnTimeout) {
            reject(error)
          } else {
            resolve(error)
          }
        })

      })

    } else {
      return Promise.reject('waitUntil called with non function predicate')
    }
  }

  public static printWaitUntilPredicate (predicate: any): string {
    if (typeof predicate === 'function') {
      if (predicate.originalPredicate) {
        if (typeof predicate.originalPredicate === 'string') {
          return `${predicate.originalPredicate}`
        } else {
          return `${predicate.originalPredicate.toString()}`
        }
      } else {
        return `${predicate.toString()}`
      }
    } else {
      return `${predicate}`
    }
  }

  /**
   * Wait until new data matches given predicate. If not predicate is given will return the next data chunk that comes. Based on [[waitUntil]]
   * @param predicate condition stdout must comply with in other to stop waiting for. If none it will wait until next data chunk is received. If function that's the predicate function the data must comply with. If string, the predicate will be that new data contains this string
   * @param timeout wait timeout in ms
   * @param interval wait interval in ms
   * @param afterTimestamp if provided it will ork with data after that given timestamp. By default this timestamp is the last write()'s
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return resolved with the matched data or rejected if no data comply with predicate before timeout
   */
  public waitForData (
    predicate?: ((data: string) => boolean) | string | WaitForDataOptions,
    timeout: number= this.options.waitUntilTimeout,
    interval: number = this.options.waitUntilInterval,
    afterTimestamp: number= this.lastWrite,
    rejectOnTimeout: boolean= true
  ): Promise<string | false | DriverError> {

    let predicate2

    if (typeof predicate === 'object' && (predicate as WaitUntilOptions<string>).predicate) {
      const options: WaitForDataOptions = (predicate as WaitForDataOptions)
      predicate2 = options.predicate
      timeout = options.timeout || this.options.waitUntilTimeout
      interval = options.interval || this.options.waitUntilInterval
      rejectOnTimeout = (options.rejectOnTimeout === false || this.options.waitUntilRejectOnTimeout === false) ? false : true
      afterTimestamp = options.afterTimestamp || this.lastWrite
    } else {
      predicate2 = predicate
    }

    const realPredicate = async () => {
      const data = await this.getDataFromTimestamp(afterTimestamp)

      console.log('SEBASEBAPRPRPRPRP **** isisisisi IS: predicate type is: ' + typeof predicate2)
      if (typeof predicate2 === 'string') {
        return data.includes(predicate2) ? data : false
      } else if (predicate2 instanceof Function) {
        return predicate2(data) ? data : false
      } else {
        return true
      }
    }
    (realPredicate as any).originalPredicate = predicate2
    return this.waitUntil<string>(realPredicate, timeout, interval, rejectOnTimeout)
  }

  /**
   * @param  commandToEnter same as in [[write]]
   * @param predicate same as in [[waitForData]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return same as in [[waitForData]]
   */
  public enterAndWaitForData (
    input: string | WriteAndWaitForDataOptions,
    predicate: ((data: string) => boolean) | string,
    timeout: number = this.options.waitUntilTimeout,
    interval: number = this.options.waitUntilInterval,
    afterTimestamp: number = this.lastWrite,
    rejectOnTimeout: boolean= true
  ): Promise< string | false | DriverError> {
    if (typeof input !== 'string') {
      (input as WriteAndWaitForDataOptions).input = this.writeToEnter((input as WriteAndWaitForDataOptions).input)
    } else {
      input = this.writeToEnter(input)
    }
    return this.writeAndWaitForData(input, predicate, timeout, interval, afterTimestamp, rejectOnTimeout)
  }

  /**
   * @param  commandToEnter same as in [[write]]
   * @param predicate same as in [[waitForData]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return same as in [[waitForData]]
   */
  public async writeAndWaitForData (
    input: string | WriteAndWaitForDataOptions ,
    predicate: ((data: string) => boolean) | string,
    timeout: number = this.options.waitUntilTimeout,
    interval: number = this.options.waitUntilInterval,
    afterTimestamp: number = this.lastWrite,
    rejectOnTimeout: boolean= true
  ): Promise < string | false | DriverError> {

    if (typeof input !== 'string') {
      const options = input as any
      input = options.input
      predicate = options.predicate
      timeout = options.timeout || this.options.waitUntilTimeout
      interval = options.interval || this.options.waitUntilInterval
      afterTimestamp = options.afterTimestamp || this.lastWrite
      rejectOnTimeout = (options.rejectOnTimeout === false || this.options.waitUntilRejectOnTimeout === false) ? false : true
    }
    await this.write(input as string)
    return this.waitForData(predicate, timeout, interval, afterTimestamp, rejectOnTimeout)
  }

  /**
   * @param predicate same as in [[waitForData]]
   * @param commandToEnter same as in [[write]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return {Promise<string>} same as in [[waitForData]]
   */
  public waitForDataAndEnter (
    predicate: ((data: string) => boolean) | string | WriteAndWaitForDataOptions,
    input: string,
    timeout: number= this.options.waitUntilTimeout,
    interval: number = this.options.waitUntilInterval,
    afterTimestamp: number = this.lastWrite,
    rejectOnTimeout: boolean= true
  ): Promise <string | false | DriverError> {
    if (predicate && (predicate as WriteAndWaitForDataOptions).predicate) {
      (predicate as WriteAndWaitForDataOptions).input = this.writeToEnter((predicate as WriteAndWaitForDataOptions).input)
    } else {
      input = this.writeToEnter(input)
    }
    return this.waitForDataAndWrite(predicate, input, timeout, interval, afterTimestamp, rejectOnTimeout)
  }

  /**
   * @param predicate same as in [[waitForData]]
   * @param input same as in [[write]]
   * @param timeout same as in [[waitForData]]
   * @param interval same as in [[waitForData]]
   * @param afterTimestamp same as in [[waitForData]]
   * @param rejectOnTimeout By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   * @return {Promise<string>} same as in [[waitForData]]
   */
  public waitForDataAndWrite (
    predicate: ((data: string) => boolean) | string | WriteAndWaitForDataOptions,
    input: string,
    timeout: number = this.options.waitUntilTimeout,
    interval: number = this.options.waitUntilInterval,
    afterTimestamp: number = this.lastWrite,
    rejectOnTimeout: boolean= true
  ): Promise < string | false | DriverError> {
    if (predicate && (predicate as WriteAndWaitForDataOptions).predicate) {
      const options = predicate as any
      predicate = options.predicate
      input = options.input
      timeout = options.timeout || this.options.waitUntilTimeout
      interval = options.interval || this.options.waitUntilInterval
      afterTimestamp = options.afterTimestamp || this.lastWrite
      rejectOnTimeout = (options.rejectOnTimeout === false || this.options.waitUntilRejectOnTimeout === false) ? false : true
    }
    return new Promise<string | false | DriverError>((resolve, reject) => {
      this.waitForData(predicate, timeout, interval, afterTimestamp, rejectOnTimeout).then(async data => {
        await this.write(input)
        resolve(data)
      }).catch(ex => {
        rejectOnTimeout ? reject(ex) : resolve(ex)
      })
    })
  }

  /**
   *
   * @param ms will resolve the promise only when given number of milliseconds passed
   */
  public waitTime (ms: number): Promise < void > {
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
      shellCommand: this.options.shellCommand()
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
}
