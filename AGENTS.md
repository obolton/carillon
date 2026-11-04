# Carillon

Carillon provides reactive values and collections for TypeScript, with explicit subscriptions. The library has no runtime dependencies and is published to npm as `carillon`.

## Dependencies

- Use `pnpm` for dependency management and scripts.
- The library has no runtime dependencies. Keep it that way.
- `oxlint` and `oxlint-tsgolint` must be upgraded together.

## Workflow

- After making changes, run `pnpm check` to check types, linting and formatting, run the tests and build the package.
- Fix any failures reported and re-run until the checks pass.
- Formatting failures can be auto-fixed with `pnpm format`.

## Scripts

**Note**: Always use `pnpm` for running scripts. Do not use `npm` or `npx`.

- `pnpm check`: Run all status checks in sequence (typecheck, lint, format, tests, build), stopping at the first failure.
- `pnpm typecheck`: Check types.
- `pnpm lint`: Lint TypeScript files.
- `pnpm format`: Format files with oxfmt.
- `pnpm format:check`: Check formatting without writing changes.
- `pnpm test`: Run unit tests with Vitest.
- `pnpm test:coverage`: Run unit tests and report coverage.
- `pnpm build`: Build the package into `dist`.
- `pnpm dev`: Rebuild the package on changes.

## Coding Style

- Use TypeScript with ES modules and two-space indentation.
- Comments should be terse and used sparingly.
- Avoid type assertions (e.g. the `!` operator and `as type`) in favor of more type-safe options where possible.
- The library targets ES2025 and runs in Node 22+ and modern browsers. Do not add polyfills or Node-only APIs.

## Testing Guidelines

- Use Vitest for unit tests.
- Colocate test files with code in `__tests__` directories, using `__tests__/*.test.ts` files.
- Use `describe` blocks for each function being tested and to provide structure to test suites.
- Run tests with `pnpm test` and check coverage with `pnpm test:coverage`.

## Publishing

- `pnpm build` bundles creates `dist/` with `tsdown` and validates the package.
- Bump `version` in `package.json` before publishing.
