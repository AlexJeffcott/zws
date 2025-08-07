import { expect, test } from 'bun:test'
import { embed } from '../index'

test('embeds data after first sentence', () => {
  const result = embed('Hello world. How are you?', 'secret')
  expect(result).toMatch(
    /Hello world\.\u200B\u200C.*\u200C\u200B How are you\?/,
  )
})

test('embeds data at end when no sentence found', () => {
  const result = embed('Hello world', 'secret')
  expect(result).toMatch(/Hello world\u200B\u200C.*\u200C\u200B$/)
})

test('returns original text if already has embedded data', () => {
  const textWithData = 'Hello\u200B\u200Cdata\u200C\u200B world'
  const result = embed(textWithData, 'secret')
  expect(result).toBe(textWithData)
})

test('embeds data correctly with multiple sentences', () => {
  const result = embed('First! Second? Third.', 'test')
  expect(result).toMatch(/First!\u200B\u200C.*\u200C\u200B Second\? Third\./)
})

test('handles empty text', () => {
  const result = embed('', 'data')
  expect(result).toMatch(/^\u200B\u200C.*\u200C\u200B$/)
})
