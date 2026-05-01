/**
 * Zero-Width Steganography Utils
 * Invisible data embedding using zero-width Unicode characters.
 *
 * Embed arbitrary BMP-range string data into visible text using zero-width
 * Unicode characters. The embedded data is invisible to humans but trivially
 * recoverable programmatically.
 */

const START_MARKER = '\u200B\u200C'
const ZERO_BIT = '\u200B'
const ONE_BIT = '\u200C'
const LENGTH_BITS = 16
const MAX_DATA_LENGTH = 100
const MAX_ENCODED_LENGTH = MAX_DATA_LENGTH * 16

export type EmbedPosition = 'end' | 'after-first-sentence'

export type EmbedOptions = {
  position?: EmbedPosition
}

type EmbedRange = {
  start: number
  end: number
  payloadStart: number
  payloadLength: number
}

function hasEmbeddedData(text: string): boolean {
  return text.includes(START_MARKER)
}

function embed(text: string, data: string, options: EmbedOptions = {}): string {
  if (hasEmbeddedData(text)) {
    throw new Error('Cannot embed: text already contains embedded data')
  }

  const payload = encodeData(data)
  const lengthPrefix = bitsForLength(data.length)
  const marker = START_MARKER + lengthPrefix + payload

  if (options.position === 'after-first-sentence') {
    const sentenceEnd = text.search(/[.!?]\s/)
    if (sentenceEnd !== -1) {
      const insertPos = sentenceEnd + 1
      return text.substring(0, insertPos) + marker + text.substring(insertPos)
    }
  }

  return text + marker
}

function extract(text: string): string {
  if (!hasEmbeddedData(text)) return ''
  const ranges = findEmbeds(text)
  if (ranges.length === 0) return ''
  const r = ranges[0] as EmbedRange
  return decodeData(
    text.substring(r.payloadStart, r.payloadStart + r.payloadLength),
  )
}

function extractAll(text: string): string[] {
  if (!hasEmbeddedData(text)) return []
  return findEmbeds(text).map((r) =>
    decodeData(
      text.substring(r.payloadStart, r.payloadStart + r.payloadLength),
    ),
  )
}

function getCleanText(text: string): string {
  if (!hasEmbeddedData(text)) return text
  const ranges = findEmbeds(text)
  if (ranges.length === 0) return text
  let out = ''
  let cursor = 0
  for (const r of ranges) {
    out += text.substring(cursor, r.start)
    cursor = r.end
  }
  out += text.substring(cursor)
  return out
}

function encodeData(data: string): string {
  if (data.length > MAX_DATA_LENGTH) {
    throw new Error(
      `Data too long: ${data.length} characters. Maximum allowed: ${MAX_DATA_LENGTH} characters.`,
    )
  }

  // Restrict to Basic Multilingual Plane (U+0000-U+FFFF).
  // Excludes astral code points (e.g. most emoji) which require surrogate-pair handling.
  for (let i = 0; i < data.length; i++) {
    const codePoint = data.codePointAt(i) || 0
    if (codePoint > 65535) {
      throw new Error(
        `Invalid character in data: "${data[i]}" (U+${codePoint.toString(16).toUpperCase()}). Data must lie within the Basic Multilingual Plane.`,
      )
    }
  }

  const binary = Array.from(data)
    .map((char) => char.charCodeAt(0).toString(2).padStart(16, '0'))
    .join('')

  return binary
    .split('')
    .map((bit) => (bit === '0' ? ZERO_BIT : ONE_BIT))
    .join('')
}

function decodeData(encodedBinary: string): string {
  if (encodedBinary.length > MAX_ENCODED_LENGTH) {
    throw new Error(
      `Encoded data too long: ${encodedBinary.length} characters. Maximum allowed: ${MAX_ENCODED_LENGTH} characters.`,
    )
  }

  const cleanBinary = encodedBinary
    .split('')
    .filter((char) => char === ZERO_BIT || char === ONE_BIT)
    .map((char) => (char === ZERO_BIT ? '0' : '1'))
    .join('')

  const chars: string[] = []
  for (let i = 0; i < cleanBinary.length; i += 16) {
    const charBinary = cleanBinary.substring(i, i + 16)
    if (charBinary.length === 16) {
      const codePoint = Number.parseInt(charBinary, 2)
      chars.push(String.fromCharCode(codePoint))
    }
  }

  return chars.join('')
}

function bitsForLength(n: number): string {
  return n
    .toString(2)
    .padStart(LENGTH_BITS, '0')
    .split('')
    .map((bit) => (bit === '0' ? ZERO_BIT : ONE_BIT))
    .join('')
}

// Scan text for well-formed embed sequences.
// Each embed is START_MARKER + LENGTH_BITS bits of length + length*16 bits of payload.
// Candidates with malformed length, oversized length, non-bit payload chars, or truncation
// are skipped (advance one char past START and keep scanning).
function findEmbeds(text: string): EmbedRange[] {
  const ranges: EmbedRange[] = []
  let i = 0
  while (i <= text.length - START_MARKER.length) {
    const startIdx = text.indexOf(START_MARKER, i)
    if (startIdx === -1) break

    const lengthStart = startIdx + START_MARKER.length
    const payloadStart = lengthStart + LENGTH_BITS

    if (payloadStart > text.length) {
      i = startIdx + 1
      continue
    }

    let lengthBinary = ''
    let valid = true
    for (let k = 0; k < LENGTH_BITS; k++) {
      const c = text[lengthStart + k]
      if (c === ZERO_BIT) lengthBinary += '0'
      else if (c === ONE_BIT) lengthBinary += '1'
      else {
        valid = false
        break
      }
    }
    if (!valid) {
      i = startIdx + 1
      continue
    }

    const dataLength = Number.parseInt(lengthBinary, 2)
    if (dataLength > MAX_DATA_LENGTH) {
      i = startIdx + 1
      continue
    }

    const payloadLength = dataLength * 16
    const end = payloadStart + payloadLength
    if (end > text.length) {
      i = startIdx + 1
      continue
    }

    let payloadValid = true
    for (let k = 0; k < payloadLength; k++) {
      const c = text[payloadStart + k]
      if (c !== ZERO_BIT && c !== ONE_BIT) {
        payloadValid = false
        break
      }
    }
    if (!payloadValid) {
      i = startIdx + 1
      continue
    }

    ranges.push({ start: startIdx, end, payloadStart, payloadLength })
    i = end
  }
  return ranges
}

const zws = {
  START_MARKER,
  ZERO_BIT,
  ONE_BIT,
  MAX_DATA_LENGTH,
  MAX_ENCODED_LENGTH,
  hasEmbeddedData,
  embed,
  extract,
  extractAll,
  getCleanText,
  encodeData,
  decodeData,
}

export default zws
