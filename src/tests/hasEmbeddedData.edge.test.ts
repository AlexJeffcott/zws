import { expect, test } from 'bun:test'
import zws from '../index'
import { STRINGS } from './testConstants'

test('handles text with existing zero-width characters', () => {
  expect(zws.hasEmbeddedData(STRINGS.WITH_EXISTING_ZW)).toBe(false)
  expect(zws.hasEmbeddedData(STRINGS.WITH_RTL)).toBe(false)
  expect(zws.hasEmbeddedData(STRINGS.WITH_ZWJ)).toBe(false)
})

test('handles mixed script text', () => {
  expect(zws.hasEmbeddedData(STRINGS.MIXED_SCRIPTS)).toBe(false)
})

test('handles whitespace-only text', () => {
  expect(zws.hasEmbeddedData(STRINGS.ONLY_WHITESPACE)).toBe(false)
})

test('handles very long text', () => {
  expect(zws.hasEmbeddedData(STRINGS.VERY_LONG)).toBe(false)
})

test('distinguishes our markers from similar zero-width chars', () => {
  const textWithSimilarChars = 'Hello\u200D\u200Fworld'
  const textWithOurMarker = 'Hello\u200B\u200Cworld'

  expect(zws.hasEmbeddedData(textWithSimilarChars)).toBe(false)
  expect(zws.hasEmbeddedData(textWithOurMarker)).toBe(true)
})

test('handles text with partial marker sequences', () => {
  expect(zws.hasEmbeddedData('Hello\u200Bworld')).toBe(false)
  expect(zws.hasEmbeddedData('Hello\u200Cworld')).toBe(false)
  expect(zws.hasEmbeddedData('Hello\u200C\u200Bworld')).toBe(false)
})
