# Phase 3 Requirements — Real API Integration

## Objective

Replace the Phase 2 mock service functions with same-origin Next.js route handlers that call the deployed API Gateway printer service. Preserve the existing dashboard, typed workflow, polling behavior, and friendly error experience.

This phase connects the frontend to AWS. It does not change the AWS infrastructure or Lambda business logic.

## Required routes

The browser must call same-origin routes only:

| Browser route | Method | Upstream API route | Purpose |
| --- | --- | --- | --- |
| `/api/status` | GET | `/status` | Check service availability. |
| `/api/jobs` | POST | `/jobs` | Create a print job. |
| `/api/jobs/[jobId]` | GET | `/jobs/{jobId}` | Read job status. |
| `/api/jobs/[jobId]/result` | GET | `/jobs/{jobId}/result` | Download the completed PDF. |

## API contracts

- `GET /status` returns `{ "message": "ONLINE" }` on success.
- `POST /jobs` sends `{ "text": string }` and returns `{ "job_id": string, "status": "PENDING" }`.
- `GET /jobs/{jobId}` returns `{ "job_id": string, "status": "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED", "error"?: string }`.
- `GET /jobs/{jobId}/result` returns PDF bytes with `Content-Type: application/pdf` when the job is completed.
- Route handlers normalize upstream snake_case fields to the existing frontend camelCase types.
- Upstream HTTP errors and malformed responses become safe, user-facing errors without leaking credentials or internal details.
- HTTP 429 rate-limit responses are handled explicitly and never break rendering or polling.
- Rate-limit responses may expose a safe retry hint, but must not trigger an immediate tight retry loop.

## Security and runtime constraints

- `API_BASE_URL` and `API_KEY` are read only in server-side route handlers.
- The browser never receives `API_KEY` and never calls API Gateway directly.
- Forward the API key as the upstream `x-api-key` header.
- Use `cache: "no-store"` for status and job-status reads.
- Preserve the API base URL normalization that avoids duplicate slashes.

## Workflow behavior

- Service status is requested once when the page loads.
- A valid submission enters `SENDING`, then adopts the API's `PENDING` state.
- Job status is polled every five seconds while `PENDING`.
- Once the job reaches `PROCESSING`, polling changes to every ten seconds.
- Polling stops at `COMPLETED`, `FAILED`, or a request error.
- A 429 response from job-status polling is handled silently: it preserves the current job and progress state, pauses or backs off the next poll, and does not show the error banner. Rate-limit backoff takes precedence over the normal five- or ten-second interval.
- A 429 from a non-polling request may show a friendly recoverable message, but must never crash the dashboard.
- A completed job enables the download action, which requests the same-origin result route.
- A new submission clears the previous job and restarts the workflow.
- Failures show the existing friendly error banner and do not become a fifth progress state.
- Submission failures, terminal job failures, and non-rate-limit polling failures clear the active job, return the workflow to `NONE`, preserve the error banner, and re-enable the submit button.
- A rate-limited status poll is not a terminal failure: it preserves the active state and does not disable the submit button permanently.

## Scope constraints

- Preserve the Phase 2 component boundaries and visual behavior.
- Keep the single-active-job model.
- Do not add job history, authentication UI, direct browser-to-AWS requests, or a new progress state.
- Do not treat rate limiting as a terminal job failure or add a fifth progress state.
