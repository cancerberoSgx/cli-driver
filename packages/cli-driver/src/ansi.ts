
import * as ansi from 'ansi-escape-sequences'
import { table } from './ansiSequenceKeyRelation'
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
  // String.fromCharCode(parseInt('a'.charCodeAt(0), 16) - 0x60))
  // let val = parseInt(a.charCodeAt(0).toString(16), 10) + dec
  // if (val < 0) {debugger
  //   val = val * -1

  // }

  // // 6b - x = 0b => -x = 0b - 6b => x = -0b + 6b
  // return String.fromCharCode(parseInt(val + '', 16))
  // // TODO: for sure there must be a better way of doing this!

}
function ctrl (a): string {
  return sum(a, 0x60 * -1)
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

  if (key.name.match(/[a-zA-Z0-9]/) && !key.ctrl && !key.meta && !key.shift) {
    return key.name
  }
  
  if (key.name.match(/[A-Z]/)) {
    key.name = key.name.toLowerCase()
    key.shift = !key.shift
  }

  // String.fromCharCode(parseInt(61, 16))

  let postfix: any
  let result: Key = table.find(k => {
    return k.name === key.name && k.ctrl === key.ctrl && k.meta === key.meta && k.shift === key.shift
  })
  if (result) {
    return result.sequence
  }

  postfix = getSequenceFor({ name: key.name })
  if (!postfix || !key.ctrl && !key.meta && !key.shift) {
    return key.name
  }
  if (key.name.match(/[a-z]/) && postfix) {
    if (key.meta && !key.ctrl && !key.shift) {
      return '\u001b' + postfix
    }
    if (!key.meta && key.ctrl) {
      let value = ctrl(key.name)
      return value
    }
    if (key.meta && key.ctrl) { // ctrl == ctrl+shift
      console.log('program meta y control', key.name, dumpChar(ctrl(key.name)))
      return '\u001b' + ctrl(key.name)
    }
    if (!key.meta && !key.ctrl && key.shift) {
      return shift(key.name)
    }
    if (key.meta && key.shift) {
      console.log('program meta y shift', key.name, dumpChar(shift(key.name)))
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
