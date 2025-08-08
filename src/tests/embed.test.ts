import { expect, test } from 'bun:test'
import zws from '../index'

test('embeds data after first sentence', () => {
  const result = zws.embed('Hello world. How are you?', 'secret')
  expect(result).toMatch(
    /Hello world\.\u200B\u200C.*\u200C\u200B How are you\?/,
  )
})

test('embeds data at end when no sentence found', () => {
  const result = zws.embed('Hello world', 'secret')
  expect(result).toMatch(/Hello world\u200B\u200C.*\u200C\u200B$/)
})

test('returns original text if already has embedded data', () => {
  const textWithData = 'Hello\u200B\u200Cdata\u200C\u200B world'
  const result = zws.embed(textWithData, 'secret')
  expect(result).toBe(textWithData)
})

test('embeds data correctly with multiple sentences', () => {
  const result = zws.embed('First! Second? Third.', 'test')
  expect(result).toMatch(/First!\u200B\u200C.*\u200C\u200B Second\? Third\./)
})

test('handles empty text', () => {
  const result = zws.embed('', 'data')
  expect(result).toMatch(/^\u200B\u200C.*\u200C\u200B$/)
})
