import { Driver } from './driver'
import { Ansi } from './ansi'

/**
 * This is what's returned when  you require() or import 'cli-driver'. This is the entry point.
 */
export interface Main {
  /**
   * [[IDriver]]
   */
  Driver: typeof Driver

  /**
   * contains constants for keys, colors, styles, and utilities related to ansi escape sequences.
   */
  ansi: Ansi
}

const ansi = new Ansi()
export { Driver, ansi }
export { InteractionHelper, InteractionSpecHelper } from './interactionHelper'
