# Phase 2 Plan — React Components

## Group 1 — Establish the component structure

- [x] Identify the markup and state responsibilities in the approved HTML mockup.
- [x] Create the page-level composition component.
- [x] Create the ServiceStatus component.
- [x] Create the PrintJobForm component.
- [x] Create the JobProgress component.
- [x] Create the AwsWorkflow component.
- [x] Create the ErrorBanner component.
- [x] Create the DownloadButton component.

## Group 2 — Define state and contracts

- [x] Define the job-state union: SENDING, PENDING, PROCESSING, COMPLETED.
- [x] Define typed props for each component.
- [x] Define the mocked service-status state.
- [x] Define the mocked print-job response shape.
- [x] Define the error shape used by the error banner.
- [x] Decide where the page-level workflow state is owned.

## Group 3 — Reproduce the approved behavior

- [x] Render the initial SENDING state.
- [x] Show service status on page load.
- [x] Validate the text input before submission.
- [x] Reset the current job when a new submission starts.
- [x] Start the mocked five-second polling sequence.
- [x] Map each job state to the correct progress-bar appearance.
- [x] Map each job state to the correct visible AWS workflow steps.
- [x] Enable the download button only at COMPLETED.
- [x] Render a friendly error banner for mocked failures.
- [x] Stop polling after COMPLETED or failure.

## Group 4 — Test and verify

- [x] Add Vitest configuration if needed.
- [x] Add React Testing Library setup if needed.
- [x] Test initial state and form validation.
- [x] Test the mocked state transitions.
- [x] Test replacement of an active job.
- [x] Test download-button disabled and enabled states.
- [x] Test error-banner rendering.
- [x] Run typecheck, lint, tests, and production build.
- [x] Compare the React result with frontend/specs/mockup.html.

## Completion handoff

After this phase passes validation, Phase 3 can focus on making the mocked behavior realistic and stable before replacing it with real API requests in Phase 4.

