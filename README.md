# @fairfox/zws

Zero-width steganography utilities for invisibly embedding data in text using Unicode zero-width characters.

## Overview

This library provides secure utilities for embedding arbitrary data into text using zero-width Unicode characters, making the embedded data completely invisible to users while allowing programmatic extraction. 

**Key Advantage**: This is the **only way** to attach translation IDs or metadata to text that appears in HTML attributes (like `placeholder`, `aria-label`, `title`) or plain text nodes where HTML data attributes cannot be used. Unlike `data-*` attributes which only work on HTML elements, zero-width steganography works anywhere text appears.

It's designed for applications like translation systems, content management, and data hiding where invisible metadata needs to be attached to visible text in any context.

## How It Works

### Steganography

Steganography is the practice of concealing information within other non-secret data. Unlike encryption which makes data unreadable, steganography hides the very existence of the data.

### Zero-Width Characters

Zero-width characters are Unicode characters that have no visual representation but are still part of the text. This library uses:

- `\u200B` (Zero Width Space) - represents binary `0`
- `\u200C` (Zero Width Non-Joiner) - represents binary `1`
- `\u200B\u200C` - Start marker sequence
- `\u200C\u200B` - End marker sequence (reverse)

### Encoding Process

1. Input data is converted to binary (16-bit per character)
2. Each bit is mapped to a zero-width character (0→`\u200B`, 1→`\u200C`)
3. The encoded sequence is wrapped with start/end markers
4. The invisible marker sequence is inserted into the visible text

## Installation

```bash
# Using npm
npm install @fairfox/zws

# Using bun
bun add @fairfox/zws
```

## Usage

### Basic Usage

```typescript
import zws from '@fairfox/zws';

// Embed data invisibly in text
const textWithData = zws.embed('Hello world!', 'secret-id-123');
console.log(textWithData); // Looks like: "Hello world!" (but contains hidden data)

// Check if text has embedded data
console.log(zws.hasEmbeddedData(textWithData)); // true

// Extract hidden data
console.log(zws.extract(textWithData)); // "secret-id-123"

// Get clean text without embedded data
console.log(zws.getCleanText(textWithData)); // "Hello world!"
```

### Browser Usage (ESM)

```html
<!DOCTYPE html>
<html>
<head>
    <title>ZWS Example</title>
</head>
<body>
    <script type="module">
        // Via esm.sh CDN
        import zws from 'https://esm.sh/@fairfox/zws';
        
        const textWithData = zws.embed('Medical instruction', 'instruction-id-456');
        console.log('Has hidden data:', zws.extract(textWithData));
    </script>
</body>
</html>
```

### Translation System Example

The key advantage: embedding translation IDs where HTML data attributes can't be used.

```typescript
import zws from '@fairfox/zws';

// Translation data (display text can contain emojis, IDs cannot)
const translations = {
  "form.title": "User Registration 📝",
  "input.email.placeholder": "Enter your email",
  "input.email.help": "We'll never share your email",
  "input.name.placeholder": "Full name",
  "img.avatar.alt": "User avatar photo",
  "button.save": "Save 💾",
  "button.save.title": "Save your changes",
  "validation.required": "This field is required"
};

function translate(id: string): string {
  return translations[id] || id;
}

// Wrapper that embeds IDs in staging environments
function t(id: string): string {
  const text = translate(id);
  
  // zws.embed() never throws - returns original text on error with warning
  if (process.env.NODE_ENV !== 'production') {
    return zws.embed(text, id);
  }
  
  return text;
}

// ✅ Possible but verbose - requires 100% control over component HTML
// Must manually add data attributes for every translatable piece of text
const traditionalHTML = `
<h1 data-translation-id="form.title">User Registration 📝</h1>
<form>
  <img src="avatar.jpg" 
       alt="User avatar photo"
       data-translation-id-alt="img.avatar.alt" />
  <input 
    type="email" 
    placeholder="Enter your email"
    title="We'll never share your email"
    aria-describedby="email-help"
    data-translation-id-placeholder="input.email.placeholder"
    data-translation-id-title="input.email.help" />
  <div id="email-help" data-translation-id="input.email.help">
    We'll never share your email
  </div>
  <button 
    type="submit" 
    title="Save your changes"
    data-translation-id="button.save"
    data-translation-id-title="button.save.title">
    Save 💾
  </button>
</form>
`;

// ❌ Impossible with component libraries - you don't control the HTML
// Component libraries don't let you add data attributes to internal elements
function ComponentLibraryForm() {
  return (
    <div>
      {/* Can't add data-translation-id to the actual h1 element MUI creates */}
      <Typography variant="h1">{translate("form.title")}</Typography>
      
      {/* Can't add data attributes to the internal input element */}
      <TextField 
        placeholder={translate("input.email.placeholder")}
        title={translate("input.email.help")}
        helperText={translate("input.email.help")} />
        
      {/* Avatar component doesn't expose data attribute props */}
      <Avatar alt={translate("img.avatar.alt")} src="avatar.jpg" />
      
      {/* Button wrapper gets props, but not the internal button element */}
      <Button 
        title={translate("button.save.title")}>
        {translate("button.save")}
      </Button>
    </div>
  );
}

// ✅ Our solution - works everywhere, no HTML pollution
const cleanHTML = `
<h1>${t('form.title')}</h1>
<form>
  <img src="avatar.jpg" alt="${t('img.avatar.alt')}" />
  <input 
    type="email" 
    placeholder="${t('input.email.placeholder')}"
    title="${t('input.email.help')}"
    aria-describedby="email-help" />
  <div id="email-help">${t('input.email.help')}</div>
  <button type="submit" title="${t('button.save.title')}">
    ${t('button.save')}
  </button>
</form>
`;

function CleanComponentForm() {
  return (
    <div>
      <Typography variant="h1">{t("form.title")}</Typography>
      <TextField 
        placeholder={t("input.email.placeholder")}
        title={t("input.email.help")}
        helperText={t("input.email.help")} />
      <Avatar alt={t("img.avatar.alt")} src="avatar.jpg" />
      <Button title={t("button.save.title")}>
        {t("button.save")}
      </Button>
    </div>
  );
}

// Translation tools can extract IDs from any text, anywhere
console.log(zws.extract(t('button.save'))); // "button.save"
console.log(zws.extract(t('img.avatar.alt'))); // "img.avatar.alt"
```

## API Reference

The library exports a single default object `zws` with all methods and constants:

### `zws.embed(text: string, data: string): string`

Embeds data invisibly into text using zero-width characters.

- **Parameters:**
  - `text` - The visible text to embed data into (any Unicode supported)
  - `data` - The data to embed (max 100 characters, Basic Multilingual Plane only)
- **Returns:** Text with invisibly embedded data, or original text unchanged if embedding fails
- **Note:** Never throws - logs warnings on error but returns original text

### `zws.extract(text: string): string`

Extracts embedded data from text.

- **Parameters:**
  - `text` - Text that may contain embedded data
- **Returns:** The extracted data, or empty string `''` if no data is embedded

### `zws.hasEmbeddedData(text: string): boolean`

Checks if text contains embedded data.

- **Parameters:**
  - `text` - Text to check
- **Returns:** `true` if embedded data is present

### `zws.getCleanText(text: string): string`

Removes all embedded data from text, returning clean visible text.

- **Parameters:**
  - `text` - Text to clean
- **Returns:** Text with embedded data removed

### `zws.encodeData(data: string): string`

Low-level function to encode data as zero-width characters.

### `zws.decodeData(encodedBinary: string): string`

Low-level function to decode zero-width characters back to data.

### Constants

- `zws.START_MARKER` - Start marker sequence (`'\u200B\u200C'`)
- `zws.END_MARKER` - End marker sequence (`'\u200C\u200B'`)
- `zws.ZERO_BIT` - Zero bit character (`'\u200B'`)
- `zws.ONE_BIT` - One bit character (`'\u200C'`)
- `zws.MAX_DATA_LENGTH` - Maximum data length (100)
- `zws.MAX_ENCODED_LENGTH` - Maximum encoded length (800)

## Security Features

This library includes security hardening:

### Input Validation
- **Character restrictions**: Only Basic Multilingual Plane (BMP) characters allowed for embedded data
- **Length limits**: Embedded data limited to 100 characters to prevent memory exhaustion
- **Unicode safety**: Blocks emojis, surrogate pairs, and complex Unicode in embedded data
- **Display text**: No restrictions on the display text - any Unicode characters are supported

### Attack Prevention
- **Bounds checking**: Prevents buffer overflow and memory exhaustion attacks
- **Sanitization**: Filters invalid characters from encoded data during decoding
- **Injection protection**: Input validation helps prevent code injection through embedded data

### Tested Edge Cases
The test suite verifies handling of:

- **Multilingual text**: Arabic, Hebrew, Thai, Chinese, Japanese, Korean, etc.
- **Special characters**: Mathematical symbols, scientific notation, musical notation
- **Complex punctuation**: Typographic symbols, currency signs, diacritical marks
- **Corrupted data**: Partial markers, mixed valid/invalid characters
- **Empty data**: Proper handling of empty embedded data
- **Large inputs**: Memory protection against massive strings
- **Unicode edge cases**: RTL marks, zero-width joiners, combining characters

### Security Test Coverage
- **Input validation** - Rejects dangerous characters and oversized data
- **Memory protection** - Bounds checking prevents DoS attacks  
- **Data integrity** - Handles corrupted and malformed embedded data
- **Unicode safety** - Multilingual character support
- **Edge case handling** - Robust behavior with unusual inputs

## Limitations

- **Embedded data size**: Maximum 100 characters per embedded data
- **Embedded data character set**: Limited to Unicode Basic Multilingual Plane (no emojis)
- **Visibility**: While invisible to users, data can be detected programmatically
- **Browser support**: Requires modern browsers with Unicode support

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Alex Jeffcott
