import { expect, test } from 'bun:test'
import { embed, getCleanText } from '../index'

test('removes embedded data from text', () => {
  const textWithData = embed('Hello world', 'secret')
  expect(getCleanText(textWithData)).toBe('Hello world')
})

test('returns original text when no embedded data', () => {
  const originalText = 'Hello world'
  expect(getCleanText(originalText)).toBe(originalText)
})

test('removes multiple embedded data blocks', () => {
  const text1 = embed('First', 'data1')
  const text2 = embed(text1 + ' Second', 'data2')
  expect(getCleanText(text2)).toBe('First Second')
})

test('handles empty string', () => {
  expect(getCleanText('')).toBe('')
})

test('preserves text structure after cleaning', () => {
  const textWithData = embed('Hello world. How are you?', 'secret')
  expect(getCleanText(textWithData)).toBe('Hello world. How are you?')
})
