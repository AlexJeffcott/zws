import { expect, test } from 'bun:test'
import { embed, extract } from '../index'

test('extracts embedded data successfully', () => {
  const textWithData = embed('Hello world', 'secret')
  expect(extract(textWithData)).toBe('secret')
})

test('returns empty string when no embedded data', () => {
  expect(extract('Hello world')).toBe('')
})

test('returns empty string for malformed data', () => {
  const malformedText = 'Hello\u200B\u200Cmalformed\u200C\u200B world'
  expect(extract(malformedText)).toBe('')
})

test('extracts data from text with multiple sentences', () => {
  const textWithData = embed('First sentence. Second sentence.', 'test')
  expect(extract(textWithData)).toBe('test')
})

test('handles empty embedded data', () => {
  const textWithData = embed('Hello', '')
  expect(extract(textWithData)).toBe('')
})

test('returns empty string for empty string', () => {
  expect(extract('')).toBe('')
})

test('handles decoding errors gracefully', () => {
  // Create a spy to temporarily mock console.warn to avoid noise in test output
  const originalWarn = console.warn
  const mockWarn = () => {}
  console.warn = mockWarn

  // Create text with valid markers but corrupted encoded data that would cause decodeData to fail
  // This uses an extremely long encoded sequence that exceeds MAX_ENCODED_LENGTH in decodeData
  const longEncodedData = '\u200B'.repeat(801) // Exceeds 50 * 16 = 800 character limit
  const corruptedText = `Hello\u200B\u200C${longEncodedData}\u200C\u200B world`

  expect(extract(corruptedText)).toBe('')

  // Restore original console.warn
  console.warn = originalWarn
})
