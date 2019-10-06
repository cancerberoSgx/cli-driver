import { EventEmitter } from 'events'
import { IPty, spawn } from 'node-pty'
import { platform } from 'os'
import { sleep } from 'misc-utils-of-mine-generic'
import { DriverData, DriverError, DriverOptions } from './interfaces'
import { now } from './time'

type Listener<O> = (event: O) => void
interface Em<Name, Event> extends EventEmitter {
  on(name: Name, listener: Listener<Event>): this
  once(name: Name, listener:Listener<Event>): this
  emit(name: Name, options: Event): boolean
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;
  emit(event: string | symbol, ...args: any[]): boolean;
}
interface DriverEmitter extends Em<'start', DriverOptions> {
  // on(name: 'start', listener: Listener<DriverOptions>): this
  // once(name: 'start', listener:Listener<DriverOptions>): this
  // emit(name: 'start', options: DriverOptions): this
  // on(event: string | symbol, listener: (...args: any[]) => void): this;
  // once(event: string | symbol, listener: (...args: any[]) => void): this;
  // emit(event: string | symbol, ...args: any[]): boolean;

    eventNames(): EventNames[];
      // eventNames(): Array<string | symbol>;
}
type EventNames = 'start'|'data'|'destroy'|'exit'|'error'
/**
 * Core base part of Driver implementation. Takes care of node-pty and emit "data",  "exit" and "start" events
 */
export class DriverCore extends EventEmitter implements DriverEmitter {
      eventNames(){
        return ['start','data','destroy','exit','error'] as EventNames[]
      }

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
  public start(options?: DriverOptions): Promise<this> {
    this.options = Object.assign({}, this.defaultOptions, options || {})
    this.ptyProcess = spawn(this.options.shellCommand(), this.options.shellCommandArgs(), this.options)
    this.registerDataListeners()
    this.emit('start', this.options)
    this._started = true
    this._destroyed = false
    return this.waitTime(100)
  }


  private _started = false

  public get started() {
    return this._started
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
    return this._destroyed
  }
  /**
   * destroy current terminal
   */
  public destroy(): Promise<this> {
    this.emit('destroy')
    this.cleanData()
    this.ptyProcess.kill()
    this._started = false
    this._destroyed = true
    return this.waitTime(100)
  }

  currentSize: {
    columns: number;
    rows: number
  }

  public getCurrentSize(): { columns: number; rows: number } {
    return this.currentSize
  }
  /**
   * Resizes the dimensions of the pty.
   * @param columns THe number of columns to use.
   * @param rows The number of rows to use.
   */
  public async resize(columns: number, rows: number): Promise<this> {
    this.currentSize = { columns, rows }
    this.ptyProcess.resize(columns, rows)
    return this
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
    return this
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
  public async waitTime(ms: number): Promise<this> {
    await sleep(ms)
    return this
  }
  time = this.waitTime.bind(this)
  sleep = this.waitTime.bind(this)
}
