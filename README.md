# @fairfox/zws

Embed short metadata invisibly inside any text using zero-width Unicode characters. Recover it programmatically. The visible text is unchanged.

```ts
import zws from '@fairfox/zws'

const tagged = zws.embed('Save', 'button.save')
// → "Save" plus 34 invisible characters
zws.extract(tagged)        // → "button.save"
zws.getCleanText(tagged)   // → "Save"
```

The embed survives every text channel that preserves zero-width characters: HTML attributes, JSX children, plain text in databases, copy-paste between most editors, JSON serialisation. It does not survive any pipeline that strips them — see [Risks & Considerations](#risks--considerations).

## Installation

```bash
npm install @fairfox/zws
# or
bun add @fairfox/zws
```

ESM-only. Requires a runtime that supports `import`.

## Use Cases

The library is most useful when you need to attach a short identifier to visible text and there is no other place to put it.

### Translation / i18n IDs in component-library output

When a UI is built from third-party components, you don't control the rendered HTML. You can pass a `placeholder` or `aria-label` string, but you can't add a `data-translation-id` attribute to the `<input>` the component will create. Embedding the ID in the string itself sidesteps the problem.

```ts
function t(id: string): string {
  const text = translations[id] ?? id
  if (process.env.NODE_ENV === 'production') return text
  if (zws.hasEmbeddedData(text)) return text
  try {
    return zws.embed(text, id)
  } catch {
    return text
  }
}

// Anywhere a translated string ends up — input value, alt text,
// button label, screenshot copy — translation tooling can recover the ID:
zws.extract(t('button.save'))   // → "button.save"
```

### Provenance for AI-generated text

Tag a model's output with the model name, prompt hash, or generation ID so the same text remains traceable when it is pasted into a support ticket, a screenshot's transcript, or scraped from a logging system.

```ts
const generated = `Here is your summary: ${assistantOutput}`
const provenance = `${modelName}:${promptHash}`
const tagged = zws.embed(generated, provenance)
```

### Content attribution in headless CMS rendering

Each rendered field carries the document and revision IDs that produced it. Editors and support tooling can hover or paste a snippet into a debug tool and see exactly which CMS record produced it, with no extra request to the CMS.

### A/B test variant tracking

Tag visible content with the experiment variant assigned to the user. When a screenshot, support ticket, or analytics event quotes that text, the variant is recoverable.

### Canary tokens for leak detection

Send the same announcement text to N recipients with N distinct embedded IDs. If the text appears outside the intended channel, the embedded ID identifies the source. (Caveat: only works against recipients who copy-paste rather than retype, and only across pipelines that preserve zero-width characters.)

### Workflow / approval state on copy-pasted documents

Embed the workflow stage, template version, or approver ID into a generated document. If a user pastes the document into another tool to share, the metadata travels with it.

## How It Works

### Steganography, briefly

Steganography conceals information by hiding its existence within innocuous-looking carrier data. This library does the same with zero-width Unicode characters: each character represents a bit, and the resulting bit string is invisible because none of the carrier characters has a glyph.

It is **not** encryption. Anyone who knows or can guess the format can read the embedded data.

### Wire format

Each embed is laid out as:

```
START_MARKER  LENGTH_PREFIX  PAYLOAD
   2 chars      16 chars      N × 16 chars
```

- **Start marker** — the two-character sequence `\u200B\u200C` (zero-width space then zero-width non-joiner). Signals the beginning of an embed.
- **Length prefix** — sixteen `\u200B`/`\u200C` characters encoding `N`, the number of payload characters, big-endian. `N` is bounded by `MAX_DATA_LENGTH` (100); candidates with a larger declared length are skipped.
- **Payload** — `N × 16` characters: each input character is its 16-bit Unicode code point, with `\u200B` for `0` and `\u200C` for `1`. Non-BMP code points are rejected at encode time.

There is no end marker. The decoder reads the length, consumes exactly that many payload bits, and stops. This is what lets `embed('', x) + embed('', y)` decode unambiguously back to two separate payloads — earlier versions of this library used an end-marker scheme that became ambiguous in this case because the marker characters were drawn from the same alphabet as the payload bits.

### Worked example

Embedding the single character `a` (`U+0061`) into a host string:

- Length prefix: `1` → `0000000000000001` → `\u200B`×15, `\u200C`
- Payload: `a` → `0000000001100001` → `\u200B`×9, `\u200C`×2, `\u200B`×4, `\u200C`
- Total: 2 + 16 + 16 = **34 zero-width characters** appended to the host.

## API Reference

The library exports a single default object `zws` with all methods and constants. The named type exports `EmbedOptions` and `EmbedPosition` are available alongside.

### `zws.embed(text, data, options?)`

```ts
embed(text: string, data: string, options?: EmbedOptions): string
```

Embeds `data` invisibly into `text` and returns the combined string.

- `data` must be at most `MAX_DATA_LENGTH` (100) characters and contain only Basic Multilingual Plane code points.
- `options.position` (default `'end'`) controls where the marker is inserted. `'end'` appends. `'after-first-sentence'` inserts after the first `[.!?]` followed by whitespace, falling back to `'end'` when none is found.
- Throws if `text` already contains embedded data, if `data` exceeds the length cap, or if `data` contains a non-BMP code point.

### `zws.extract(text)`

```ts
extract(text: string): string
```

Returns the first embedded payload, or `''` if `text` has no embedded data or no well-formed candidate is found. Candidates with malformed length prefixes, oversized declared lengths, truncated payloads, or non-bit-class characters in the payload region are skipped.

### `zws.extractAll(text)`

```ts
extractAll(text: string): string[]
```

Returns every well-formed embedded payload in document order. Returns `[]` if none are present. Malformed candidates are skipped silently.

### `zws.hasEmbeddedData(text)`

```ts
hasEmbeddedData(text: string): boolean
```

`true` if `text` contains the start-marker sequence. Cheap structural check; does not validate the payload.

### `zws.getCleanText(text)`

```ts
getCleanText(text: string): string
```

Returns `text` with every well-formed embed removed. Other zero-width characters (ZWJ, RTL marks, etc.) are preserved. A standalone start marker without a valid following payload is left in place.

### `zws.encodeData(data)` / `zws.decodeData(encodedBinary)`

Low-level encoders. `encodeData` throws on oversized or non-BMP input. `decodeData` throws when given more than `MAX_ENCODED_LENGTH` characters. Most callers should use `embed` and `extract` instead.

### Constants

| Constant | Value |
|---|---|
| `zws.START_MARKER` | `'\u200B\u200C'` |
| `zws.ZERO_BIT` | `'\u200B'` |
| `zws.ONE_BIT` | `'\u200C'` |
| `zws.MAX_DATA_LENGTH` | `100` |
| `zws.MAX_ENCODED_LENGTH` | `1600` (only relevant when calling `decodeData` directly) |

## Risks & Considerations

The technology is small, but the surface area for misuse and surprise is real. Read this section before deploying.

### It is not encryption

Anyone who has this library or recognises the format can decode the embedded data. Do not embed secrets, session tokens, credentials, or anything you would not be comfortable with the recipient seeing.

### LLMs and text-processing tools see the embedded characters

Any pipeline that operates on the text — including language models, search indexers, spell checkers, translators, and copy-paste handlers — receives the zero-width characters along with the visible text. Embedded data may leak through any of them. If you ask an LLM to summarise a document containing an embed, the LLM can read the embed.

### Many pipelines strip zero-width characters

HTML sanitisers, search-engine indexers, plain-text email clients, RTF and Office paste paths, terminal emulators, and many text normalisers remove zero-width characters as a matter of course. The embed will not survive these. Verify the round-trip in your specific pipeline before relying on it.

### The technology can carry payloads through naive content filters

The same property that makes the library useful — passing arbitrary text through a text-handling system invisibly — means it can smuggle content through content filters that only inspect the visible text. If your system accepts user-submitted text and forwards it to a downstream consumer that interprets text (a code executor, a markup renderer, a script context, a moderation queue), strip zero-width characters at the trust boundary using `getCleanText` or a generic regex such as `/[\u200B\u200C\u200D\uFEFF]/g`.

### The presence of an embed is detectable

Anyone running `text.includes('\u200B\u200C')` (or inspecting the raw bytes) can see that something is embedded. The library hides existence-from-casual-observation, not existence-from-anyone-looking.

### Tracking and privacy implications

Embedding user IDs, session identifiers, or other personal data into text that may be shared, screenshotted, or copy-pasted is a tracking surface that the user may not be aware of. In jurisdictions with data-protection regulation (GDPR, CCPA, etc.), invisible identifiers attached to user-facing content may carry consent and disclosure obligations. Treat the embed as a serialisation channel for data the user has knowingly emitted, not as a covert tag.

### Accessibility

Some screen readers and assistive technologies handle zero-width characters inconsistently. A reader that announces them as `space` or skips characters around them can produce confusing output. Test in the contexts where users with assistive tech will encounter your text.

### Length cap

100 BMP characters per embed. The library is for short identifiers, not general data hiding. Astral code points (most emoji, historic scripts, mathematical alphanumerics) are rejected at encode time because they require surrogate pairs, which complicates the decoder for negligible benefit.

### Errors are now thrown, not swallowed

`embed` and `extract` propagate errors instead of warning and returning silently. Callers must handle them. See [Migration from 1.x](#migration-from-1x).

## Migration from 1.x

Version 2 cleans up the public contract. Callers upgrading from 1.x should expect:

- **`embed` throws on errors.** Previously, oversized data, astral characters, or already-embedded input produced a `console.warn` and returned the original text. The library now throws `Error`. Wrap calls in `try`/`catch`, or pre-validate with `hasEmbeddedData` and length checks.
- **`embed`'s default insertion point is `'end'`.** Previous versions inserted after the first sentence terminator. To preserve that behaviour, pass `{ position: 'after-first-sentence' }`.
- **Wire format changed.** Embeds are now `start marker + 16-bit length + payload bits`, with no end marker. Text embedded by 1.x cannot be extracted by 2.x and vice versa. The `END_MARKER` constant has been removed from the public namespace.
- **No input coercion.** Passing non-strings to any function now throws `TypeError`. The TypeScript signatures already required `string`; this aligns runtime with types.
- **New `extractAll` method.** Use this when a single `text` may carry several embedded payloads.

## License

MIT — see [LICENSE](LICENSE).
