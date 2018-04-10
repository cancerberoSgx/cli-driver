import { Driver as Driver } from './driver'
import * as ansi from 'ansi-escape-sequences'
import { DriverOptions, DriverData, DriverDump } from './interfaces'

/**
 * This is what's returned when  you require() or import 'cli-driver'. This is the entry point.
 */
export interface Main {
  /**
   * [[IDriver]]
   */
  Driver: typeof Driver

  /**
   * contains constants for keys, colors, styles, and utilities related to ansi escape sequences. Example:
   * ```js
   * TODO: ctrl-r search history
   * ```
   */
  ansi: typeof ansi

}

export { Driver, ansi }
