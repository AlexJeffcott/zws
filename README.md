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

// Wrapper that embeds IDs in staging environments.
// embed() throws on invalid input (oversized data, astral characters, or
// already-embedded text); guard accordingly when wrapping arbitrary content.
function t(id: string): string {
  const text = translate(id);
  if (process.env.NODE_ENV === 'production') return text;
  if (zws.hasEmbeddedData(text)) return text;
  try {
    return zws.embed(text, id);
  } catch {
    return text;
  }
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

The library exports a single default object `zws` with all methods and constants. Named type exports `EmbedOptions` and `EmbedPosition` are also available.

### `zws.embed(text, data, options?)`

```ts
embed(text: string, data: string, options?: EmbedOptions): string
```

Embeds `data` invisibly into `text`. Returns the text with the embedded marker appended.

- `data` must be at most `MAX_DATA_LENGTH` (100) characters and contain only Basic Multilingual Plane code points.
- `options.position` (default `'end'`) controls where the marker is inserted: `'end'` appends; `'after-first-sentence'` inserts after the first `[.!?]` followed by whitespace, falling back to `'end'` when none is found.
- Throws if `text` already contains embedded data, or if `data` violates the length or BMP constraint.

### `zws.extract(text)`

```ts
extract(text: string): string
```

Returns the first embedded payload, or `''` if `text` has no embedded data or the markers do not enclose a valid bit sequence. Throws if a valid marker pair is found but the encoded body exceeds `MAX_ENCODED_LENGTH`.

### `zws.extractAll(text)`

```ts
extractAll(text: string): string[]
```

Returns every embedded payload in document order. Returns `[]` if no embedded data is present. Same throw conditions as `extract` apply per payload.

### `zws.hasEmbeddedData(text)`

```ts
hasEmbeddedData(text: string): boolean
```

`true` if `text` contains the start-marker sequence.

### `zws.getCleanText(text)`

```ts
getCleanText(text: string): string
```

Returns `text` with every embedded marker pair removed. Other zero-width characters (ZWJ, RTL marks, etc.) are preserved.

### `zws.encodeData(data)` / `zws.decodeData(encodedBinary)`

Low-level encoders. `encodeData` throws on oversized or non-BMP input; `decodeData` throws when given more than `MAX_ENCODED_LENGTH` characters.

### Constants

| Constant | Value |
|---|---|
| `zws.START_MARKER` | `'\u200B\u200C'` |
| `zws.END_MARKER` | `'\u200C\u200B'` |
| `zws.ZERO_BIT` | `'\u200B'` |
| `zws.ONE_BIT` | `'\u200C'` |
| `zws.MAX_DATA_LENGTH` | `100` |
| `zws.MAX_ENCODED_LENGTH` | `1600` |

## Migration from 1.x

Version 2 cleans up the public contract. Callers upgrading from 1.x should expect the following changes:

- **`embed` throws on errors.** Previously, oversized data, astral characters, or already-embedded input produced a `console.warn` and returned the original text. The library now throws `Error`. Wrap calls in `try`/`catch`, or pre-validate with `hasEmbeddedData` and length checks.
- **`embed`'s default insertion point is `'end'`.** Previous versions inserted after the first sentence terminator. To preserve that behaviour, pass `{ position: 'after-first-sentence' }`.
- **`extract` throws when an embedded payload exceeds `MAX_ENCODED_LENGTH`.** Previously this returned `''` with a warning. Returning `''` is now reserved for the genuinely-no-data case.
- **No input coercion.** Passing non-strings to any function now throws `TypeError`. The TypeScript signatures required `string` already; this aligns runtime with types.
- **New `extractAll` method.** Use this when a single `text` may carry several embedded payloads.

## Limitations

- Embedded data is capped at 100 characters and must lie within the Basic Multilingual Plane (no astral code points, no emoji).
- Embedded data is invisible but trivially detectable: this is steganography, not encryption.
- Concatenating two embeds whose visible portions are both empty (`embed('', x) + embed('', y)`) produces a sequence the extractor can decode but the boundary between payloads is lost. Insert any non-zero-width character between such embeds, or supply non-empty visible text.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Alex Jeffcott
