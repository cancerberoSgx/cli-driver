import { Ansi } from './ansi'
import { Driver } from './driver'

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

export const ansi = new Ansi()

export * from './inquirerInteractionHelper'
export * from './interactionHelper'
export * from './interactionSpecHelper'
export { Driver }

