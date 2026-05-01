import { expect, test } from 'bun:test'
import zws from '../index'

// Regression suite for wire-format ambiguity. The original marker-pair format
// (START + bits + END) corrupted decoding when two embeds were concatenated with
// no intervening non-zero-width character, because END is composed of bit-class
// chars and a greedy regex would consume across both bodies. The length-prefix
// format eliminates this ambiguity by encoding the payload length up front.

test('two empty-text embeds concatenate without losing payload boundaries', () => {
  const combined = zws.embed('', 'first') + zws.embed('', 'second')
  expect(zws.extractAll(combined)).toEqual(['first', 'second'])
  expect(zws.extract(combined)).toBe('first')
})

test('three back-to-back empty-text embeds round-trip', () => {
  const combined = zws.embed('', 'a') + zws.embed('', 'b') + zws.embed('', 'c')
  expect(zws.extractAll(combined)).toEqual(['a', 'b', 'c'])
})

test('getCleanText removes both empty-text embeds, leaving nothing', () => {
  const combined = zws.embed('', 'first') + zws.embed('', 'second')
  expect(zws.getCleanText(combined)).toBe('')
})

test('payloads that contain internal END-marker-like bit patterns still decode', () => {
  // Earlier non-greedy regex broke here because the encoding of common chars
  // contains ‌​ sequences that look like the old END marker.
  expect(zws.extract(zws.embed('Hello', 's'))).toBe('s')
  expect(zws.extract(zws.embed('Hello', 'sssss'))).toBe('sssss')
})

test('empty-text embed concatenated with non-empty embed', () => {
  const combined = zws.embed('', 'empty-host') + zws.embed('text', 'normal')
  expect(zws.extractAll(combined)).toEqual(['empty-host', 'normal'])
})
