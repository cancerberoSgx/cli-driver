import { EventEmitter } from 'events'
import { IPty, spawn } from 'node-pty'
import { platform } from 'os'
import { DriverData, DriverError, DriverOptions } from './interfaces'
import { now } from './time'

/**
 * Core base part of Driver implementation. Takes care of node-pty and emit "data",  "exit" and "start" events
 */

export class DriverCore extends EventEmitter {
  // CORE
  /**
   * Configuration options of the current instance. Driver is configured on [[start]] but options can be changed later while is running.
   */
  public options: DriverOptions

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
    shellCommand: () => (DriverCore.systemIsWindows() ? 'powershell.exe' : 'bash'),
    shellCommandArgs: () => (this.options.shellCommand() === 'powershell.exe' ? ['-NoLogo'] : []),
    waitUntilTimeoutHandler: () => undefined,
    waitUntilSuccessHandler: () => undefined,
    waitUntilTimeout: 10000,
    waitUntilInterval: 200
  }

  /**
   * Starts the client with given options. Will spawn a new terminal
   */
  public start(options?: DriverOptions): Promise<void> {
    this.options = Object.assign({}, this.defaultOptions, options || {})
    this.ptyProcess = spawn(this.options.shellCommand(), this.options.shellCommandArgs(), this.options)
    this.registerDataListeners()
    this.emit('start')
    this._started = true
    this._destroyed = false
    return this.waitTime(200)
  }
  private _started = false;
  public get started() {
    return this._started;
  }
  private registerDataListeners(): any {
    this.ptyProcess.on('data', data => {
      this.emit('data', data)
    })
    this.ptyProcess.on('exit', data => {
      this.emit('exit', data)
    })
    this.on('data', data => {
      this.handleData(data)
    })
  }

  public static systemIsWindows(): boolean {
    return platform() === 'win32'
  }

  private _destroyed = false

  public get destroyed() {
    return this._destroyed;
  }
  /**
   * destroy current terminal
   */
  public destroy(): Promise<void> {
    this.cleanData()
    this.ptyProcess.kill()
    this._started = false
    this._destroyed = true
    return this.waitTime(200)
  }

  currentSize: { columns: number; rows: number }
  public getCurrentSize(): { columns: number; rows: number } {
    return this.currentSize
  }
  /**
   * Resizes the dimensions of the pty.
   * @param columns THe number of columns to use.
   * @param rows The number of rows to use.
   */
  public resize(columns: number, rows: number): Promise<void> {
    this.currentSize = { columns, rows }
    this.ptyProcess.resize(columns, rows)
    return Promise.resolve()
  }

  private data: Array<DriverData> = []

  protected getData(): Array<DriverData> {
    return this.data
  }

  /**
   * Cleans the data buffer. Useful for making sure that the next data chunk is independent from current state.
   */
  public cleanData() {
    this.data.splice(0, this.data.length)
  }

  private handleData(data: string): any {
    this.data.push({
      data,
      timestamp: now()
    })
    if (this.options.notSilent) {
      process.stdout.write(data)
    }
  }

  public static ERROR_TYPE: 'cli-driver-error' = 'cli-driver-error'

  protected buildError(code: string, description?): DriverError {
    return {
      code,
      description,
      type: DriverCore.ERROR_TYPE,
      toString: function () {
        return `${this.code} : ${this.description}`
      }
    }
  }

  /**
   * Return a promise resolved after given number of milliseconds
   * @param ms will resolve the promise only when given number of milliseconds passed
   */
  public waitTime(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }
  /**
   * Alias for [[waitTime]].
   */
  time(ms = 100) {
    return this.waitTime(ms)
  }
}
