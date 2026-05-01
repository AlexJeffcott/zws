import { expect, test } from 'bun:test'
import zws from '../index'

test('appends marker to end of text by default', () => {
  const result = zws.embed('Hello world. How are you?', 'secret')
  expect(result).toMatch(
    /^Hello world\. How are you\?\u200B\u200C.*\u200C\u200B$/,
  )
})

test('embeds at end when no sentence terminator present', () => {
  const result = zws.embed('Hello world', 'secret')
  expect(result).toMatch(/Hello world\u200B\u200C.*\u200C\u200B$/)
})

test('throws when text already contains embedded data', () => {
  const textWithData = 'Hello\u200B\u200Cdata\u200C\u200B world'
  expect(() => zws.embed(textWithData, 'secret')).toThrow(
    'already contains embedded data',
  )
})

test('inserts after first sentence terminator when position option set', () => {
  const result = zws.embed('First! Second? Third.', 'test', {
    position: 'after-first-sentence',
  })
  expect(result).toMatch(/First!\u200B\u200C.*\u200C\u200B Second\? Third\./)
})

test('after-first-sentence falls back to end when no terminator present', () => {
  const result = zws.embed('No terminator here', 'data', {
    position: 'after-first-sentence',
  })
  expect(result).toMatch(/^No terminator here\u200B\u200C.*\u200C\u200B$/)
})

test('handles empty text', () => {
  const result = zws.embed('', 'data')
  expect(result).toMatch(/^\u200B\u200C.*\u200C\u200B$/)
})
