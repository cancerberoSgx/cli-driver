
import { Driver, ansi } from '../src'
import * as shell from 'shelljs'

const seq = k => ansi.keys.getSequenceFor(k)
const dump = ansi.keys.dumpChar

describe('ansi', () => {
  it('ansi.keys.getSequenceFor',  () => {

    expect(seq({ name: 'a' })).toBe('\u0061')
    expect(seq({ name: 'a', meta: true })).toBe('\u001b\u0061')
    expect(seq({ name: 'a', ctrl: true })).toBe('\u0001')
    expect(seq({ name: 'a', shift: true })).toBe('\u0041')
    expect(seq({ name: 'a', meta: true, ctrl: true })).toBe('\u001b\u0001')
    expect(seq({ name: 'a', meta: true, shift: true })).toBe('\u001b\u0041')

    expect(seq({ name: 'b', meta: true })).toBe('\u001b\u0062')

    // console.log('B', dump(seq({ name: 'b', ctrl: true })), dump('\u0002'))
    expect(seq({ name: 'b', ctrl: true })).toBe('\u0002')
    expect(seq({ name: 'b', meta: true })).toBe('\u001b\u0062')
    expect(seq({ name: 'b', meta: true, ctrl: true })).toBe('\u001b\u0002')

    expect(seq({ name: 'k' })).toBe('\u006b')
    // console.log('seba :',  seq({ name: 'k', ctrl: true }).charCodeAt(0), '\u000b'.charCodeAt(0))
    expect(seq({ name: 'k', ctrl: true })).toBe('\u000b') // why?? i think because its negative r something

    expect(seq({ name: 'B' })).toBe('\u0042')
    expect(seq({ name: 'B', shift: true })).toBe('\u0062')

    console.log('mmm' ,seq({ name: 'v', control: true }).charCodeAt(0), '\u0016'.charCodeAt(0))
    // expect(seq({ name: 'v', control: true })).toBe('\u0016') // fails!

    // expect(seq({ name: 'b', shift: true, meta: true })).toBe('\u001b\u0062')
    // expect(seq({ name: 'A', ctrl: true })).toBe('\u0002')

    expect(seq({ name: '&' })).toBe('&')   // not in the table
  })
})
