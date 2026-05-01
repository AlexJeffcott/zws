// Test the built package
import assert from 'node:assert/strict';
import zws from './dist/index.js';

// Test basic functionality
const text = "Hello world!";
const data = "test-id-123";

const textWithData = zws.embed(text, data);
assert.equal(typeof textWithData, 'string', 'embed should return string');
console.log('✅ Embed successful');

const hasData = zws.hasEmbeddedData(textWithData);
assert.equal(hasData, true, 'hasEmbeddedData should return true');
console.log('✅ Has embedded data check passed');

const extractedData = zws.extract(textWithData);
assert.equal(extractedData, data, 'extract should return original data');
console.log('✅ Extract successful');

const cleanText = zws.getCleanText(textWithData);
assert.equal(cleanText, text, 'getCleanText should return original text');
console.log('✅ Clean text successful');

// Test error handling: oversized data
// Exceeds MAX_DATA_LENGTH (100) - should trigger encodeData throw and embed catch
const oversizedData = 'x'.repeat(200);
const resultWithError = zws.embed(text, oversizedData);
assert.equal(resultWithError, text, 'embed should return original text on error');
console.log('✅ Error handling successful');

// Test with empty data
const emptyResult = zws.extract("no embedded data");
assert.equal(emptyResult, "", 'extract should return empty string when no data');
console.log('✅ Empty data handling successful');

// Test completely incorrect arguments
const nullTextResult = zws.embed(null, "data");
assert.equal(typeof nullTextResult, 'string', 'embed should handle null gracefully');

const nullDataResult = zws.embed("text", null);
assert.equal(typeof nullDataResult, 'string', 'embed should handle null data gracefully');

const numberExtract = zws.extract(42);
assert.equal(typeof numberExtract, 'string', 'extract should handle numbers gracefully');

const undefinedCheck = zws.hasEmbeddedData(undefined);
assert.equal(typeof undefinedCheck, 'boolean', 'hasEmbeddedData should handle undefined gracefully');

console.log('✅ Invalid argument handling successful');
console.log('🎉 All functionality tests passed!');
