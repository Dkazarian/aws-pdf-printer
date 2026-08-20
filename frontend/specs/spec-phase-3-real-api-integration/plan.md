# Phase 3 Plan — Real API Integration

## Group 1 — Define the integration boundary

- [x] Confirm the typed service, submission, status, and result contracts.
- [x] Add a small server-side upstream client or shared request helper.
- [x] Normalize API Gateway and Lambda response fields at the route boundary.
- [x] Define consistent handling for non-2xx responses, invalid JSON, and network failures.
- [x] Define a typed rate-limit error for HTTP 429 responses, including an optional safe retry delay.

## Group 2 — Implement same-origin route handlers

- [x] Implement `GET /api/status`.
- [x] Implement `POST /api/jobs` with JSON body validation.
- [x] Implement `GET /api/jobs/[jobId]`.
- [x] Implement `GET /api/jobs/[jobId]/result` as a PDF passthrough.
- [x] Forward `x-api-key` only from server-side code.
- [x] Use no-store caching for dynamic status responses.
- [x] Preserve 429 status handling and `Retry-After` without exposing upstream internals.

## Group 3 — Replace mocked browser behavior

- [x] Replace `getMockServiceStatus` with the same-origin status request.
- [x] Replace `submitMockJob` with the same-origin job submission request.
- [x] Replace `getMockJobStatus` with the same-origin polling request.
- [x] Update the download action to request the same-origin result route.
- [x] Poll `PENDING` jobs every five seconds.
- [x] Poll `PROCESSING` jobs every ten seconds.
- [x] Stop polling at terminal states.
- [x] Preserve reset behavior when a new submission starts.
- [x] Preserve friendly error-banner behavior.
- [x] Reset failed submissions and failed jobs to `NONE` so the submit button becomes usable again.
- [x] Silently back off after a rate-limited status poll instead of showing an error or retrying immediately.

## Group 4 — Test and verify

- [x] Test each route handler's success and failure responses.
- [x] Test that API keys are not included in client bundles or response bodies.
- [x] Test request payload and response-field mapping.
- [x] Test the submit → poll → complete → download workflow.
- [x] Test failed jobs, missing jobs, unavailable results, and upstream outages.
- [x] Test that submission and job failures re-enable the submit button while preserving the error banner.
- [x] Test HTTP 429 responses during status checks and polling.
- [x] Test that a rate-limited status poll does not show an error, clear the active job, crash the page, or create a tight retry loop.
- [x] Test polling cleanup when the component unmounts or the job completes.
- [x] Run typecheck, lint, tests, and production build.

## Completion handoff

After this phase passes validation, the frontend will use the deployed API-backed workflow and be ready for the release checklist.
