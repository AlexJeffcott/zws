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

test('embeds data in text with existing zero-width characters', () => {
  const result = zws.embed(STRINGS.WITH_EXISTING_ZW, 'secret')
  expect(zws.hasEmbeddedData(result)).toBe(true)
  expect(result).toContain(STRINGS.WITH_EXISTING_ZW)
})

test('embeds data in text with RTL marks', () => {
  const result = zws.embed(STRINGS.WITH_RTL, 'secret')
  expect(zws.hasEmbeddedData(result)).toBe(true)
  expect(result).toContain('\u200F')
})

test('embeds data in text with zero-width joiners', () => {
  const result = zws.embed(STRINGS.WITH_ZWJ, 'secret')
  expect(zws.hasEmbeddedData(result)).toBe(true)
  expect(result).toContain('\u200D')
})

test('embeds data in mixed script text', () => {
  const result = zws.embed(STRINGS.MIXED_SCRIPTS, 'secret')
  expect(zws.hasEmbeddedData(result)).toBe(true)
  expect(result).toContain('Hello世界⚕')
})

test('embeds unusual characters as data', () => {
  const result1 = zws.embed('Hello world', MEDICAL_SYMBOL.char)
  const result2 = zws.embed('Hello world', NULL_CHAR.char)
  const result3 = zws.embed('Hello world', HIGH_UNICODE.char)
  const result4 = zws.embed('Hello world', RTL_MARK.char)
  const result5 = zws.embed('Hello world', ZWJ.char)

  expect(zws.hasEmbeddedData(result1)).toBe(true)
  expect(zws.hasEmbeddedData(result2)).toBe(true)
  expect(zws.hasEmbeddedData(result3)).toBe(true)
  expect(zws.hasEmbeddedData(result4)).toBe(true)
  expect(zws.hasEmbeddedData(result5)).toBe(true)
})

test('embeds data in very long text', () => {
  const result = zws.embed(STRINGS.VERY_LONG, 'secret')
  expect(zws.hasEmbeddedData(result)).toBe(true)
  expect(result.length).toBeGreaterThan(STRINGS.VERY_LONG.length)
})

test('embeds data in whitespace-only text', () => {
  const result = zws.embed(STRINGS.ONLY_WHITESPACE, 'secret')
  expect(zws.hasEmbeddedData(result)).toBe(true)
  expect(result).toContain(STRINGS.ONLY_WHITESPACE)
})

test('does not re-embed when text already contains our marker sequence', () => {
  const textWithOurData = zws.embed('Hello world', 'original')
  const attemptReEmbed = zws.embed(textWithOurData, 'new')
  expect(attemptReEmbed).toBe(textWithOurData)
})
