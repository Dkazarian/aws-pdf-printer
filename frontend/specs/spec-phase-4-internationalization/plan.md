# Phase 4 Plan — Internationalization

## Implementation

- [x] Add a shared English/Spanish locale model with English fallback and separate display labels from API/state values.
- [x] Add an accessible language switch, persist the selected locale, and update the document language metadata.
- [x] Localize every dashboard-facing string while preserving form text, job state, errors, polling, and responsive layout.
- [x] Keep `frontend/specs/mockup.html` aligned with the production UI.
- [x] Add coverage for default locale, switching, persistence, translation coverage, and workflow preservation.
- [x] Run typecheck, lint, tests, and production build.

## Completion handoff

After this phase passes validation, the production dashboard and prototype will support English and Spanish without changing the underlying AWS print workflow.
