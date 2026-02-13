# AGENTS.md

Context brain for AI agents working on kChat repository.

---

## 1. Project Summary

**kChat** is Infomaniak's messaging platform for teams, integrated into the kSuite. Originally forked from Mattermost, it is now a **hard fork** — an independent codebase with no upstream sync obligation.

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
- **Imports**: Prefer destructuring, absolute imports from `components/`, `utils/`, etc.
- **Components**: Functional components with hooks, Redux `connect()` for class components
- **Preferred libraries**: Lodash (already bundled), date-fns for dates, luxon for timezones

### Code Rules

- **No comments** except when genuinely necessary for complex logic
- **No dead code**
- **No useless abstractions**
- **Code must be** clean, idiomatic, readable

### Build Quality

- `tsc -b`: zero errors
- `eslint`: zero warnings
- Clean, idiomatic, readable code

### Testing

- **Extension**: `.test.ts(x)`
- **Test function**: Always use `it()` (not `test()`)
- **Location**: Co-located with source or in `tests/` folders
- **Required coverage**: All patches must be covered
- All tests must pass

### i18n (Internationalization)

**Required locales**: `en`, `fr`, `it`, `es`, `de`
- JSON files in `webapp/channels/src/i18n/`
- Use `react-intl` with `FormattedMessage` component
- Extract strings: `npm run i18n-extract`
- Check missing: `npm run i18n:missing`
- No other languages
- Translations must be natural

### Scope Control

- Fix **only** what is asked for
- Must not modify **any adjacent behavior**
- No side effects allowed

### Output

- Only the **minimal patch**
- No explanations

### Finalization Process

- After code is delivered, wait for developer confirmation that it's correct
- Once validated, **ask**: *"Would you like me to do a code review before finalizing?"*
- If accepted, perform a **senior-level code review** using the following criteria:

#### Code Review Prompt

> Review this patch as a senior software engineer with high standards. Be concise and actionable. Flag only real issues, not style nitpicks already covered by linting.
>
> Check for:
> - **Correctness**: Logic errors, off-by-one, race conditions, unhandled edge cases, null/undefined risks
> - **Security**: XSS, injection, unsafe data handling, leaked secrets, improper auth checks
> - **Performance**: Unnecessary re-renders, missing memoization, expensive operations in hot paths, n+1 queries
> - **Maintainability**: Unclear naming, overly clever code, missing types, leaky abstractions
> - **Testing gaps**: Untested branches, missing error cases, brittle assertions
> - **React/Redux specifics**: Incorrect hook dependencies, stale closures, selector recomputation, missing cleanup in effects
>
> For each issue found:
> 1. Severity: 🔴 must fix / 🟡 should fix / 🟢 suggestion
> 2. File and location
> 3. What's wrong (one sentence)
> 4. How to fix (one sentence)
>
> If the code is clean, say so. Do not invent problems.

- Apply any 🔴 and 🟡 fixes, then present the updated patch
- Once everything is clean, produce **in your response**:
  - **MR title in English** (Conventional Commit format)
  - **MR description in French**
  - **Changelog in English** (single short sentence)
- All three must follow **Conventional Commits** (e.g., `feat:`, `fix:`, `refactor:`, `test:`, etc.)

### Learned Preferences

- **No dead code or unused abstractions**
- **No git operations**: Never create commits or mention branches/MRs in code
- **Output**: Provide minimal patch only, no explanations

---

## 4. Self-correction

This section is for you, the future agent.

1. **Stale Map**: If you encounter a file or folder not listed in the "Context Map", update the map in this file.
2. **New Norms**: If the user corrects you (e.g., "Don't use X, use Y"), add that rule to the "Local norms" section immediately so you don't make the mistake again.
3. **Refinement**: If you find this file is too verbose, prune it. Keep it high-signal.