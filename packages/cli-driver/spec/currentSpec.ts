// this is the spec in which we are working right now

import { Driver, ansi } from '../src'
import * as shell from 'shelljs'

const seq = k => ansi.keys.getSequenceFor(k)
describe('ansi', () => {
  it('ansi.keys.getSequenceFor', () => {

    expect(seq({ name: 'a' })).toBe('\u0061')
    expect(seq({ name: 'a', meta: true })).toBeDefined()
    expect(seq({ name: 'a', meta: true })).toBe('\u001b\u0061')
    expect(seq({ name: 'a', ctrl: true })).toBeDefined()
    expect(seq({ name: 'a', ctrl: true })).toBe('\u0001')
    expect(seq({ name: 'a', meta: false, ctrl: true  })).toBeDefined()
    expect(seq({ name: 'a', meta: false, ctrl: true })).toBe('\u0001')
    expect(seq({ name: 'a', meta: true, ctrl: true  })).toBeDefined()
    expect(seq({ name: 'a', meta: true, ctrl: true })).toBe('\u001b\u0001')
    expect(seq({ name: 'a', meta: true, shift: true  })).toBeDefined()
    expect(seq({ name: 'a', meta: true, shift: true })).toBe('\u001b\u0041')
    expect(seq({ name: 'A'  })).toBeDefined()
    expect(seq({ name: 'A' })).toBe('\u0041')
    expect(seq({ name: 'A', shift: true  })).toBeDefined()
    expect(seq({ name: 'A', shift: true })).toBe('a')
    expect(seq({ name: 'A', shift: true, meta: true  })).toBeDefined()
    expect(seq({ name: 'A', shift: true, meta: true })).toBe('\u001b\u0061')
    expect(seq({ name: 'A', ctrl: true })).toBeDefined()
    expect(seq({ name: 'A', ctrl: true })).toBe('\u0001')

    expect(seq({ name: '&' })).toBe('&') // not in the table
  })
})
