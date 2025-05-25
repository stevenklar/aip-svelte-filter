# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2024-12-19

### Fixed

- **SSR Compatibility**: Fixed "document is not defined" error during server-side rendering
  - Properly externalized Svelte dependencies to prevent bundling of browser-specific code
  - Updated package exports to provide source `.svelte` files for better SSR compatibility
  - The FilterParser component now works correctly in SSR environments like SvelteKit

### Changed

- Updated Vite configuration to properly externalize Svelte runtime dependencies
- Package now exports source `.svelte` files instead of compiled versions for the FilterParser component

## [1.0.1] - Previous Release

### Added

- Initial release with Google API filter parser
- FilterParser Svelte component for headless filter parsing
- Support for AIP-160 filter expressions
