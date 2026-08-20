# Phase 4 Validation

Phase 4 is complete only when the production UI and mockup provide consistent English and Spanish experiences without changing print-job behavior.

- [x] English is the default; valid locale preferences persist; invalid preferences fall back to English.
- [x] The switch changes between English and Spanish, exposes selected state accessibly, and updates `document.documentElement.lang`.
- [x] All dashboard-facing copy is translated, including form, progress, workflow, errors, success, and download UI.
- [x] API values and workflow state identifiers remain unchanged.
- [x] Switching language preserves entered text, active job state, polling, errors, and mockup progress.
- [x] Keyboard access, focus, contrast, labels, live regions, and narrow-layout behavior remain valid in both languages.
- [x] Locale tests, existing tests, typecheck, lint, and production build pass.
