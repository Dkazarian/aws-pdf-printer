# Frontend Tech Stack

## Product and design decisions

| Area | Decision | Rationale |
| --- | --- | --- |
| Interface | Minimal centered dashboard | The demo has one primary task and should feel focused rather than like an administration console. |
| Prototype | Plain HTML/CSS with lightweight browser JavaScript | Allows visual decisions before committing to React components. |
| Progress model | NONE, PENDING, PROCESSING, COMPLETED | Mirrors the user-facing job lifecycle. |
| Pipeline explanation | Always-visible, friendly explanation with greyed future steps and emphasized active steps | Makes the asynchronous AWS architecture understandable during the demo without requiring AWS knowledge. |
| Polling | Approximately every five seconds | Gives responsive feedback without excessive requests. |
| Replacement behavior | A new submission replaces the current job | Keeps the interface focused on one active demo job. |

## Application stack

| Area | Decision | Rationale |
| --- | --- | --- |
| Framework | Next.js 14 with the App Router | Existing frontend and server-side route handlers support credential isolation. |
| UI | React 18 | Existing runtime is sufficient for this focused workflow. |
| Language | TypeScript 5.6 | Keeps API payloads, job states, and UI boundaries explicit. |
| Styling | Global CSS with CSS custom properties | Existing lightweight styling fits the minimal dashboard. |
| Hosting | Vercel | Existing deployment target in frontend/README.md. |
| Package manager | npm | Existing package-lock.json provides reproducible installs. |
| Testing | Vitest with React Testing Library | Fast unit and component tests for state transitions, validation, polling behavior, and accessibility-oriented UI behavior. |

## Backend integration

The frontend consumes:

- GET /status for service status.
- POST /jobs to submit non-empty text up to 10,000 characters.
- GET /jobs/{jobId} to read the job status.
- GET /jobs/{jobId}/result to download a completed PDF.

The browser should call same-origin Next.js /api/* routes. Server-side route handlers attach the private x-api-key, normalize errors, and never expose credentials to client code.

## Engineering conventions

- Define job-state unions and backend response types at the integration boundary.
- Use client components only where interaction, polling, or live state requires them.
- Use no-store caching for service and job-status reads.
- Keep loading, empty, success, and error states explicit.
- Keep dependencies minimal until a concrete need justifies a package.
- Test route handlers and the primary submit-to-download workflow.
- Use mocked API responses during frontend tests so AWS services are not required for unit or component tests.

## Open decisions

- Exact visual treatment of failed jobs and failed pipeline steps.
- Polling should stop at either COMPLETED or backend FAILED; the failure is presented in a banner.
- Whether a future version should support job history or remain single-job focused.
