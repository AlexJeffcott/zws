import { expect, test } from 'bun:test'
import zws from '../index'
import { STRINGS } from './testConstants'

test('preserves existing legitimate zero-width characters', () => {
  const cleanText1 = zws.getCleanText(STRINGS.WITH_EXISTING_ZW)
  const cleanText2 = zws.getCleanText(STRINGS.WITH_RTL)
  const cleanText3 = zws.getCleanText(STRINGS.WITH_ZWJ)

  expect(cleanText1).toBe(STRINGS.WITH_EXISTING_ZW)
  expect(cleanText2).toBe(STRINGS.WITH_RTL)
  expect(cleanText3).toBe(STRINGS.WITH_ZWJ)
  expect(cleanText1).toContain('\u200B')
  expect(cleanText2).toContain('\u200F')
  expect(cleanText3).toContain('\u200D')
})

test('removes only our embedded data from mixed content', () => {
  const textWithBoth = zws.embed(STRINGS.WITH_EXISTING_ZW, 'secret')
  const cleaned = zws.getCleanText(textWithBoth)

  expect(cleaned).toBe(STRINGS.WITH_EXISTING_ZW)
  expect(cleaned).toContain('\u200B')
  expect(cleaned).not.toMatch(/\u200B\u200C.*\u200C\u200B/)
})

test('handles mixed script text with embedded data', () => {
  const textWithData = zws.embed(STRINGS.MIXED_SCRIPTS, 'secret')
  const cleaned = zws.getCleanText(textWithData)

  expect(cleaned).toBe(STRINGS.MIXED_SCRIPTS)
  expect(cleaned).toContain('Hello世界⚕')
})

test('handles very long text with embedded data', () => {
  const textWithData = zws.embed(STRINGS.VERY_LONG, 'secret')
  const cleaned = zws.getCleanText(textWithData)

  expect(cleaned).toBe(STRINGS.VERY_LONG)
  expect(cleaned.length).toBe(100)
})

test('handles whitespace-only text with embedded data', () => {
  const textWithData = zws.embed(STRINGS.ONLY_WHITESPACE, 'secret')
  const cleaned = zws.getCleanText(textWithData)

  expect(cleaned).toBe(STRINGS.ONLY_WHITESPACE)
})

test('removes multiple embedded data blocks while preserving legitimate chars', () => {
  let text = STRINGS.WITH_RTL as any
  text = zws.embed(text, 'data1')
  text = text + STRINGS.WITH_ZWJ
  text = zws.embed(text, 'data2')

  const cleaned = zws.getCleanText(text)
  expect(cleaned).toContain('\u200F')
  expect(cleaned).toContain('\u200D')
  expect(cleaned).not.toMatch(/\u200B\u200C.*\u200C\u200B/)
})

test('handles text with partial marker sequences mixed with legitimate chars', () => {
  const textWithMixed = 'Hello\u200B\u200Fworld\u200Dtest'
  const cleaned = zws.getCleanText(textWithMixed)

  expect(cleaned).toBe(textWithMixed)
  expect(cleaned).toContain('\u200B')
  expect(cleaned).toContain('\u200F')
  expect(cleaned).toContain('\u200D')
})
