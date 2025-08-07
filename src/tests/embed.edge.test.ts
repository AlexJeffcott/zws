import { expect, test } from 'bun:test'
import { embed, hasEmbeddedData } from '../index'
import {
  HIGH_UNICODE,
  MEDICAL_SYMBOL,
  NULL_CHAR,
  RTL_MARK,
  STRINGS,
  ZWJ,
} from './testConstants'

test('embeds data in text with existing zero-width characters', () => {
  const result = embed(STRINGS.WITH_EXISTING_ZW, 'secret')
  expect(hasEmbeddedData(result)).toBe(true)
  expect(result).toContain(STRINGS.WITH_EXISTING_ZW)
})

test('embeds data in text with RTL marks', () => {
  const result = embed(STRINGS.WITH_RTL, 'secret')
  expect(hasEmbeddedData(result)).toBe(true)
  expect(result).toContain('\u200F')
})

test('embeds data in text with zero-width joiners', () => {
  const result = embed(STRINGS.WITH_ZWJ, 'secret')
  expect(hasEmbeddedData(result)).toBe(true)
  expect(result).toContain('\u200D')
})

test('embeds data in mixed script text', () => {
  const result = embed(STRINGS.MIXED_SCRIPTS, 'secret')
  expect(hasEmbeddedData(result)).toBe(true)
  expect(result).toContain('Hello世界⚕')
})

test('embeds unusual characters as data', () => {
  const result1 = embed('Hello world', MEDICAL_SYMBOL.char)
  const result2 = embed('Hello world', NULL_CHAR.char)
  const result3 = embed('Hello world', HIGH_UNICODE.char)
  const result4 = embed('Hello world', RTL_MARK.char)
  const result5 = embed('Hello world', ZWJ.char)

  expect(hasEmbeddedData(result1)).toBe(true)
  expect(hasEmbeddedData(result2)).toBe(true)
  expect(hasEmbeddedData(result3)).toBe(true)
  expect(hasEmbeddedData(result4)).toBe(true)
  expect(hasEmbeddedData(result5)).toBe(true)
})

test('embeds data in very long text', () => {
  const result = embed(STRINGS.VERY_LONG, 'secret')
  expect(hasEmbeddedData(result)).toBe(true)
  expect(result.length).toBeGreaterThan(STRINGS.VERY_LONG.length)
})

test('embeds data in whitespace-only text', () => {
  const result = embed(STRINGS.ONLY_WHITESPACE, 'secret')
  expect(hasEmbeddedData(result)).toBe(true)
  expect(result).toContain(STRINGS.ONLY_WHITESPACE)
})

test('does not re-embed when text already contains our marker sequence', () => {
  const textWithOurData = embed('Hello world', 'original')
  const attemptReEmbed = embed(textWithOurData, 'new')
  expect(attemptReEmbed).toBe(textWithOurData)
})
