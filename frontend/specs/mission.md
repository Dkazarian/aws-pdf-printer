# Frontend Mission

## Purpose

Provide a simple, polished way to interact with the real AWS PDF printer demo while making its asynchronous AWS workflow understandable.

Users should submit plain text, watch the job progress, and download the generated PDF without prior knowledge of Lambda, DynamoDB, SQS, S3, or API Gateway.

## Audience

The primary audience is anyone exploring or evaluating the working demo. They should be able to use it as a normal browser tool while learning what happens under the hood.

## Core experience

The frontend is a minimal, centered dashboard containing:

- A text input and submit button.
- The submit button disabled for blank, whitespace-only, or over-limit input.
- A service-status indicator checked when the page loads: CHECKING, ONLINE, or OFFLINE.
- A progress bar with the states SENDING, QUEUED, PROCESSING, and COMPLETED.
- A greyed AWS pipeline that becomes more visible as the job advances.
- A download button enabled only when the job is COMPLETED.
- A friendly error banner when a request or job fails. Failure does not become a fifth progress state.

Polling should happen approximately every five seconds. The submit button is disabled while a job is being sent, queued, or processed, and becomes available again after completion or failure.

## AWS workflow shown to users

1. API Gateway receives the request.
2. Lambda creates a job in DynamoDB.
3. Lambda detects the DynamoDB INSERT event and sends the job to the SQS queue.
4. A worker Lambda generates the PDF.
5. The PDF is stored in S3.
6. The completed PDF becomes available for download.

Future steps remain muted grey; completed steps become visible, and the active step receives stronger emphasis. The explanation stays visible and uses friendly language alongside the accurate AWS terms.

## Principles

1. Keep the primary interaction simple and focused.
2. Use plain language while retaining accurate AWS terminology in the explanation.
3. Make asynchronous progress visible rather than hiding it behind a spinner.
4. Keep credentials and infrastructure details safe.
5. Treat the demo as both a usable tool and a small educational experience.
6. Prefer accessible semantic controls and meaningful live updates.

## Scope boundary

The frontend does not own PDF generation, persistence, queueing, or infrastructure. Those responsibilities remain in the AWS backend. The frontend explains those responsibilities and presents their result.

