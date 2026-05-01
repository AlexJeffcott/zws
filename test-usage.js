// Test the built package
import assert from 'node:assert/strict';
import zws from './dist/index.js';

const text = 'Hello world!';
const data = 'test-id-123';

const textWithData = zws.embed(text, data);
assert.equal(typeof textWithData, 'string', 'embed should return string');
console.log('✅ Embed successful');

assert.equal(zws.hasEmbeddedData(textWithData), true, 'hasEmbeddedData should return true');
console.log('✅ Has embedded data check passed');

assert.equal(zws.extract(textWithData), data, 'extract should return original data');
console.log('✅ Extract successful');

assert.equal(zws.getCleanText(textWithData), text, 'getCleanText should return original text');
console.log('✅ Clean text successful');

// Position option: opt-in sentence-aware insertion
const sentenceText = zws.embed('First. Second.', 'id', { position: 'after-first-sentence' });
assert.match(sentenceText, /^First\.​‌[​‌]+ Second\.$/, 'embed should insert after first sentence when opted in');
assert.equal(zws.extract(sentenceText), 'id', 'extract should round-trip the position-option embed');
console.log('✅ Position option successful');

// extractAll: multiple embeds
const a = zws.embed('one', 'id-a');
const b = zws.embed('two', 'id-b');
assert.deepEqual(zws.extractAll(a + ' ' + b), ['id-a', 'id-b'], 'extractAll should return both payloads');
console.log('✅ extractAll successful');

// Throw paths
assert.throws(() => zws.embed(text, 'x'.repeat(zws.MAX_DATA_LENGTH + 1)), /Data too long/, 'embed should throw on oversized data');
assert.throws(() => zws.embed(textWithData, 'x'), /already contains embedded data/, 'embed should throw on re-embed');
assert.throws(() => zws.encodeData('🏥'), /Invalid character in data/, 'encodeData should throw on astral code points');
console.log('✅ Throw-path checks successful');

// extract returns '' for text without embedded data (not an error)
assert.equal(zws.extract('no embedded data'), '', 'extract should return empty string when no data');
assert.deepEqual(zws.extractAll('no embedded data'), [], 'extractAll should return empty array when no data');
console.log('✅ Empty data handling successful');

console.log('🎉 All functionality tests passed!');
