import { expect, test } from 'bun:test'
import zws from '../index'

test('extracts embedded data successfully', () => {
  const textWithData = zws.embed('Hello world', 'secret')
  expect(zws.extract(textWithData)).toBe('secret')
})

test('returns empty string when no embedded data', () => {
  expect(zws.extract('Hello world')).toBe('')
})

test('returns empty string for malformed data', () => {
  const malformedText = 'Hello\u200B\u200Cmalformed\u200C\u200B world'
  expect(zws.extract(malformedText)).toBe('')
})

test('extracts data from text with multiple sentences', () => {
  const textWithData = zws.embed('First sentence. Second sentence.', 'test')
  expect(zws.extract(textWithData)).toBe('test')
})

test('handles empty embedded data', () => {
  const textWithData = zws.embed('Hello', '')
  expect(zws.extract(textWithData)).toBe('')
})

test('returns empty string for empty string', () => {
  expect(zws.extract('')).toBe('')
})

test('throws when embedded payload exceeds MAX_ENCODED_LENGTH', () => {
  // Valid markers with an encoded body too long to decode (1601 > 100 * 16 = 1600)
  const longEncodedData = '\u200B'.repeat(1601)
  const corruptedText = `Hello\u200B\u200C${longEncodedData}\u200C\u200B world`

  expect(() => zws.extract(corruptedText)).toThrow('Encoded data too long')
})
