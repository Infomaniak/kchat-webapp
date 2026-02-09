# AGENTS.md

Context brain for AI agents working on kChat repository.

---

## 1. Project Summary

**kChat** is Infomaniak's fork of Mattermost, a professional messaging platform for teams, integrated into the kSuite.

### High-Level Tech Stack

- **Frontend**: TypeScript 5.6.3, React 17.0.2, Redux 4.2.0, React-Intl (i18n), React-Router 5.3.4, Webpack 5.93.0, Jest 29.7.0
- **Backend**: Go 1.23.0 (Gin/Gorilla Mux)
- **Monorepo**: Yarn 4.0.1 workspaces
- **UI**: SCSS, styled-components, MUI 5.11.16, custom Compass components (@infomaniak/compass-*)
- **Testing**: Jest (unit), Cypress & Playwright (E2E)

---

## 2. Context Map

```
/
├── api/                          # OpenAPI specs and API definitions
│   └── server/
│       └── v4/                   # API v4 endpoints documentation
├── e2e-tests/
│   ├── cypress/                  # Cypress E2E tests
│   └── playwright/               # Playwright E2E tests
├── server/                       # Go backend server
│   ├── api4/                     # HTTP API handlers (v4)
│   ├── channels/                 # Business logic / App layer
│   ├── platform/                 # Platform services layer
│   ├── cmd/                      # CLI tools (mmctl, etc.)
│   ├── public/                   # Public models/exports
│   └── enterprise/               # Enterprise features (private)
├── webapp/                       # Frontend monorepo
│   ├── channels/                 # Main React web application
│   │   ├── src/
│   │   │   ├── components/       # React components
│   │   │   ├── actions/          # Redux action creators
│   │   │   ├── reducers/         # Redux reducers
│   │   │   ├── selectors/        # Redux selectors
│   │   │   ├── stores/           # Redux store config
│   │   │   ├── utils/            # Utility functions
│   │   │   ├── i18n/             # Translation files (JSON)
│   │   │   ├── sass/             # Global styles (SCSS)
│   │   │   └── types/            # TypeScript definitions
│   │   └── jest.config.js
│   └── platform/
│       ├── client/               # API client SDK (@infomaniak/mattermost-client)
│       ├── components/           # Shared UI components (@mattermost/components)
│       ├── mattermost-redux/     # Redux state management package
│       ├── types/                # Shared TypeScript types (@infomaniak/mattermost-types)
│       └── eslint-plugin/        # Custom ESLint rules
├── tools/                        # Build and utility scripts
├── dist/                         # Build output directory
└── CHANGELOG.md                  # Infomaniak changelog
```

---

## 3. Local Norms

### Command Patterns

```bash
# Dev server (Webpack dev-server on localhost:8065)
yarn dev-server:webapp

# Build production bundle
yarn build:webapp

# Run all tests
yarn test:webapp

# Type checking
yarn test:types
# or
cd webapp/channels && npx tsc -b

# Linting
yarn workspace mattermost-webapp check:eslint
yarn workspace mattermost-webapp check:stylelint

# i18n extract/update
cd webapp/channels && npm run i18n-extract

# Build dependencies before dev
yarn build:dependencies
```

### Code Style

- **TypeScript/React**: PascalCase for components, camelCase for variables/functions
- **Files**: kebab-case for component files (e.g., `post_component.tsx`)
- **Testing**: `.ik.test.ts` or `.ik.test.tsx` for Infomaniak custom tests
- **No comments except**: `IK:` prefixed comments to explain custom modifications
- **Imports**: Prefer destructuring, absolute imports from `components/`, `utils/`, etc.
- **Components**: Functional components with hooks, Redux `connect()` for class components
- **Preferred libraries**: Lodash (already bundled), date-fns for dates, luxon for timezones

### Code Rules

- **No comments** except `IK:` prefixed comments
- **No dead code**
- **No useless abstractions**
- **Code must be** clean, idiomatic, readable

### Build Quality

- `tsc -b`: zero errors
- `eslint`: zero warnings
- Clean, idiomatic, readable code

### Testing

- **Custom tests**: Use `.ik.test.ts(x)` extension
- **Test function**: Always use `it()` (not `test()`)
- **Location**: Co-located with source or in `tests/` folders
- **Required coverage**: Custom patches must be covered
- **Upstream tests**: Must not regress
- **Running**: `jest --testPathPattern=".ik.test"` for custom tests only
- **Tests must cover**:
  - The custom feature or bug
  - Upstream non-regression
- All tests must pass

### i18n (Internationalization)

**Required locales**: `en`, `fr`, `it`, `es`, `de`
- JSON files in `webapp/channels/src/i18n/`
- Use `react-intl` with `FormattedMessage` component
- Extract strings: `npm run i18n-extract`
- Check missing: `npm run i18n:missing`
- No other languages
- Translations must be natural

### Scope Control (Ultra-controlled Scope)

- Fix **only** what is asked for
- Must not modify **any adjacent behavior**
- No side effects allowed

### Upstream-First Policy

- Before any implementation, **search Mattermost upstream issues and PRs**
- If a solution exists upstream, **request a cherry-pick**
- Otherwise, implement a local **minimal, isolated, upstream-aligned patch**
- No large rewrites, no unrequested refactors

### Strategy Priority

1. Cherry-pick from upstream
2. Minimize lines modified
3. Make it easy to delete when upstream fixes

### Bugfix Upstream Policy

- Issues + PRs must be reviewed
- Cherry-pick if possible
- Otherwise minimal local patch

### App Stream Compatibility

- If custom code breaks App Stream tests:
  - Must be **disabled via a flag or targeted isolation**
  - Add a **`IK:`** prefixed comment explaining the issue
- **These comments are the only exception allowed**

### Output

- Only the **minimal patch**
- No explanations

### Finalization Process

- After code is delivered, wait for developer confirmation that it's correct
- Once validated, produce **in your response**:
  - **MR title in English** (Conventional Commit format)
  - **MR description in French**
  - **Changelog in English** (single short sentence)
- All three must follow **Conventional Commits** (e.g., `feat:`, `fix:`, `refactor:`, `test:`, etc.)

### Learned Preferences

- **Upstream-first**: Check Mattermost issues/PRs before implementing custom code
- **Minimal patches**: Prefer cherry-picks from upstream, otherwise minimal isolated patches
- **No dead code or unused abstractions**
- **No git operations**: Never create commits or mention branches/MRs in code
- **App Stream compatibility**: If custom code breaks upstream tests, isolate with feature flag + add `IK:` comment
- **Output**: Provide minimal patch only, no explanations

---

## 4. Self-correction

This section is for you, the future agent.

1. **Stale Map**: If you encounter a file or folder not listed in the "Context Map", update the map in this file.
2. **New Norms**: If the user corrects you (e.g., "Don't use X, use Y"), add that rule to the "Local norms" section immediately so you don't make the mistake again.
3. **Refinement**: If you find this file is too verbose, prune it. Keep it high-signal.
