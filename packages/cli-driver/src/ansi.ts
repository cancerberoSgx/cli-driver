
import * as ansi from 'ansi-escape-sequences'
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants'

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
    // return '\u001B\u0009'
    return '\u0009'
  }
  public enter (): string {
    return '\r'
  }
  public backspace (): string {
    return '\x08' // 0x7f
  }
  /**
   * Usage example:
   * ```js
   * getSequenceFor('p', true, false, false)
   * ```
   */
  getSequenceFor = getSequenceFor

  dumpChar = dumpChar
}

function dumpChar (a) {
  let s = ''
  for (let i = 0;i  < a.length; i++) {
    s += ' ' + '\\u00' + a.charCodeAt(i).toString(16)
  }
  return s
}

function sum (a: string, hex: number): string {
  return String.fromCharCode(a.charCodeAt(0) + hex)
}

let controlDigits = { '1': '\u0031', '2': '\u0000', '3': '\u001b', '4': '\u001c', '5': '\u001d', '6': '\u001e', '7': '\u001f', '8': '\u007f', '9': '\u0039' }

function ctrl (a): string {
  if (a.match(/[0-9]/)) {
    return controlDigits[a]
  } else {
    return sum(a, 0x60 * -1)
  }
}
function shift (a): string   {
  return a.match(/[a-z]/) ? sum(a, 0x20 * -1) : sum(a, 0x20)
}

function getSequenceFor (key: Key): string  {

  key.ctrl = key.ctrl || false
  key.meta = key.meta || false
  key.shift = key.shift || false
  if (!key.name.match(/[a-zA-z0-9]/)) { // not supported
    return key.name
  }

  debugger
  if (key.name.match(/[a-zA-Z0-9]/) && !key.ctrl && !key.meta && !key.shift) {
    return key.name
  }

  if (key.name.match(/[A-Z]/)) {
    key.name = key.name.toLowerCase()
    key.shift = !key.shift
  }

  if (!key.ctrl && !key.meta && !key.shift) {
    return key.name
  }
  if (key.name.match(/[a-z0-9]/)) {
    if (key.meta && !key.ctrl && !key.shift) {
      return '\u001b' + key.name
    }

    if (!key.meta && key.ctrl) {
      let value = ctrl(key.name)
      return value
    }
    if (key.meta && key.ctrl) { // ctrl == ctrl+shift
      return '\u001b' + ctrl(key.name)
    }
    if (!key.meta && !key.ctrl && key.shift) {
      return shift(key.name)
    }
    if (key.meta && key.shift) {
      return '\u001b' + shift(key.name)
    }
  }
}

export interface Key {
  sequence?: string
  name?: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
}
