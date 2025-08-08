import { expect, test } from 'bun:test'
import zws from '../index'
import { A, EXCLAMATION, H, I, SPACE, ZERO } from './testConstants'

test('decodes characters correctly', () => {
  expect(zws.decodeData(A.encoded)).toBe(A.char)
  expect(zws.decodeData(H.encoded)).toBe(H.char)
  expect(zws.decodeData(I.encoded)).toBe(I.char)
  expect(zws.decodeData(SPACE.encoded)).toBe(SPACE.char)
  expect(zws.decodeData(EXCLAMATION.encoded)).toBe(EXCLAMATION.char)
  expect(zws.decodeData(ZERO.encoded)).toBe(ZERO.char)
})

test('decodes multiple characters', () => {
  const hiEncoded = H.encoded + I.encoded
  expect(zws.decodeData(hiEncoded)).toBe('Hi')
})

test('round-trip encoding preserves data', () => {
  expect(zws.decodeData(zws.encodeData(A.char))).toBe(A.char)
  expect(zws.decodeData(zws.encodeData('Hello'))).toBe('Hello')
  expect(zws.decodeData(zws.encodeData('!@#'))).toBe('!@#')
})

test('decodes empty encoded data', () => {
  expect(zws.decodeData('')).toBe('')
})

test('decodes unicode characters', () => {
  // Medical symbols
  const medicalSymbols = '⚕⚖⚗⚘⚙⚛⚜'
  expect(zws.decodeData(zws.encodeData(medicalSymbols))).toBe(medicalSymbols)

  // Greek letters
  const greekLetters = 'αβγδεζηθικλμνξοπρστυφχψω'
  expect(zws.decodeData(zws.encodeData(greekLetters))).toBe(greekLetters)

  // Math symbols
  const mathSymbols = '∑∆∏∫√≤≥≠±×÷'
  expect(zws.decodeData(zws.encodeData(mathSymbols))).toBe(mathSymbols)

  // European characters
  const europeanChars = 'ÄÖÜäöüßñáéíóúàèìòù'
  expect(zws.decodeData(zws.encodeData(europeanChars))).toBe(europeanChars)

  // Asian scripts
  const asianChars = '中文русский日本語'
  expect(zws.decodeData(zws.encodeData(asianChars))).toBe(asianChars)

  // Currency symbols
  const currencySymbols = '€£¥'
  expect(zws.decodeData(zws.encodeData(currencySymbols))).toBe(currencySymbols)
})

test('decodes complex punctuation and symbols', () => {
  // Basic punctuation
  const basicPunct = "!@#$%^&*()_+-=[]{}|;':,./<>?"
  expect(zws.decodeData(zws.encodeData(basicPunct))).toBe(basicPunct)

  // Typographic symbols
  const typoSymbols = "§¶•‚„…†‡ˆ‰Š‹ŒŽ''–—˜™š›œžŸ"
  expect(zws.decodeData(zws.encodeData(typoSymbols))).toBe(typoSymbols)

  // Extended Latin symbols
  const extendedLatin = '¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿'
  expect(zws.decodeData(zws.encodeData(extendedLatin))).toBe(extendedLatin)
})

test('decodes multilingual characters and scripts', () => {
  // Arabic and Hebrew
  const arabicHebrew = 'العربيةעברית'
  expect(zws.decodeData(zws.encodeData(arabicHebrew))).toBe(arabicHebrew)

  // Thai and Devanagari
  const thaiDevanagari = 'ไทยहिन्दी'
  expect(zws.decodeData(zws.encodeData(thaiDevanagari))).toBe(thaiDevanagari)

  // Bengali and Tamil
  const bengaliTamil = 'বাংলাதমিল'
  expect(zws.decodeData(zws.encodeData(bengaliTamil))).toBe(bengaliTamil)

  // Korean scripts
  const koreanScripts = '한글조선글ᄀᄁᄂ'
  expect(zws.decodeData(zws.encodeData(koreanScripts))).toBe(koreanScripts)
})

test('decodes specialized symbols and notation', () => {
  // Mathematical symbols
  const mathSymbols = '℀℁ℂ℃℄℅℆ℇ℈℉ℊℋℌℍℎℏℐℑℒℓ℔ℕ№℗℘ℙℚℛℜℝ℞℟℠℡™℣ℤ℥'
  expect(zws.decodeData(zws.encodeData(mathSymbols))).toBe(mathSymbols)

  // Scientific notation
  const scientificSymbols = 'Ω℧ℨ℩KÅℬℭ℮ℯℰℱℲℳℴℵℶℷℸ'
  expect(zws.decodeData(zws.encodeData(scientificSymbols))).toBe(
    scientificSymbols,
  )

  // Musical notation
  const musicalSymbols = '♩♪♫♬♭♮♯'
  expect(zws.decodeData(zws.encodeData(musicalSymbols))).toBe(musicalSymbols)
})

test('handles incomplete binary data', () => {
  const partialEncoded = '\u200B\u200C\u200B'
  expect(zws.decodeData(partialEncoded)).toBe('')
})

test('filters out invalid characters in encoded data', () => {
  const mixedEncodedData = '\u200B\u200C regular text \u200B\u200C\u200B'
  expect(zws.decodeData(mixedEncodedData)).toBe('')
})

test('handles edge case of all zeros', () => {
  const allZeros =
    '\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B' // 16 zeros
  expect(zws.decodeData(allZeros)).toBe('\u0000')
})

test('handles edge case of all ones', () => {
  const allOnes =
    '\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C' // 16 ones
  expect(zws.decodeData(allOnes)).toBe('\uFFFF')
})
