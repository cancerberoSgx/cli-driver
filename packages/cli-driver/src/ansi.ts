import * as ansi from 'ansi-escape-sequences'
import { keys } from 'node-keys'

export class Ansi {
  public keys: Keys = new Keys()
  public cursor: ansi.Cursor = ansi.cursor
  public erase: ansi.Erase = ansi.erase
  public style: ansi.Style = ansi.style

  /**
   * A convenience function, applying the provided styles to the input string and then resetting.
   *
   * Inline styling can be applied using the syntax `[style-list]{text to format}`, where `style-list` is a space-separated list of styles from [[style]]. For example `[bold white bg-red]{bold white text on a red background}`.
   *
   * @param str the string to format
   * @param styleArray a list of styles to add to the input string
   * @returns {string}
   * @example
   * > ansi.format('what?', 'green')
   * '\u001b[32mwhat?\u001b[0m'
   *
   * > ansi.format('what?', ['green', 'bold'])
   * '\u001b[32;1mwhat?\u001b[0m'
   *
   * > ansi.format('[green bold]{what?}')
   * '\u001b[32;1mwhat?\u001b[0m'
   */
  public format(str: string, styleArray: Array<string>): string {
    return ansi.format.apply(this, arguments)
  }
  /**
   * Returns an ansi sequence setting one or more effects
   * @example
   * > ansi.styles('green')
   * '\u001b[32m'
   *
   * > ansi.styles([ 'green', 'underline' ])
   * '\u001b[32;4m'
   */
  public styles(effectArray: string | Array<string>): string {
    return ansi.format.apply(this, arguments)
  }
}

export class Keys {
  public tab(): string {
    return '\u0009'
  }
  public return(): string {
    return '\r'
  }
  public backspace(): string {
    return '\x08' // 0x7f
  }
  public escape(): string {
    return '\u001b'
  }

  /**
   * Return the correct unicode sequence representing given key and control combination. Usage example:
   *
   * ```js
   * await driver.write(getSequenceFor({ name: 'a', meta: true, shift: true }))
   * ```
   *
   */
  getSequenceFor = keys
}
