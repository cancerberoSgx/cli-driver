
import { Driver, ansi } from '../../src'
import * as shell from 'shelljs'

const seq = k => ansi.keys.getSequenceFor(k)
const dump = ansi.keys.dumpChar

function print (a) {

}
describe('ansi', () => {
  it('ansi.keys.getSequenceFor',  () => {
    expect(seq({ name: 'a' })).toBe('\u0061')
    expect(seq({ name: 'a', meta: true })).toBe('\u001b\u0061')
    expect(seq({ name: 'a', ctrl: true })).toBe('\u0001')
    expect(seq({ name: 'a',shift: true })).toBe('\u0041')

    expect(seq({ name: 'a', meta: true, ctrl: true })).toBe('\u001b\u0001')

    expect(seq({ name: 'a', meta: true, shift: true })).toBe('\u001b\u0041')

    // expect(seq({ name: 'A' })).toBe('\u0041')
    // expect(seq({ name: 'A', shift: true })).toBe('a')
    // expect(seq({ name: 'A', shift: true, meta: true })).toBe('\u001b\u0061')
    // expect(seq({ name: 'A', ctrl: true })).toBe('\u0001')

    // expect(seq({ name: '&' })).toBe('&') // not in the table
  })
})
