
/**
 * Return the correct unicode sequence representing given key and control combination. Supports [a-zA-Z0-9] as input characters with any combination of ctrl - meta - shift modifiers. Usage example:
 *
 * ```js
 * getSequenceFor({ name: 'a', meta: true, shift: true })
 * ```
 *
 * TODO: put this in its own project
 * support altgr for example the following is altgr-u y alt-u :
↓ 	226 0342 0xe2
134 0206 0x86
147 0223 0x93

^[u 	 27 0033 0x1b
117 0165 0x75
 */
export function getSequenceFor (key: Key): string  {

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

export interface Key {
  sequence?: string
  name?: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
}

// function dumpChar (a) {
//   let s = ''
//   for (let i = 0;i  < a.length; i++) {
//     s += ' ' + '\\u00' + a.charCodeAt(i).toString(16)
//   }
//   return s
// }
