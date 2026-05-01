/**
 * Zero-Width Steganography Utils
 * Invisible data embedding using zero-width Unicode characters.
 *
 * Embed arbitrary BMP-range string data into visible text using zero-width
 * Unicode characters. The embedded data is invisible to humans but trivially
 * recoverable programmatically.
 */

const START_MARKER = '\u200B\u200C'
const END_MARKER = '\u200C\u200B'
const ZERO_BIT = '\u200B'
const ONE_BIT = '\u200C'
const MAX_DATA_LENGTH = 100
const MAX_ENCODED_LENGTH = MAX_DATA_LENGTH * 16

export type EmbedPosition = 'end' | 'after-first-sentence'

export type EmbedOptions = {
  position?: EmbedPosition
}

function hasEmbeddedData(text: string): boolean {
  return text.includes(START_MARKER)
}

function embed(text: string, data: string, options: EmbedOptions = {}): string {
  if (hasEmbeddedData(text)) {
    throw new Error('Cannot embed: text already contains embedded data')
  }

  const encoded = encodeData(data)
  const marker = START_MARKER + encoded + END_MARKER

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

  const pattern = new RegExp(
    `${START_MARKER}([${ZERO_BIT}${ONE_BIT}]*)${END_MARKER}`,
  )
  const match = text.match(pattern)
  if (!match) return ''

  return decodeData(match[1] || '')
}

function extractAll(text: string): string[] {
  if (!hasEmbeddedData(text)) return []

  const pattern = new RegExp(
    `${START_MARKER}([${ZERO_BIT}${ONE_BIT}]*)${END_MARKER}`,
    'g',
  )
  const out: string[] = []
  let match: RegExpExecArray | null = pattern.exec(text)
  while (match !== null) {
    out.push(decodeData(match[1] || ''))
    match = pattern.exec(text)
  }
  return out
}

function getCleanText(text: string): string {
  return text.replace(
    new RegExp(`${START_MARKER}[${ZERO_BIT}${ONE_BIT}]*${END_MARKER}`, 'g'),
    '',
  )
}

function encodeData(data: string): string {
  // Bounds checking: prevent memory exhaustion via oversized inputs.
  // 100 chars is a conservative default; the encoded form is 16x larger.
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

const zws = {
  START_MARKER,
  END_MARKER,
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
