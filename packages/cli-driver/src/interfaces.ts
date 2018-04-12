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
  notSilent?: boolean
}
