import { expect, test } from 'bun:test'
import zws from '../index'
import { A, EXCLAMATION, H, I, SPACE, ZERO } from './testConstants'

test('encodes characters correctly', () => {
  expect(zws.encodeData(A.char)).toBe(A.encoded)
  expect(zws.encodeData(H.char)).toBe(H.encoded)
  expect(zws.encodeData(I.char)).toBe(I.encoded)
  expect(zws.encodeData(SPACE.char)).toBe(SPACE.encoded)
  expect(zws.encodeData(EXCLAMATION.char)).toBe(EXCLAMATION.encoded)
  expect(zws.encodeData(ZERO.char)).toBe(ZERO.encoded)
})

test('encodes multiple characters', () => {
  const result = zws.encodeData('Hi')
  expect(result).toBe(H.encoded + I.encoded)
  expect(result).toHaveLength(32)
})

test('encodes empty string', () => {
  const result = zws.encodeData('')
  expect(result).toBe('')
})

test('encoded output uses only zero-width characters', () => {
  expect(zws.encodeData(A.char)).toMatch(/^[\u200B\u200C]+$/)
  expect(zws.encodeData(EXCLAMATION.char)).toMatch(/^[\u200B\u200C]+$/)
})
