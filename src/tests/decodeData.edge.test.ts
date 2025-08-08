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

test('decodes unusual characters correctly', () => {
  expect(zws.decodeData(MEDICAL_SYMBOL.encoded)).toBe(MEDICAL_SYMBOL.char)
  expect(zws.decodeData(NULL_CHAR.encoded)).toBe(NULL_CHAR.char)
  expect(zws.decodeData(HIGH_UNICODE.encoded)).toBe(HIGH_UNICODE.char)
  expect(zws.decodeData(RTL_MARK.encoded)).toBe(RTL_MARK.char)
  expect(zws.decodeData(ZWJ.encoded)).toBe(ZWJ.char)
})

test('round-trip encodes and decodes unusual characters', () => {
  expect(zws.decodeData(zws.encodeData(MEDICAL_SYMBOL.char))).toBe(
    MEDICAL_SYMBOL.char,
  )
  expect(zws.decodeData(zws.encodeData(NULL_CHAR.char))).toBe(NULL_CHAR.char)
  expect(zws.decodeData(zws.encodeData(HIGH_UNICODE.char))).toBe(
    HIGH_UNICODE.char,
  )
  expect(zws.decodeData(zws.encodeData(RTL_MARK.char))).toBe(RTL_MARK.char)
  expect(zws.decodeData(zws.encodeData(ZWJ.char))).toBe(ZWJ.char)
})

test('round-trip encodes and decodes strings with existing zero-width chars', () => {
  expect(zws.decodeData(zws.encodeData(STRINGS.WITH_EXISTING_ZW))).toBe(
    STRINGS.WITH_EXISTING_ZW,
  )
  expect(zws.decodeData(zws.encodeData(STRINGS.WITH_RTL))).toBe(
    STRINGS.WITH_RTL,
  )
  expect(zws.decodeData(zws.encodeData(STRINGS.WITH_ZWJ))).toBe(
    STRINGS.WITH_ZWJ,
  )
})

test('round-trip encodes and decodes mixed script text', () => {
  expect(zws.decodeData(zws.encodeData(STRINGS.MIXED_SCRIPTS))).toBe(
    STRINGS.MIXED_SCRIPTS,
  )
})

test('round-trip encodes and decodes whitespace-only text', () => {
  expect(zws.decodeData(zws.encodeData(STRINGS.ONLY_WHITESPACE))).toBe(
    STRINGS.ONLY_WHITESPACE,
  )
})

test('round-trip encodes and decodes very long text', () => {
  expect(zws.decodeData(zws.encodeData(STRINGS.VERY_LONG))).toBe(
    STRINGS.VERY_LONG,
  )
})

test('handles corrupted encoded data', () => {
  const corruptedData1 = MEDICAL_SYMBOL.encoded.slice(0, -2)
  const corruptedData2 = MEDICAL_SYMBOL.encoded + '\u200B\u200C\u200B'
  const corruptedData3 = MEDICAL_SYMBOL.encoded.replace(/\u200B/g, 'X')

  expect(zws.decodeData(corruptedData1)).toBe('')
  expect(zws.decodeData(corruptedData2)).toBe(MEDICAL_SYMBOL.char)
  expect(zws.decodeData(corruptedData3)).toBe('')
})

test('handles mixed valid and invalid characters in encoded data', () => {
  const mixedData = MEDICAL_SYMBOL.encoded + '\u200F' + HIGH_UNICODE.encoded

  // Should decode valid sequences and skip invalid chars like \u200F
  expect(zws.decodeData(mixedData)).toBe(
    MEDICAL_SYMBOL.char + HIGH_UNICODE.char,
  )
})

test('handles edge case binary patterns', () => {
  const allZeros = '\u200B'.repeat(16)
  const allOnes = '\u200C'.repeat(16)
  const alternating = '\u200B\u200C'.repeat(8)

  expect(zws.decodeData(allZeros)).toBe('\0')
  expect(zws.decodeData(allOnes)).toBe(String.fromCharCode(65535))
  expect(zws.decodeData(alternating)).toBe(
    String.fromCharCode(0b0101010101010101),
  )
})
