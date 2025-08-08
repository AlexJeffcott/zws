import { expect, test } from 'bun:test'
import zws from '../index'

test('removes embedded data from text', () => {
  const textWithData = zws.embed('Hello world', 'secret')
  expect(zws.getCleanText(textWithData)).toBe('Hello world')
})

test('returns original text when no embedded data', () => {
  const originalText = 'Hello world'
  expect(zws.getCleanText(originalText)).toBe(originalText)
})

test('removes multiple embedded data blocks', () => {
  const text1 = zws.embed('First', 'data1')
  const text2 = zws.embed(text1 + ' Second', 'data2')
  expect(zws.getCleanText(text2)).toBe('First Second')
})

test('handles empty string', () => {
  expect(zws.getCleanText('')).toBe('')
})

test('preserves text structure after cleaning', () => {
  const textWithData = zws.embed('Hello world. How are you?', 'secret')
  expect(zws.getCleanText(textWithData)).toBe('Hello world. How are you?')
})
