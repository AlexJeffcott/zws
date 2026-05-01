import { expect, test } from 'bun:test'
import zws from '../index'

test('returns empty array when text has no embedded data', () => {
  expect(zws.extractAll('Hello world')).toEqual([])
})

test('returns empty array for empty string', () => {
  expect(zws.extractAll('')).toEqual([])
})

test('returns single-element array when one embed is present', () => {
  const text = zws.embed('Hello', 'only-one')
  expect(zws.extractAll(text)).toEqual(['only-one'])
})

test('returns each payload when multiple embeds are concatenated', () => {
  const part1 = zws.embed('First', 'data1')
  const part2 = zws.embed('Second', 'data2')
  const part3 = zws.embed('Third', 'data3')
  expect(zws.extractAll(part1 + ' ' + part2 + ' ' + part3)).toEqual([
    'data1',
    'data2',
    'data3',
  ])
})

test('skips malformed marker pairs that do not match the pattern', () => {
  const valid = zws.embed('valid', 'good')
  const malformed = 'noise​‌partial'
  expect(zws.extractAll(valid + ' ' + malformed)).toEqual(['good'])
})

test('throws when an embedded payload exceeds MAX_ENCODED_LENGTH', () => {
  const longEncoded = '​'.repeat(zws.MAX_ENCODED_LENGTH + 1)
  const corrupted = `Hello​‌${longEncoded}‌​ world`
  expect(() => zws.extractAll(corrupted)).toThrow('Encoded data too long')
})
