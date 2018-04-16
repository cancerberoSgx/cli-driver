
import * as ansi from 'ansi-escape-sequences'
import { table } from './ansiSequenceKeyRelation'

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
  public format (str: string, styleArray: Array<string>): string {
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
  public styles (effectArray: string | Array<string>): string {
    return ansi.format.apply(this, arguments)
  }
}

export class Keys {
  public tab (): string {
    return '\u001B\u0009'
  }
  public enter (): string {
    return '\r'
  }
  public backspace (): string {
    return '\x08'
  }
  /**
   * Usage example:
   * ```js
   * getSequenceFor('p', true, false, false)
   * ```
   */
  getSequenceFor (key: Key): string {
    key.ctrl = key.ctrl || false
    key.meta = key.meta || false
    key.shift = key.shift || false

    let postfix: any
    let result: Key = table.find(k => {
      return k.name === key.name && k.ctrl === key.ctrl && k.meta === key.meta && k.shift === key.shift
    })
    if (result) {
      return result.sequence
    }
    function ctrl (a) {
      return String.fromCharCode(a - 60)
    }
    function shift (a) {
      return a.match(/[a-z]/) ? String.fromCharCode(a - 20) : String.fromCharCode(a + 20)
    }
    postfix = this.getSequenceFor({ name: key.name })
    if (!postfix || !key.ctrl && !key.meta && !key.shift) {
      return key.name
    }
    if (key.name.match(/[a-z]/) && postfix) {
      if (key.meta && !key.ctrl && !key.shift) {
        return '\u001b' + postfix
      }
      if (!key.meta && key.ctrl && !key.shift) {
        return ctrl(key.name)
      }
      if (key.meta && key.ctrl) { // ctrl == ctrl+shift
        // console.log('hoooooola', key.name, parseInt(ctrl(key.name),)
        return '\u001b' + ctrl(key.name)
      }
      if (!key.meta && !key.ctrl && key.shift) {
        return shift(key.name)
      }
      if (key.meta && key.shift) {
        return '\u001b' + shift(key.name)
      }
    }
    // if (key.name.match(/[a-z]/i) && postfix) {
    //   if (key.meta && !key.ctrl && !key.shift) {
    //     return '\u001b' + postfix
    //   }
    // }

    // if (result) {
    //   return result.sequence
    // } else
    // else if (key.meta && !key.ctrl && !key.shift && (postfix = this.getSequenceFor({ name: key.name }))) {
    //   return '\u001b' + postfix
    // } else if (key.meta && key.ctrl && !key.shift && key.name.match(/[a-z]i/) && (postfix = this.getSequenceFor({ name: key.name, ctrl: true }))) {
    //   return '\u001b' + postfix
    // } else if (key.name.match(/[0-9]i/) && (postfix = this.getSequenceFor({ name: key.name, ctrl: true }))) {
    //   let hex = parseInt(new Number(key.sequence.charCodeAt(0)).toString(16), 16)
    //   if (key.shift && !key.meta && !key.ctrl) {
    //     return String.fromCharCode(hex - 16)
    //   }
    // }
  }
}

export interface Key {
  sequence?: string
  name?: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
}
