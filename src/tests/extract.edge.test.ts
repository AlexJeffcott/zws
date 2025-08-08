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

test('extracts data from text with existing zero-width characters', () => {
  const textWithData = zws.embed(STRINGS.WITH_EXISTING_ZW, 'secret')
  expect(zws.extract(textWithData)).toBe('secret')
})

test('extracts data from text with RTL marks', () => {
  const textWithData = zws.embed(STRINGS.WITH_RTL, 'secret')
  expect(zws.extract(textWithData)).toBe('secret')
})

test('extracts data from text with zero-width joiners', () => {
  const textWithData = zws.embed(STRINGS.WITH_ZWJ, 'secret')
  expect(zws.extract(textWithData)).toBe('secret')
})

test('extracts data from mixed script text', () => {
  const textWithData = zws.embed(STRINGS.MIXED_SCRIPTS, 'secret')
  expect(zws.extract(textWithData)).toBe('secret')
})

test('extracts unusual characters as data', () => {
  const text1 = zws.embed('Hello world', MEDICAL_SYMBOL.char)
  const text2 = zws.embed('Hello world', NULL_CHAR.char)
  const text3 = zws.embed('Hello world', HIGH_UNICODE.char)
  const text4 = zws.embed('Hello world', RTL_MARK.char)
  const text5 = zws.embed('Hello world', ZWJ.char)

  expect(zws.extract(text1)).toBe(MEDICAL_SYMBOL.char)
  expect(zws.extract(text2)).toBe(NULL_CHAR.char)
  expect(zws.extract(text3)).toBe(HIGH_UNICODE.char)
  expect(zws.extract(text4)).toBe(RTL_MARK.char)
  expect(zws.extract(text5)).toBe(ZWJ.char)
})

test('extracts data from very long text', () => {
  const textWithData = zws.embed(STRINGS.VERY_LONG, 'secret')
  expect(zws.extract(textWithData)).toBe('secret')
})

test('returns empty string for text with only legitimate zero-width chars', () => {
  expect(zws.extract(STRINGS.WITH_EXISTING_ZW)).toBe('')
  expect(zws.extract(STRINGS.WITH_RTL)).toBe('')
  expect(zws.extract(STRINGS.WITH_ZWJ)).toBe('')
})

test('handles malformed embedded data gracefully', () => {
  const malformedText1 = 'Hello\u200B\u200Cmalformed\u200B world'
  const malformedText2 = 'Hello\u200B\u200Cpartial'
  const malformedText3 = 'Hello\u200B\u200C\u200D\u200C\u200B world'

  expect(zws.extract(malformedText1)).toBe('')
  expect(zws.extract(malformedText2)).toBe('')
  expect(zws.extract(malformedText3)).toBe('')
})

test('handles text with multiple embedded sequences', () => {
  const text1 = zws.embed('First', 'data1')
  const combinedText = text1 + ' ' + zws.embed('Second', 'data2')

  const extracted = zws.extract(combinedText)
  expect(extracted).toBe('data1')
})
