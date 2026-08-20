# Phase 2 Requirements — React Components

## Objective

Refactor the approved HTML/CSS mockup into a maintainable React component structure without changing the intended user experience.

This phase establishes the UI architecture. It does not connect to the real AWS API.

## Required experience

The React interface must provide:

- A minimal, centered dashboard layout.
- Service status shown on initial page load.
- A text input and submit button.
- The submit button disabled for blank, whitespace-only, or over-limit input.
- A five-second mocked polling flow.
- Progress states: SENDING, QUEUED, PROCESSING, and COMPLETED. QUEUED maps to the backend PENDING state.
- A visible AWS workflow explanation:
  - API Gateway
  - Lambda creates a job in DynamoDB
  - Lambda detects the DynamoDB INSERT and sends the job to SQS
  - Worker Lambda generates the PDF
  - PDF is stored in S3
- Future workflow steps muted in grey.
- Completed steps visible and distinguished.
- The active step emphasized.
- A download button disabled until COMPLETED.
- A friendly error banner for failures.
- The submit button disabled while a job is being sent, queued, or processed.

## Component boundaries

Create focused components with clear responsibilities:

- ServiceStatus
- PrintJobForm
- JobProgress
- AwsWorkflow
- ErrorBanner
- DownloadButton
- A page-level composition component

Components should receive state and callbacks through props where practical. Avoid putting the entire workflow into one page component.

## Constraints

- Use the existing Next.js, React, TypeScript, and CSS setup.
- Preserve the visual direction from frontend/specs/mockup.html.
- Keep AWS requests out of this phase.
- Use local mock data or mock service functions for behavior.
- Keep dependencies minimal.


