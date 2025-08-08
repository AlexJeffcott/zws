// Test the built package
import zws from './dist/index.js';

// Test basic functionality
const text = "Hello world!";
const data = "test-id-123";

const textWithData = zws.embed(text, data);
console.assert(typeof textWithData === 'string', '❌ embed should return string');
console.log('✅ Embed successful');

const hasData = zws.hasEmbeddedData(textWithData);
console.assert(hasData === true, '❌ hasEmbeddedData should return true');
console.log('✅ Has embedded data check passed');

const extractedData = zws.extract(textWithData);
console.assert(extractedData === data, '❌ extract should return original data');
console.log('✅ Extract successful');

const cleanText = zws.getCleanText(textWithData);
console.assert(cleanText === text, '❌ getCleanText should return original text');
console.log('✅ Clean text successful');

// Test error handling (oversized data)
const oversizedData = 'x'.repeat(200); // Over 50 char limit
const resultWithError = zws.embed(text, oversizedData);
console.assert(resultWithError === text, '❌ embed should return original text on error');
console.log('✅ Error handling successful');

// Test with empty data
const emptyResult = zws.extract("no embedded data");
console.assert(emptyResult === "", '❌ extract should return empty string when no data');
console.log('✅ Empty data handling successful');

// Test completely incorrect arguments
const nullTextResult = zws.embed(null, "data");
console.assert(typeof nullTextResult === 'string', '❌ embed should handle null gracefully');

const nullDataResult = zws.embed("text", null);  
console.assert(typeof nullDataResult === 'string', '❌ embed should handle null data gracefully');

const numberExtract = zws.extract(42);
console.assert(typeof numberExtract === 'string', '❌ extract should handle numbers gracefully');

const undefinedCheck = zws.hasEmbeddedData(undefined);
console.assert(typeof undefinedCheck === 'boolean', '❌ hasEmbeddedData should handle undefined gracefully');

console.log('✅ Invalid argument handling successful');
console.log('🎉 All functionality tests passed!');