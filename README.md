# AIP Svelte Filter - Google API Filter Parser (AIP-160)

A headless Svelte utility and parser for [Google API filter expressions](https://google.aip.dev/160), using a Peggy grammar. This module provides parsing, validation, and AST utilities for Google-style filter strings, suitable for use in Svelte apps or as a standalone JS utility.

## Features

- Parses Google API filter expressions (AIP-160)
- Returns AST, error, and validity
- Pretty-prints AST
- Headless Svelte component for easy integration
- **SSR Compatible** - Works with SvelteKit and other SSR frameworks

## Usage (JS/TS)

```ts
import { parse, prettyPrintAst, summarizeGrammar } from "./parser";

const result = parse('post = "posts/1234-1234-1234-1234"');
if (result.isSuccess) {
  console.log("AST:", result.ast);
  console.log("Pretty:", prettyPrintAst(result.ast));
  console.log("Summary:", summarizeGrammar(result.ast));
} else {
  console.error("Parse error:", result.errors);
}
```

## Usage (Svelte Headless Component)

```svelte
<script lang="ts">
  import FilterParser from './FilterParser.svelte';
  let filter = 'post = "posts/1234-1234-1234-1234"';
</script>

<FilterParser {filter} let:ast let:isValid let:error let:prettyAst let:summary />
```

## API

### `parse(input: string): ParseResult`

- Parses a filter string, returns `{ isSuccess, errors, ast }`.

### `prettyPrintAst(ast: any): string`

- Returns a pretty-printed string of the AST.

### `summarizeGrammar(ast: any): string`

- Returns a summary string for the AST.

### `<FilterParser filter={string} let:ast let:isValid let:error let:prettyAst let:summary />`

- Svelte headless component. All values are reactive.

## SSR Compatibility

This package is fully compatible with server-side rendering (SSR) environments like SvelteKit. The parser functions work in both Node.js and browser environments, and the FilterParser component is designed to be SSR-safe.

### SvelteKit Usage

```svelte
<script lang="ts">
  import { parse } from 'aip-svelte-filter';
  import FilterParser from 'aip-svelte-filter/FilterParser.svelte';

  let filter = 'name = "example"';

  // This works in both SSR and client-side
  const result = parse(filter);
</script>

<!-- This component is SSR-safe -->
<FilterParser {filter} let:ast let:isValid let:error>
  {#if isValid}
    <p>Filter is valid!</p>
  {:else}
    <p>Error: {error}</p>
  {/if}
</FilterParser>
```

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/stevenklar/aip-svelte-filter.git
cd aip-svelte-filter
npm install
```

### Building

```bash
# Build the grammar file
npm run build:grammar

# Build the package
npm run build
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting and Type Checking

```bash
# Type check
npm run check

# Lint code
npm run lint

# Format code
npm run format
```

### CI/CD

The project uses GitHub Actions for continuous integration:

- **CI Pipeline**: Runs tests, linting, and builds on Node.js 18, 20, and 22
- **Release Pipeline**: Automatically publishes to npm when a release is created
- **Dependabot**: Automatically updates dependencies weekly

---

MIT License.
