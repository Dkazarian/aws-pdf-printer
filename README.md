# AWS PDF printer

An asynchronous PDF-printing service built with AWS Lambda and Terraform. A client submits plain text, the service creates a job, generates a PDF in the background, stores it in a private S3 bucket, and makes the completed PDF available for download.

Try it at https://aws-printer-sim.vercel.app

## Architecture

```text
API Gateway (API key required)
        │
        ├── POST /jobs ──> job-submit Lambda ──> DynamoDB
        │                                           │
        │                              DynamoDB Stream (INSERT)
        │                                           │
        │                                  job-enqueue Lambda
        │                                           │
        │                                           ▼
        │                                  SQS printing queue
        │                                           │
        │                                  job-worker Lambda
        │                                      │         │
        │                                      ▼         ▼
        │                                  DynamoDB     S3 PDF
        │
        ├── GET /status ────────────────> server-status Lambda
        ├── GET /jobs/{jobId} ──────────> job-status Lambda
        └── GET /jobs/{jobId}/result ──> job-result Lambda ──> PDF bytes
```

Terraform provisions API Gateway, six Lambda functions, a shared Lambda layer, DynamoDB with streams and TTL, SQS, S3, IAM roles, API throttling, and an API key/usage plan.

## DynamoDB job schema

Jobs are stored in the provisioned jobs table with `id` as the partition key. A newly created item has this shape:

```json
{
  "id": "<uuid>",
  "text": "Hello from AWS",
  "status": "PENDING",
  "ttl": 1766000000
}
```

Field meanings:

| Field | Type | Description |
| --- | --- | --- |
| `id` | String | UUID and partition key for the job. |
| `text` | String | Non-empty text to render in the PDF; maximum 500 characters. |
| `status` | String | `PENDING`, `PROCESSING`, `COMPLETED`, or `FAILED`. |
| `ttl` | Number | Unix timestamp used by DynamoDB TTL; set to approximately one day after creation. |
| `result_key` | String | Optional S3 key, added when the job completes. |
| `error` | String | Optional failure message, added when processing fails. |

`result_key` and `error` are mutually associated with the terminal status: completed jobs have `result_key`, while failed jobs have `error`. The DynamoDB stream observes new job inserts and starts asynchronous processing through SQS. Generated PDFs are stored under `processed/` in S3 and expire after one day through the bucket lifecycle policy.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on deploying and testing the service with AWS or LocalStack.

## API

Set `BASE_URL` and `API_KEY` as described in [DEPLOYMENT.md](DEPLOYMENT.md) before running these examples.

### Service status

`GET /status`

```bash
curl -H "x-api-key: $API_KEY" "$BASE_URL/status"
```

Response:

```json
{"message":"ONLINE"}
```

### Create a print job

`POST /jobs`

```bash
curl -X POST \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from AWS"}' \
  "$BASE_URL/jobs"
```

The request must contain a non-empty string in `text`, up to 500 characters. A successful request returns `201`:

```json
{"job_id":"<uuid>","status":"PENDING"}
```

Save the returned `job_id` for the remaining requests.

### Get job status

`GET /jobs/{jobId}`

```bash
curl -H "x-api-key: $API_KEY" "$BASE_URL/jobs/<job-id>"
```

Response:

```json
{"job_id":"<uuid>","status":"COMPLETED"}
```

The normal lifecycle is:

```text
PENDING → PROCESSING → COMPLETED
                         ↘ FAILED
```

Jobs that do not exist return `404`. Job records expire through DynamoDB TTL after approximately one day.

### Download the generated PDF

`GET /jobs/{jobId}/result`

```bash
curl -f \
  -H "x-api-key: $API_KEY" \
  -o output.pdf \
  "$BASE_URL/jobs/<job-id>/result"
```

When the job is complete, the endpoint returns the PDF as binary content with `Content-Type: application/pdf` and an attachment filename based on the job ID. Before completion it returns `409`; a missing job returns `404`.

## Repository layout

```text
lambdas/       Lambda handlers and shared domain/repository code
scripts/       Deployment packaging helpers
terraform/     AWS infrastructure and deployment configuration
tests/         Unit tests
build/         Generated worker package contents
```
