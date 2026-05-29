import { expect, test } from 'bun:test'
import zws from '../index'

// These tests were written to kill specific "theatre" mutants surfaced by
// scripts/test-debt: code the suite covered but no assertion pinned.

// --- Group 1: under-asserted boundaries ---

test('encodeData accepts U+FFFF, the BMP upper boundary', () => {
  // kills EqualityOperator at the `codePoint > 65535` guard: U+FFFF is valid,
  // so `>=` (rejecting it) must produce an observable failure.
  const ffff = '￿'
  expect(() => zws.encodeData(ffff)).not.toThrow()
  const text = zws.embed('carrier', ffff)
  expect(zws.extract(text)).toBe(ffff)
})

test('extracts a payload of exactly MAX_DATA_LENGTH', () => {
  // kills EqualityOperator at the `dataLength > MAX_DATA_LENGTH` skip guard in
  // findEmbeds: at exactly the max the candidate is valid, so `>=` would wrongly
  // skip it and extraction would come back empty.
  const maxData = 'A'.repeat(zws.MAX_DATA_LENGTH)
  const text = zws.embed('carrier', maxData)
  expect(zws.extract(text)).toBe(maxData)
})

// --- Group 2: skip-and-continue past a malformed candidate ---

test('recovers a valid embed that follows a malformed marker candidate', () => {
  // A START_MARKER (​‌) followed by a non-bit char is a malformed
  // candidate findEmbeds must skip (i = startIdx + 1; continue) and keep
  // scanning. Deleting that skip body, or forcing its guard, leaves the decoy
  // either swallowing the scan or pushing a bogus range — both observable here.
  const decoy = '​‌not-actually-bits'
  const real = zws.embed('carrier', 'secret')
  expect(zws.extract(decoy + real)).toBe('secret')
  expect(zws.extractAll(decoy + real)).toEqual(['secret'])
})

test('recovers a valid embed after a truncated-payload candidate', () => {
  // START_MARKER + 16 zero length-bits claims a 0-length payload at the very end
  // of the string; a longer crafted candidate that runs past the end must be
  // skipped on the `end > text.length` guard, and the following real embed found.
  const startMarker = '​‌'
  const zeroBit = '​'
  // length bits encode 1 (15 zeros + a one) -> claims 16 payload bits that aren't there
  const truncated = startMarker + zeroBit.repeat(15) + '‌'
  const real = zws.embed('carrier', 'secret')
  expect(zws.extractAll(truncated + real)).toEqual(['secret'])
})
