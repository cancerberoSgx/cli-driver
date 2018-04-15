import { EventEmitter } from 'events'
import { IPty, spawn } from 'node-pty'
import { platform } from 'os'
import { DriverData, DriverError, DriverOptions } from './interfaces'
import { now } from './time'

/**
 * Core base part of Driver implementation. Takes care of node-pty and emit data
 */

export class DriverCore extends EventEmitter {

  // CORE
  /**
   * Configuration options of the current instance. Driver is configured on [[start]] but options can be changed later while is running.
   */
  public options: DriverOptions

  // protected shellCommand: string

  protected ptyProcess: IPty

  protected defaultOptions: DriverOptions = {
    cols: 80,
    rows: 30,
    cwd: process.env.cwd,
    env: process.env,
    notSilent: false,
    debug: false,
    waitAfterWrite: 0,
    waitAfterEnter: 0,
    name: 'xterm',
    waitUntilRejectOnTimeout: true,
    shellCommand: () => DriverCore.systemIsWindows() ? 'powershell.exe' : 'bash',
    shellCommandArgs: () => this.options.shellCommand() === 'powershell.exe' ? ['-NoLogo'] : [],
    waitUntilTimeoutHandler: () => undefined,
    waitUntilSuccessHandler: () => undefined,
    waitUntilTimeout: 10000,
    waitUntilInterval: 200
  }

  /**
   * Starts the client with given options. Will spawn a new terminal
   */
  public start (options ?: DriverOptions): Promise<void> {
    this.options = Object.assign({}, this.defaultOptions, options || {})
    this.ptyProcess = spawn(this.options.shellCommand(), this.options.shellCommandArgs(), this.options)
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

  private data: Array<DriverData> = []
  protected getData (): Array<DriverData> {
    return this.data
  }

  private handleData (data: string): any {
    this.data.push({
      data,
      timestamp: now()
    })
    if (this.options.notSilent) {
      process.stdout.write(data)
    }
  }

  public static ERROR_TYPE: 'cli-driver-error' = 'cli-driver-error'
  protected buildError (code: string, description?): DriverError {
    return {
      code,
      description,
      type: DriverCore.ERROR_TYPE,
      toString: function () {return `${this.code} : ${this.description}`}
    }
  }

  /**
   * Return a promise resolved after given number of milliseconds
   * @param ms will resolve the promise only when given number of milliseconds passed
   */
  public waitTime (ms: number): Promise < void > {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

}
