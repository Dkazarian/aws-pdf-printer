# Frontend Plan

The frontend will be developed in small, reviewable stages. The visual direction should be settled before production components and API integration are built.

## Phase 1 — HTML/CSS design prototype

- [x] Sketch the centered minimal-dashboard layout.
- [x] Include service status, text input, submit button, progress bar, visible friendly AWS pipeline, error banner, and download action.
- [x] Use SENDING, PENDING, PROCESSING, and COMPLETED.
- [x] Grey out future AWS steps and reveal them as the job advances.
- [x] Add a simple mock interaction with five-second state transitions.
- [x] Review the mockup and decide final visual details.

Prototype: [mockup.html](mockup.html)

## Phase 2 — React component structure

- [ ] Refactor the chosen design into focused components.
- [ ] Define typed job states and UI state transitions.
- [ ] Create components for service status, text form, progress bar, AWS pipeline, error message, and download action.
- [ ] Preserve the centered layout and minimal visual language.
- [ ] Keep the pipeline explanation accurate and understandable.

## Phase 3 — Mocked application behavior

- [ ] Replace the prototype script with mock data and mocked service functions.
- [ ] Simulate service-status loading on page entry only.
- [ ] Simulate submission and polling every five seconds.
- [ ] Simulate PENDING → PROCESSING → COMPLETED.
- [ ] Confirm that a new submission replaces the current job and resets progress.
- [ ] Confirm that failures use a friendly error banner without adding a fifth progress state.
- [ ] Exercise loading, empty, success, and error states before connecting AWS.

## Phase 4 — Real API integration

- [ ] Add typed route handlers for status, job submission, job status, and PDF download.
- [ ] Connect the browser to same-origin Next.js routes.
- [ ] Forward API_KEY only from server-side route handlers.
- [ ] Poll real job status every five seconds and stop after a terminal state.
- [ ] Enable download only for a completed job.
- [ ] Replace mocked responses with real backend responses.

## Phase 5 — Verification and deployment

- [ ] Verify responsive behavior on narrow and wide screens.
- [ ] Verify keyboard navigation, labels, contrast, focus behavior, and live status updates.
- [ ] Add tests for route handlers and the submit-to-download workflow.
- [ ] Run lint and production build checks.
- [ ] Verify Vercel environment variables and perform a deployed smoke test.

## Definition of done

A user can submit text, understand the visible AWS processing flow, observe real job progress, download a completed PDF, and recover from common failures without exposing credentials.

