const ZERO_BIT = '\u200B' // Zero-width space represents binary '0'
const ONE_BIT = '\u200C' // Zero-width non-joiner represents binary '1'

export const A = {
  char: 'A',
  charCode: 65,
  binary: '0000000001000001',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}`,
} as const

export const SPACE = {
  char: ' ',
  charCode: 32,
  binary: '0000000000100000',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}`,
} as const

export const EXCLAMATION = {
  char: '!',
  charCode: 33,
  binary: '0000000000100001',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}`,
} as const

export const H = {
  char: 'H',
  charCode: 72,
  binary: '0000000001001000',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}`,
} as const

export const I = {
  char: 'i',
  charCode: 105,
  binary: '0000000001101001',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ONE_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}`,
} as const

export const ZERO = {
  char: '0',
  charCode: 48,
  binary: '0000000000110000',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}`,
} as const

// Unicode and special characters that could cause encoding issues (within BMP)
export const MEDICAL_SYMBOL = {
  char: '⚕', // Medical symbol (within BMP)
  charCode: 9877,
  binary: '0010011010010101',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ONE_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ONE_BIT}`,
} as const

export const NULL_CHAR = {
  char: '\0',
  charCode: 0,
  binary: '0000000000000000',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}`,
} as const

export const HIGH_UNICODE = {
  char: 'ﷺ', // Arabic ligature - high Unicode value
  charCode: 65018,
  binary: '1111110111111010',
  encoded: `${ONE_BIT}${ONE_BIT}${ONE_BIT}${ONE_BIT}${ONE_BIT}${ONE_BIT}${ZERO_BIT}${ONE_BIT}${ONE_BIT}${ONE_BIT}${ONE_BIT}${ONE_BIT}${ONE_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}`,
} as const

// RTL/LTR formatting characters that are legitimate zero-width chars
export const RTL_MARK = {
  char: '\u200F', // Right-to-Left Mark
  charCode: 8207,
  binary: '0010000000001111',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ONE_BIT}${ONE_BIT}${ONE_BIT}`,
} as const

export const ZWJ = {
  char: '\u200D', // Zero Width Joiner - used in legitimate text formatting
  charCode: 8205,
  binary: '0010000000001101',
  encoded: `${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ZERO_BIT}${ONE_BIT}${ONE_BIT}${ZERO_BIT}${ONE_BIT}`,
} as const

// Edge case strings that might break parsing
export const STRINGS = {
  WITH_EXISTING_ZW: 'Hello\u200Bworld', // Contains zero-width space (not our encoding)
  WITH_RTL: 'Hello\u200Fworld', // Contains RTL mark
  WITH_ZWJ: 'Hello\u200Dworld', // Contains zero-width joiner
  MIXED_SCRIPTS: 'Hello世界⚕', // Latin + Chinese + Medical symbol (all BMP)
  ONLY_WHITESPACE: '   \t\n  ', // Various whitespace chars
  EMPTY: '',
  VERY_LONG: 'A'.repeat(50), // Long string within bounds (updated to 50 char limit)
} as const
