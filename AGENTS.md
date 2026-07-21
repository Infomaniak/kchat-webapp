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
- **CSS files for styling** — no inline styles, no SCSS for new code; use existing `.css` files unless there's already SCSS or inline styles present; if inline styles are small and you need to add/modify them, transform to CSS stylesheet

## GitLab Review (AgentFlow)

When performing code review via GitLab (AgentFlow):
- **Do not run tooling commands** (tsc, eslint, prettier) — `node_modules` is not available in this environment

## i18n

**13 locales**: `en`, `fr`, `it`, `es`, `de`, `pt`, `sv`, `pl`, `nl`, `el`, `no`, `da`, `fi` — no other languages. Translations must be natural.

## MR / Redmine conventions

When using the `create-mr` skill, follow these rules:

### Redmine ticket reference
- If a Redmine ticket is provided by the user or found in the context:
  - **Append ` [RM-xxxx]`** to the MR title, e.g. `fix(api): Handle null response [RM-1234]`
  - **Include the full Redmine URL** in the Resources section of the MR description
- If no Redmine ticket is provided, **omit the suffix entirely** — do not add brackets with nothing inside

### GitLab MR Template
- **Template location**: `.gitlab/merge_request_templates/Default.md`
- **Always load this template first** before building the MR description

## Scope Control

- Fix **only** what is asked for
- Must not modify **any adjacent behavior**
- No side effects allowed
- Only the **minimal patch**, no explanations
