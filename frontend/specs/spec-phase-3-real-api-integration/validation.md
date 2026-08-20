# Phase 3 Validation

Phase 3 is complete only when the frontend uses the real API through server-side route handlers and passes the following checks.

## Route structure

- [x] Same-origin route handlers exist for status, job submission, job status, and PDF result download.
- [x] The browser does not call API Gateway directly.
- [x] Dynamic route parameters are validated before making upstream requests.
- [x] API responses retain appropriate status codes and content types.

## Security

- [x] `API_KEY` is read only on the server.
- [x] `x-api-key` is added only to upstream requests.
- [x] `API_KEY` does not appear in client JavaScript, rendered HTML, or error responses.
- [x] Missing environment variables produce a safe configuration error.

## Workflow behavior

- [x] Service status loads once on page entry.
- [x] A valid submission enters `SENDING`, then `PENDING`.
- [x] `PENDING` jobs are polled every five seconds.
- [x] `PROCESSING` jobs are polled every ten seconds.
- [x] The UI transitions through `PENDING` → `PROCESSING` → `COMPLETED`.
- [x] Polling stops after completion, failure, or request error.
- [x] A completed job enables the download button.
- [x] The result route downloads a PDF with the correct content type.
- [x] A new submission replaces the active job and resets progress.
- [x] Failed requests render the friendly error banner.
- [x] Submission failures and terminal job failures return the workflow to `NONE` and re-enable submission.
- [x] The failure message remains visible after the workflow resets.

## API and error handling

- [x] Backend `job_id` values map to the frontend `jobId` type.
- [x] Backend `PENDING` status maps to the existing queued UI treatment.
- [x] Non-2xx responses are handled without uncaught render errors.
- [x] HTTP 429 from job-status polling does not render an error message or crash the app.
- [x] The active job is preserved when polling is rate limited.
- [x] Rate-limited polling does not permanently disable submission.
- [x] Polling backs off or pauses after 429 and does not retry in a tight loop.
- [x] A safe `Retry-After` hint is honored when provided.
- [x] A 429 from submission or download is handled as a friendly recoverable error.
- [x] Invalid JSON and network failures produce actionable but non-sensitive messages.
- [x] A missing or incomplete result cannot be downloaded as a successful PDF.

## Quality

- [x] TypeScript passes.
- [x] Lint passes.
- [x] The production build passes.
- [x] Route-handler tests cover success, configuration, upstream, and malformed-response cases.
- [x] Integration tests cover submit, polling, completion, failure, and download.
- [x] Existing Phase 2 component and accessibility tests remain passing.
