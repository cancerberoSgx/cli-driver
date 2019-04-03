import { IPtyForkOptions } from 'node-pty'
import { Driver } from '.'

export interface WaitUntilPredicate extends Function {
  originalPredicate: Function
}

export interface DriverData {
  data: string
  timestamp: number
}

export interface DebugInfo {
  commandHistory: Array<any>
  dataFromLastWrite: string
  lastWrite: number
  allData: string
  shellCommand: string
}

export interface DriverError {
  code: string
  description: string
  /**
   * if the object resolved by a promise complies with Driver.ERROR_TYPE you can be more or less sure is ab error resolved by a promise because of [[WaitUntilOptions.rejectOnTimeout]]
   */
  type: 'cli-driver-error'
  toString: () => string
}

export interface DriverOptions extends IPtyForkOptions {
  /**
   * If string debug information will be dumped to a file with that name after client finish or an error is thrown. If boolean to stdout
   * @type {string | boolean}
   */
  debug?: string | boolean

  /**
   * if true all the output in the terminal will be printed in the parent process stdout (useful for debugging)
   */
  notSilent?: boolean

  /**
   * number of milliseconds after which resolve write / enter promise. Default: 0
   */
  waitAfterWrite?: number

  /**
   * number of milliseconds after which resolve write / enter promise. Default: 0
   */
  waitAfterEnter?: number

  /**
   * Returns the application to spawn as a terminal. By default, in unix is `bash` and in windows is `powershell.exe`
   */
  shellCommand?: () => string

  /**
   * funciton that returns arguments to be passed to the shell command, by default `[]` unless in pewershell.exe in which case is ['-NoLogo']
   */
  shellCommandArgs?: () => Array<string>

  /**
   * By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   */
  waitUntilRejectOnTimeout?: boolean

  /**
   * users can install a global handler for all wait* method call that trigger a timeout
   */
  waitUntilTimeoutHandler?: (error: DriverError, predicate: ((...args: any[]) => Promise<any> | any) | any) => void

  /**
   * users can install a global handler for all wait* method call that end up matching the predicate successfully
   */
  waitUntilSuccessHandler?: (data: string, predicate: ((...args: any[]) => Promise<any> | any) | any) => void

  /**
   * how periodically `wait*` functions will poll to check given predicate
   */
  waitUntilTimeout?: number

  /**
   * how periodically `wait*` functions will poll to check given predicate
   */
  waitUntilInterval?: number
}

export interface WaitUntilOptions<T> {
  /**
   * predicate a function that if return a truthy value will stop the polling
   */
  predicate: ((...args: any[]) => Promise<T | boolean> | T | boolean) | T

  /**
   * For how long``wait*` function will wait until it return a rejected promise. Default value is [[Driver.waitTimeout]]
   */
  timeout?: number

  /**
   *  How periodically `wait*` functions will poll to check given predicate. Default value is [[Driver.waitInterval]]
   */
  interval?: number

  /**
   * By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   */
  rejectOnTimeout?: boolean
}

export interface WaitForDataOptions extends WaitUntilOptions<string> {
  /**
   * if provided it will ork with data after that given timestamp. By default this timestamp is the last write()'s
   */
  afterTimestamp?: number
}

export interface WriteAndWaitForDataOptions extends WaitForDataOptions {
  /**
   * data to write
   */
  input: string
}
