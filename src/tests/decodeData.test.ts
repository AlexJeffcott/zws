import { expect, test } from 'bun:test'
import { decodeData, encodeData } from '../index'
import { A, EXCLAMATION, H, I, SPACE, ZERO } from './testConstants'

test('decodes characters correctly', () => {
  expect(decodeData(A.encoded)).toBe(A.char)
  expect(decodeData(H.encoded)).toBe(H.char)
  expect(decodeData(I.encoded)).toBe(I.char)
  expect(decodeData(SPACE.encoded)).toBe(SPACE.char)
  expect(decodeData(EXCLAMATION.encoded)).toBe(EXCLAMATION.char)
  expect(decodeData(ZERO.encoded)).toBe(ZERO.char)
})

test('decodes multiple characters', () => {
  const hiEncoded = H.encoded + I.encoded
  expect(decodeData(hiEncoded)).toBe('Hi')
})

test('round-trip encoding preserves data', () => {
  expect(decodeData(encodeData(A.char))).toBe(A.char)
  expect(decodeData(encodeData('Hello'))).toBe('Hello')
  expect(decodeData(encodeData('!@#'))).toBe('!@#')
})

test('decodes empty encoded data', () => {
  expect(decodeData('')).toBe('')
})

test('decodes unicode characters', () => {
  // Medical symbols
  const medicalSymbols = '⚕⚖⚗⚘⚙⚛⚜'
  expect(decodeData(encodeData(medicalSymbols))).toBe(medicalSymbols)

  // Greek letters
  const greekLetters = 'αβγδεζηθικλμνξοπρστυφχψω'
  expect(decodeData(encodeData(greekLetters))).toBe(greekLetters)

  // Math symbols
  const mathSymbols = '∑∆∏∫√≤≥≠±×÷'
  expect(decodeData(encodeData(mathSymbols))).toBe(mathSymbols)

  // European characters
  const europeanChars = 'ÄÖÜäöüßñáéíóúàèìòù'
  expect(decodeData(encodeData(europeanChars))).toBe(europeanChars)

  // Asian scripts
  const asianChars = '中文русский日本語'
  expect(decodeData(encodeData(asianChars))).toBe(asianChars)

  // Currency symbols
  const currencySymbols = '€£¥'
  expect(decodeData(encodeData(currencySymbols))).toBe(currencySymbols)
})

test('decodes complex punctuation and symbols', () => {
  // Basic punctuation
  const basicPunct = "!@#$%^&*()_+-=[]{}|;':,./<>?"
  expect(decodeData(encodeData(basicPunct))).toBe(basicPunct)

  // Typographic symbols
  const typoSymbols = "§¶•‚„…†‡ˆ‰Š‹ŒŽ''–—˜™š›œžŸ"
  expect(decodeData(encodeData(typoSymbols))).toBe(typoSymbols)

  // Extended Latin symbols
  const extendedLatin = '¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿'
  expect(decodeData(encodeData(extendedLatin))).toBe(extendedLatin)
})

test('decodes multilingual characters and scripts', () => {
  // Arabic and Hebrew
  const arabicHebrew = 'العربيةעברית'
  expect(decodeData(encodeData(arabicHebrew))).toBe(arabicHebrew)

  // Thai and Devanagari
  const thaiDevanagari = 'ไทยहिन्दी'
  expect(decodeData(encodeData(thaiDevanagari))).toBe(thaiDevanagari)

  // Bengali and Tamil
  const bengaliTamil = 'বাংলাதমিল'
  expect(decodeData(encodeData(bengaliTamil))).toBe(bengaliTamil)

  // Korean scripts
  const koreanScripts = '한글조선글ᄀᄁᄂ'
  expect(decodeData(encodeData(koreanScripts))).toBe(koreanScripts)
})

test('decodes specialized symbols and notation', () => {
  // Mathematical symbols
  const mathSymbols = '℀℁ℂ℃℄℅℆ℇ℈℉ℊℋℌℍℎℏℐℑℒℓ℔ℕ№℗℘ℙℚℛℜℝ℞℟℠℡™℣ℤ℥'
  expect(decodeData(encodeData(mathSymbols))).toBe(mathSymbols)

  // Scientific notation
  const scientificSymbols = 'Ω℧ℨ℩KÅℬℭ℮ℯℰℱℲℳℴℵℶℷℸ'
  expect(decodeData(encodeData(scientificSymbols))).toBe(scientificSymbols)

  // Musical notation
  const musicalSymbols = '♩♪♫♬♭♮♯'
  expect(decodeData(encodeData(musicalSymbols))).toBe(musicalSymbols)
})

test('handles incomplete binary data', () => {
  const partialEncoded = '\u200B\u200C\u200B'
  expect(decodeData(partialEncoded)).toBe('')
})

test('filters out invalid characters in encoded data', () => {
  const mixedEncodedData = '\u200B\u200C regular text \u200B\u200C\u200B'
  expect(decodeData(mixedEncodedData)).toBe('')
})

test('handles edge case of all zeros', () => {
  const allZeros =
    '\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B' // 16 zeros
  expect(decodeData(allZeros)).toBe('\u0000')
})

test('handles edge case of all ones', () => {
  const allOnes =
    '\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C' // 16 ones
  expect(decodeData(allOnes)).toBe('\uFFFF')
})
