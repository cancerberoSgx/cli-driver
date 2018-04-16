
/**
 * Return the correct unicode sequence representing given key and control combination. Supports [a-zA-Z0-9] as input characters with any combination of ctrl - meta - shift modifiers. Usage example:
 *
 * ```js
 * key({ name: 'a', meta: true, shift: true })
 * ```
 *
 */
export const keys = getSequenceFor // in the future this funciton will accept more high level (string-baesd) API

export function getSequenceFor (key: Key): string {

  key.ctrl = key.ctrl || false
  key.meta = key.meta || false
  key.shift = key.shift || false

  let arrow = dispatchArrows(key)
  if (arrow) {
    return arrow
  }
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
function shift (a): string {
  return a.match(/[a-z]/) ? sum(a, 0x20 * -1) : sum(a, 0x20)
}

export interface Key {
  sequence?: string
  name?: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
}

export const CURSOR_UP: string = 'cursor-up'
export const CURSOR_DOWN: string = 'cursor-down'
export const TAB: string = '\u0009'
function dispatchArrows (key: Key) {
  if (key.name === CURSOR_UP) {
    if (!key.ctrl && !key.meta && !key.shift) {
      return cursors.up.alone
    }
    // ... TODO
  }
  if (key.name === CURSOR_DOWN) {
    if (!key.ctrl && !key.meta && !key.shift) {
      return cursors.down.alone
    } else if (key.ctrl && !key.meta && !key.shift) {
      return cursors.down.ctrl
    }
    // ... TODO
  }
  // ... TODO
}
const cursors = {
  // up down forward back

  up: {
    alone: '\u001b\u005b\u0041',
    ctrl: '\u001b\u005b\u0031\u003b\u0035\u0041',
    alt: '\u001b\u005b\u0031\u003b\u0033\u0041'
  },
  down: {
    alone: '\u001b\u005b\u0042',
    ctrl: '\u001b\u005b\u0031\u003b\u0035\u0042'
  }

}

// alt-tab: - \u001b\u0009
// shft tab:
// 0x1b
//  	 91 0133 0x5b
//  	 90 0132 0x5a

// control tab igual q tab normal
/*
arrows

    right :
    0x1b
 	 91 0133 0x5b
 	 67 0103 0x43

    bottom:
0x1b
 	 91 0133 0x5b
 	 66 0102 0x42

    left
     0x1b
 	 91 0133 0x5b
 	 68 0104 0x44

    up
 0x1b
 	 91 0133 0x5b
 	 65 0101 0x41

control arrow:

control down
0033 0x1b
 	 91 0133 0x5b
 	 49 0061 0x31
 	 59 0073 0x3b
 	 53 0065 0x35
 	 66 0102 0x42

    control right
    27 0033 0x1b
 	 91 0133 0x5b
 	 49 0061 0x31
 	 59 0073 0x3b
 	 53 0065 0x35
    67 0103 0x43

    control left

     27 0033 0x1b
 	 91 0133 0x5b
 	 49 0061 0x31
 	 59 0073 0x3b
 	 53 0065 0x35
 	 68 0104 0x44

    control up
    7 0033 0x1b
 	 91 0133 0x5b
 	 49 0061 0x31
 	 59 0073 0x3b
 	 53 0065 0x35
 	 65 0101 0x41

    alt arrow:
0x1b
 	 91 0133 0x5b
 	 49 0061 0x31
 	 59 0073 0x3b
 	 51 0063 0x33
 	 65 0101 0x41
*/
