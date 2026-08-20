# Phase 2 Validation

Phase 2 is complete only when the React implementation passes the following checks.

## Structure

- [x] The UI is implemented in React rather than copied as one large HTML block.
- [x] Service status, form, progress, AWS workflow, error, and download concerns have clear component boundaries.
- [x] Components have typed props where props are required.
- [x] The page-level component coordinates state without owning all markup details.
- [x] No real AWS or API Gateway requests are used.

## Visual behavior

- [x] The layout remains a minimal centered dashboard.
- [x] The service status is visible on initial page load.
- [x] The progress labels are SENDING, QUEUED, PROCESSING, and COMPLETED.
- [x] The AWS workflow remains visible and uses friendly wording.
- [x] Future workflow steps are muted.
- [x] Completed steps become visible and the active step is emphasized.
- [x] The download button is disabled before COMPLETED.
- [x] The submit button is disabled while the job is SENDING, PENDING, or PROCESSING.

## Interaction behavior

- [x] Empty or whitespace-only input is rejected.
- [x] The submit button is disabled for empty, whitespace-only, and over-limit input.
- [x] A valid submission enters PENDING.
- [x] Mocked polling advances the state every five seconds.
- [x] The flow reaches PROCESSING and then COMPLETED.
- [x] Polling stops at a terminal state.
- [x] A friendly error banner can be rendered for a failed operation.
- [x] The interface remains usable while a job is in progress.

## Quality

- [x] TypeScript passes.
- [x] Lint passes.
- [x] The production build passes.
- [x] Vitest tests cover the main state transitions.
- [x] React Testing Library tests cover form validation and download-button availability.
- [x] Keyboard navigation and accessible labels work.
- [x] The layout works on narrow screens.


