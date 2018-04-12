import { IPtyForkOptions } from 'node-pty'

export interface WaitUntilPredicate extends Function {
  originalPredicate: Function
}

export interface DriverDump {
  data: Array<DriverData>
  lastWrite: number
}

export interface DriverData {
  data: string
  timestamp: number
}

export interface DriverOptions extends IPtyForkOptions {
  /**
   * If string debug information will be dumped to a file with that name after client finish or an error is thrown. If boolean to stdout
   * @type {string | boolean}
   */
  debug?: string | boolean,
  /**
   * if true all the output in the terminal will be printed in the parent process stdout (useful for debugging)
   */
  notSilent?: boolean,
  /**
   * number of milliseconds after which resolve write / enter promise. Default: 0
   */
  waitAfterWrite?: number
}

export interface WaitUntilOptions<T> {
  /**
   * predicate a function that if return a truthy value will stop the polling
   */
  predicate: ((...args: any[]) => Promise<T | boolean> | T) | T
  /**
   * For how long``wait*` function will wait until it return a rejected promise. Default value is [[Driver.waitTimeout]]
   */
  timeout?: number,
  /**
   *  How periodically `wait*` functions will poll to check given predicate. Default value is [[Driver.waitInterval]]
   */
  interval?: number,
  /**
   * By default waitUntil (and all wait* methods) will reject the promise on timeout. Set this to false so they resolve the promise with false value instead
   */
  rejectOnTimeout?: boolean
}

// export interface WaitForDataOptions extends WaitUntilOptions<string> {
//   /**
//    * predicate a function that if return a truthy value will stop the polling
//    */
//   predicate: ((data: string) => Promise<string | boolean>) | string
// }
