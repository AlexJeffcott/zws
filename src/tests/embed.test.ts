import { expect, test } from 'bun:test'
import zws from '../index'

test('appends marker to end of text by default', () => {
  const result = zws.embed('Hello world. How are you?', 'secret')
  expect(result).toMatch(/^Hello world\. How are you\?​‌[​‌]+$/)
  expect(zws.extract(result)).toBe('secret')
})

test('embeds at end when no sentence terminator present', () => {
  const result = zws.embed('Hello world', 'secret')
  expect(result).toMatch(/^Hello world​‌[​‌]+$/)
  expect(zws.extract(result)).toBe('secret')
})

test('throws when text already contains embedded data', () => {
  const textWithData = zws.embed('Hello world', 'first')
  expect(() => zws.embed(textWithData, 'second')).toThrow(
    'already contains embedded data',
  )
})

test('inserts after first sentence terminator when position option set', () => {
  const result = zws.embed('First! Second? Third.', 'test', {
    position: 'after-first-sentence',
  })
  expect(result).toMatch(/^First!​‌[​‌]+ Second\? Third\.$/)
  expect(zws.extract(result)).toBe('test')
})

test('after-first-sentence falls back to end when no terminator present', () => {
  const result = zws.embed('No terminator here', 'data', {
    position: 'after-first-sentence',
  })
  expect(result).toMatch(/^No terminator here​‌[​‌]+$/)
  expect(zws.extract(result)).toBe('data')
})

test('handles empty text', () => {
  const result = zws.embed('', 'data')
  expect(result).toMatch(/^​‌[​‌]+$/)
  expect(zws.extract(result)).toBe('data')
})

test('back-to-back empty-text embeds round-trip without corruption', () => {
  // Regression: previous wire format produced ambiguous bit boundaries when
  // two embeds were concatenated with no non-zero-width text between them.
  const combined = zws.embed('', 'first') + zws.embed('', 'second')
  expect(zws.extractAll(combined)).toEqual(['first', 'second'])
})
