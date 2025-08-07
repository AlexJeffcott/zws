import { expect, test } from 'bun:test'
import { encodeData } from '../index'
import { A, EXCLAMATION, H, I, SPACE, ZERO } from './testConstants'

test('encodes characters correctly', () => {
  expect(encodeData(A.char)).toBe(A.encoded)
  expect(encodeData(H.char)).toBe(H.encoded)
  expect(encodeData(I.char)).toBe(I.encoded)
  expect(encodeData(SPACE.char)).toBe(SPACE.encoded)
  expect(encodeData(EXCLAMATION.char)).toBe(EXCLAMATION.encoded)
  expect(encodeData(ZERO.char)).toBe(ZERO.encoded)
})

test('encodes multiple characters', () => {
  const result = encodeData('Hi')
  expect(result).toBe(H.encoded + I.encoded)
  expect(result).toHaveLength(32)
})

test('encodes empty string', () => {
  const result = encodeData('')
  expect(result).toBe('')
})

test('encoded output uses only zero-width characters', () => {
  expect(encodeData(A.char)).toMatch(/^[\u200B\u200C]+$/)
  expect(encodeData(EXCLAMATION.char)).toMatch(/^[\u200B\u200C]+$/)
})
