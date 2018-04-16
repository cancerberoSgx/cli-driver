
import { Driver, ansi } from '../src'
import * as shell from 'shelljs'

const seq = k => ansi.keys.getSequenceFor(k)
const dump = ansi.keys.dumpChar

describe('ansi', () => {
  it('ansi.keys.getSequenceFor',  () => {

    // expect(seq({ name: 'a' })).toBe('\u0061')
    // expect(seq({ name: 'a', meta: true })).toBe('\u001b\u0061')
    // expect(seq({ name: 'a', ctrl: true })).toBe('\u0001')
    // expect(seq({ name: 'a', shift: true })).toBe('\u0041')
    // expect(seq({ name: 'a', meta: true, ctrl: true })).toBe('\u001b\u0001')
    // expect(seq({ name: 'a', meta: true, shift: true })).toBe('\u001b\u0041')

    // expect(seq({ name: 'b', meta: true })).toBe('\u001b\u0062')

    // expect(seq({ name: 'b', ctrl: true })).toBe('\u0002')
    // expect(seq({ name: 'b', meta: true })).toBe('\u001b\u0062')
    // expect(seq({ name: 'b', meta: true, ctrl: true })).toBe('\u001b\u0002')

    // expect(seq({ name: 'k' })).toBe('\u006b')
    // expect(seq({ name: 'k', ctrl: true })).toBe('\u000b') // why?? i think because its negative r something

    // expect(seq({ name: 'B' })).toBe('\u0042')
    // expect(seq({ name: 'B', shift: true })).toBe('\u0062')

    // // console.log('mmm' ,seq({ name: 'v', ctrl: true }).charCodeAt(0), '\u0016'.charCodeAt(0))

    // expect(seq({ name: 'v', ctrl: true })).toBe('\u0016') // fails!

    // expect(seq({ name: 'b', shift: true, meta: true })).toBe('\u001b\u0042')
    // expect(seq({ name: 'A', ctrl: true })).toBe('\u0001')

    // expect(seq({ name: '&' })).toBe('&')   // not in the table

    expect(seq({ name: '1' })).toBe('\u0031')
    expect(seq({ name: '2' })).toBe('\u0032')
    expect(seq({ name: '3' })).toBe('\u0033')
    expect(seq({ name: '7' })).toBe('\u0037')
    expect(seq({ name: '9' })).toBe('\u0039')
    expect(seq({ name: '0' })).toBe('\u0030')
    expect(seq({ name: '1', ctrl: true })).toBe('\u0031')
    expect(seq({ name: '2', ctrl: true })).toBe('\u0000')
  })
})
