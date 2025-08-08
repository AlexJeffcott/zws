import { expect, test } from 'bun:test'
import zws from '../index'
import {
  HIGH_UNICODE,
  MEDICAL_SYMBOL,
  NULL_CHAR,
  RTL_MARK,
  STRINGS,
  ZWJ,
} from './testConstants'

test('encodes unusual characters correctly', () => {
  expect(zws.encodeData(MEDICAL_SYMBOL.char)).toBe(MEDICAL_SYMBOL.encoded)
  expect(zws.encodeData(NULL_CHAR.char)).toBe(NULL_CHAR.encoded)
  expect(zws.encodeData(HIGH_UNICODE.char)).toBe(HIGH_UNICODE.encoded)
  expect(zws.encodeData(RTL_MARK.char)).toBe(RTL_MARK.encoded)
  expect(zws.encodeData(ZWJ.char)).toBe(ZWJ.encoded)
})

test('encodes strings with existing zero-width characters', () => {
  const encoded1 = zws.encodeData(STRINGS.WITH_EXISTING_ZW)
  const encoded2 = zws.encodeData(STRINGS.WITH_RTL)
  const encoded3 = zws.encodeData(STRINGS.WITH_ZWJ)

  expect(encoded1).toMatch(/^[\u200B\u200C]+$/)
  expect(encoded2).toMatch(/^[\u200B\u200C]+$/)
  expect(encoded3).toMatch(/^[\u200B\u200C]+$/)

  expect(encoded1.length).toBe(STRINGS.WITH_EXISTING_ZW.length * 16)
  expect(encoded2.length).toBe(STRINGS.WITH_RTL.length * 16)
  expect(encoded3.length).toBe(STRINGS.WITH_ZWJ.length * 16)
})

test('encodes mixed script text', () => {
  const encoded = zws.encodeData(STRINGS.MIXED_SCRIPTS)

  expect(encoded).toMatch(/^[\u200B\u200C]+$/)
  expect(encoded.length).toBe(STRINGS.MIXED_SCRIPTS.length * 16)
})

test('encodes whitespace-only text', () => {
  const encoded = zws.encodeData(STRINGS.ONLY_WHITESPACE)

  expect(encoded).toMatch(/^[\u200B\u200C]+$/)
  expect(encoded.length).toBe(STRINGS.ONLY_WHITESPACE.length * 16)
})

test('encodes very long text efficiently', () => {
  const encoded = zws.encodeData(STRINGS.VERY_LONG)

  expect(encoded).toMatch(/^[\u200B\u200C]+$/)
  expect(encoded.length).toBe(STRINGS.VERY_LONG.length * 16)
  expect(encoded.length).toBe(1600)
})

test('encodes text with control characters', () => {
  const controlText = 'Hello\t\n\r world'
  const encoded = zws.encodeData(controlText)

  expect(encoded).toMatch(/^[\u200B\u200C]+$/)
  expect(encoded.length).toBe(controlText.length * 16)
})

test('encodes high Unicode values correctly', () => {
  const encoded = zws.encodeData(HIGH_UNICODE.char)

  expect(encoded).toBe(HIGH_UNICODE.encoded)
  expect(encoded.length).toBe(16)
  expect(encoded.startsWith('\u200C')).toBe(true)
})

test('encodes null character correctly', () => {
  const encoded = zws.encodeData(NULL_CHAR.char)

  expect(encoded).toBe(NULL_CHAR.encoded)
  expect(encoded).toBe('\u200B'.repeat(16))
})
