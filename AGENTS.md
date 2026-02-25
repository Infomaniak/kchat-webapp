# AGENTS.md

## Code Rules

- Follow existing patterns and conventions in the codebase
- **Functional components only** with hooks — no class components, no `connect()`
- **No comments** except when genuinely necessary for complex logic
- **No dead code**
- **No useless abstractions**
- **Code must be** clean, idiomatic, readable

## i18n

**5 locales only**: `en`, `fr`, `it`, `es`, `de` — no other languages. Translations must be natural.

## Scope Control

- Fix **only** what is asked for
- Must not modify **any adjacent behavior**
- No side effects allowed
- Only the **minimal patch**, no explanations

## Finalization ("MR detail")

When asked for "MR detail", produce:

### MR Title

In **English**, Conventional Commit format (e.g. `fix(component): description`).

### MR Description

In **French**, suivre **tous les champs** du template `.gitlab/merge_request_templates/Default.md`. Laisser vides les sections Ticket Link et Screenshots.
Le contenu doit etre **fonctionnel** : expliquer ce que fait la MR du point de vue utilisateur/produit.
Expliquer les choix d'architecture/technique **uniquement si c'est complexe**. Ne pas lister les fichiers modifies.

**Format de sortie** : produire le titre en texte dans la reponse, puis copier la description (incluant les commandes GitLab) dans le presse-papier via `pbcopy`.
