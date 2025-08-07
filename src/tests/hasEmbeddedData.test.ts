import { expect, test } from 'bun:test'
import { hasEmbeddedData } from '../index'

test('returns false for text without embedded data', () => {
  expect(hasEmbeddedData('Hello world')).toBe(false)
})

test('returns true for text with embedded data', () => {
  const textWithData = 'Hello\u200B\u200C\u200B\u200C\u200B world'
  expect(hasEmbeddedData(textWithData)).toBe(true)
})

test('returns false for empty string', () => {
  expect(hasEmbeddedData('')).toBe(false)
})

test('returns true when start marker is at beginning', () => {
  const textWithData = '\u200B\u200CHello world'
  expect(hasEmbeddedData(textWithData)).toBe(true)
})

test('returns true when start marker is at end', () => {
  const textWithData = 'Hello world\u200B\u200C'
  expect(hasEmbeddedData(textWithData)).toBe(true)
})
