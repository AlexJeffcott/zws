/**
 * Zero-Width Steganography Utils
 * Invisible data embedding using zero-width Unicode characters
 *
 * This module provides functionality to embed arbitrary string data directly into
 * text using zero-width Unicode characters, making them completely invisible to users
 * while allowing programmatic extraction of the embedded data.
 *
 */

const START_MARKER = '\u200B\u200C' // Zero-width space + non-joiner sequence
const END_MARKER = '\u200C\u200B' // Zero-width non-joiner + space sequence (reverse)
const ZERO_BIT = '\u200B' // Zero-width space represents binary '0'
const ONE_BIT = '\u200C' // Zero-width non-joiner represents binary '1'

export function hasEmbeddedData(text: string): boolean {
  if (typeof text !== 'string') return false
  return text.includes(START_MARKER)
}

export function embed(text: string, data: string): string {
  const normalizedText = typeof text !== 'string' ? String(text || '') : text
  const normalizedData = typeof data !== 'string' ? String(data || '') : data

  if (hasEmbeddedData(normalizedText)) {
    return normalizedText
  }

  try {
    const encodedData = encodeData(normalizedData)
    const marker = START_MARKER + encodedData + END_MARKER

    // NOTE: inserts after first sentence if possible
    const sentenceEnd = normalizedText.search(/[.!?]\s/)
    if (sentenceEnd !== -1) {
      const insertPos = sentenceEnd + 1
      return (
        normalizedText.substring(0, insertPos) +
        marker +
        normalizedText.substring(insertPos)
      )
    }

    return normalizedText + marker
  } catch (error) {
    console.warn(
      'Failed to embed data:',
      error instanceof Error ? error.message : String(error),
    )
    return normalizedText
  }
}

export function extract(text: string): string {
  if (typeof text !== 'string') return ''
  if (!hasEmbeddedData(text)) {
    return ''
  }

  try {
    const pattern = new RegExp(
      `${START_MARKER}([${ZERO_BIT}${ONE_BIT}]*)${END_MARKER}`,
    )
    const match = text.match(pattern)

    if (!match) {
      return ''
    }

    return decodeData(match[1] || '')
  } catch (error) {
    console.warn('Data extraction failed:', error)
    return ''
  }
}

export function getCleanText(text: string): string {
  if (typeof text !== 'string') return String(text || '')
  return text.replace(
    new RegExp(`${START_MARKER}[${ZERO_BIT}${ONE_BIT}]*${END_MARKER}`, 'g'),
    '',
  )
}

export function encodeData(data: string): string {
  // Bounds checking: Prevent memory exhaustion attacks
  // Translation IDs should be reasonably short
  const MAX_DATA_LENGTH = 50
  if (data.length > MAX_DATA_LENGTH) {
    throw new Error(
      `Data too long: ${data.length} characters. Maximum allowed: ${MAX_DATA_LENGTH} characters.`,
    )
  }

  // Validate that data contains only UTF-8 safe characters (Basic Multilingual Plane)
  // This excludes emojis and complex Unicode that would cause encoding issues
  for (let i = 0; i < data.length; i++) {
    const codePoint = data.codePointAt(i) || 0
    if (codePoint > 65535) {
      throw new Error(
        `Invalid character in data: "${data[i]}" (U+${codePoint.toString(16).toUpperCase()}). Data must use UTF-8 safe characters only.`,
      )
    }
  }

  // Encode each character as 16-bit value
  const binary = Array.from(data)
    .map((char) => char.charCodeAt(0).toString(2).padStart(16, '0'))
    .join('')

  return binary
    .split('')
    .map((bit) => (bit === '0' ? ZERO_BIT : ONE_BIT))
    .join('')
}

export function decodeData(encodedBinary: string): string {
  // Bounds checking: Prevent memory exhaustion through massive encoded data
  const MAX_ENCODED_LENGTH = 50 * 16 // 50 chars * 16 bits each
  if (encodedBinary.length > MAX_ENCODED_LENGTH) {
    throw new Error(
      `Encoded data too long: ${encodedBinary.length} characters. Maximum allowed: ${MAX_ENCODED_LENGTH} characters.`,
    )
  }

  // Filter out invalid characters that might be mixed in
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
      // Use fromCharCode since we're limiting to BMP (16-bit values)
      chars.push(String.fromCharCode(codePoint))
    }
  }

  return chars.join('')
}
