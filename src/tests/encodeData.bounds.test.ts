import { expect, test } from 'bun:test'
import zws from '../index'

test('encodeData throws on data exceeding MAX_DATA_LENGTH', () => {
  const oversized = 'A'.repeat(zws.MAX_DATA_LENGTH + 1)
  expect(() => zws.encodeData(oversized)).toThrow('Data too long')
})

test('encodeData throws on astral code points (emoji)', () => {
  expect(() => zws.encodeData('🏥')).toThrow('Invalid character in data')
})

test('encodeData throws on raw surrogate pairs', () => {
  const surrogate = '𐀀'
  expect(() => zws.encodeData(surrogate)).toThrow('Invalid character in data')
})

test('embed propagates encodeData errors instead of swallowing them', () => {
  const text = 'Standard medical procedure'
  const oversized = 'A'.repeat(zws.MAX_DATA_LENGTH + 1)
  expect(() => zws.embed(text, oversized)).toThrow('Data too long')
})

test('decodeData throws when given more than MAX_ENCODED_LENGTH characters', () => {
  const oversized = '​'.repeat(zws.MAX_ENCODED_LENGTH + 1)
  expect(() => zws.decodeData(oversized)).toThrow('Encoded data too long')
})
