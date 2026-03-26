# AGENTS.md

## Code Rules

- Follow existing patterns and conventions in the codebase
- **Functional components only** — hooks, no class components, no `connect()`
- **No comments** — code should be self-documenting; introduce named variables/functions or pattern if needed
- **No dead code, no unused imports**
- **No premature abstractions** — abstract only when a pattern repeats
- **Clean, idiomatic, readable code** — apply SOLID principles where relevant
- Drop `ik.test` convention
- Drop `IK:` comments

## i18n

**13 locales**: `en`, `fr`, `it`, `es`, `de`, `pt-BR`, `sv`, `pl`, `nl`, `el`, `no`, `da`, `fi` — no other languages. Translations must be natural.

## Scope Control

- Fix **only** what is asked for
- Must not modify **any adjacent behavior**
- No side effects allowed
- Only the **minimal patch**, no explanations
