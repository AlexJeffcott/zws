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

test('skips embed candidate whose length prefix exceeds MAX_DATA_LENGTH', () => {
  // Length prefix of all 1s (= 65535) far exceeds MAX_DATA_LENGTH; treat as not an embed.
  const fakeLengthAndJunk = '\u200C'.repeat(16) + '\u200B'.repeat(50)
  const corruptedText = `Hello\u200B\u200C${fakeLengthAndJunk} world`
  expect(zws.extract(corruptedText)).toBe('')
})

test('skips embed candidate whose length prefix is truncated', () => {
  // START marker present but length prefix is cut short.
  const truncated = `Hello\u200B\u200C${'\u200B'.repeat(8)}`
  expect(zws.extract(truncated)).toBe('')
})

test('skips embed candidate whose payload is truncated', () => {
  // Valid length prefix saying length=5 (40 chars), but only 16 payload chars provided.
  const lengthFive = '\u200B'.repeat(13) + '\u200C\u200B\u200C' // 16-bit value 5
  const shortPayload = '\u200B'.repeat(16)
  const truncated = `Hello\u200B\u200C${lengthFive}${shortPayload}`
  expect(zws.extract(truncated)).toBe('')
})

test('skips embed candidate whose payload region contains non-bit characters', () => {
  // Length prefix says 1 (one char of payload, 16 bits expected), but payload is
  // interrupted by a regular character \u2014 must be treated as not-an-embed.
  const lengthOne = '\u200B'.repeat(15) + '\u200C'
  const corruptedPayload =
    '\u200B\u200B\u200B\u200BX\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B' // 16 chars, but 5th is 'X'
  const text = `\u200B\u200C${lengthOne}${corruptedPayload}`
  expect(zws.extract(text)).toBe('')
})
