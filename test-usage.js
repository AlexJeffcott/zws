// Test the built package
import { embed, extract, hasEmbeddedData, getCleanText } from './dist/index.js';

// Test basic functionality
const text = "Hello world!";
const data = "test-id-123";

const textWithData = embed(text, data);
console.assert(typeof textWithData === 'string', '❌ embed should return string');
console.log('✅ Embed successful');

const hasData = hasEmbeddedData(textWithData);
console.assert(hasData === true, '❌ hasEmbeddedData should return true');
console.log('✅ Has embedded data check passed');

const extractedData = extract(textWithData);
console.assert(extractedData === data, '❌ extract should return original data');
console.log('✅ Extract successful');

const cleanText = getCleanText(textWithData);
console.assert(cleanText === text, '❌ getCleanText should return original text');
console.log('✅ Clean text successful');

// Test error handling (oversized data)
const oversizedData = 'x'.repeat(200); // Over 100 char limit
const resultWithError = embed(text, oversizedData);
console.assert(resultWithError === text, '❌ embed should return original text on error');
console.log('✅ Error handling successful');

// Test with empty data
const emptyResult = extract("no embedded data");
console.assert(emptyResult === "", '❌ extract should return empty string when no data');
console.log('✅ Empty data handling successful');

// Test completely incorrect arguments
const nullTextResult = embed(null, "data");
console.assert(typeof nullTextResult === 'string', '❌ embed should handle null gracefully');

const nullDataResult = embed("text", null);  
console.assert(typeof nullDataResult === 'string', '❌ embed should handle null data gracefully');

const numberExtract = extract(42);
console.assert(typeof numberExtract === 'string', '❌ extract should handle numbers gracefully');

const undefinedCheck = hasEmbeddedData(undefined);
console.assert(typeof undefinedCheck === 'boolean', '❌ hasEmbeddedData should handle undefined gracefully');

console.log('✅ Invalid argument handling successful');
console.log('🎉 All functionality tests passed!');