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

- [x] Refactor the chosen design into focused components.
- [x] Define typed job states and UI state transitions.
- [x] Create components for service status, text form, progress bar, AWS pipeline, error message, and download action.
- [x] Preserve the centered layout and minimal visual language.
- [x] Keep the pipeline explanation accurate and understandable.

## Phase 3 — Real API integration

- [x] Add typed route handlers for status, job submission, job status, and PDF download.
- [x] Connect the browser to same-origin Next.js routes.
- [x] Forward API_KEY only from server-side route handlers.
- [x] Poll real job status every five seconds and stop after a terminal state.
- [x] Enable download only for a completed job.
- [x] Replace mocked responses with real backend responses.

## Phase 4 — Internationalization

- [x] Add a language switch for English and Spanish.
- [x] Translate all user-facing labels, actions, statuses, progress steps, and helper text.
- [x] Preserve the selected language while the user interacts with the mockup.
- [x] Update the production UI and add coverage for switching languages.

Prototype update: [mockup.html](mockup.html)

## Release checklist

- [x] Verify responsive behavior on narrow and wide screens.
- [x] Verify keyboard navigation, labels, contrast, focus behavior, and live status updates.
- [x] Add tests for route handlers and the submit-to-download workflow.
- [x] Run lint and production build checks.
- [ ] Verify Vercel environment variables and perform a deployed smoke test.

## Definition of done

A user can submit text, understand the visible AWS processing flow, observe real job progress, download a completed PDF, and recover from common failures without exposing credentials.

