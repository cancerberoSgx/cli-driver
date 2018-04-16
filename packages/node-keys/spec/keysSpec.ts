
import { keys } from '../src'

describe('ansi', () => {
  it('keys basics', () => {

    expect(keys({ name: 'a' })).toBe('\u0061')
    expect(keys({ name: 'a', meta: true })).toBe('\u001b\u0061')
    expect(keys({ name: 'a', ctrl: true })).toBe('\u0001')
    expect(keys({ name: 'a', shift: true })).toBe('\u0041')
    expect(keys({ name: 'a', meta: true, ctrl: true })).toBe('\u001b\u0001')
    expect(keys({ name: 'a', meta: true, shift: true })).toBe('\u001b\u0041')

    expect(keys({ name: 'b', meta: true })).toBe('\u001b\u0062')

    expect(keys({ name: 'b', ctrl: true })).toBe('\u0002')
    expect(keys({ name: 'b', meta: true })).toBe('\u001b\u0062')
    expect(keys({ name: 'b', meta: true, ctrl: true })).toBe('\u001b\u0002')

    expect(keys({ name: 'k' })).toBe('\u006b')
    expect(keys({ name: 'k', ctrl: true })).toBe('\u000b')

    expect(keys({ name: 'd', ctrl: true })).toBe('\u0004')
    expect(keys({ name: 'r', ctrl: true })).toBe('\u0012')

    expect(keys({ name: 'B' })).toBe('\u0042')
    expect(keys({ name: 'B', shift: true })).toBe('\u0062')

    expect(keys({ name: 'v', ctrl: true })).toBe('\u0016') // fails!

    expect(keys({ name: 'b', shift: true, meta: true })).toBe('\u001b\u0042')
    expect(keys({ name: 'A', ctrl: true })).toBe('\u0001')

    expect(keys({ name: '&' })).toBe('&')   // not in the table

    expect(keys({ name: '1' })).toBe('\u0031')
    expect(keys({ name: '2' })).toBe('\u0032')
    expect(keys({ name: '3' })).toBe('\u0033')
    expect(keys({ name: '7' })).toBe('\u0037')
    expect(keys({ name: '9' })).toBe('\u0039')
    expect(keys({ name: '0' })).toBe('\u0030')

    expect(keys({ name: '1', ctrl: true })).toBe('\u0031')
    expect(keys({ name: '2', ctrl: true })).toBe('\u0000')

    expect(keys({ name: '6', meta: true })).toBe('\u001b\u0036')
  })
})
