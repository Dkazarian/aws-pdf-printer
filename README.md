# AWS PDF printer practice project

AWS project using:

- API Gateway
- DynamoDB
- Lambda functions
- SQS
- S3

The intended workflow is:

```text
POST /jobs → queued → processing → completed/failed
                         │
                         └── generated result stored in S3
```

# API contract

## Create a job

`POST /jobs`

```json
{
  "text": "Hello"
}
```

Returns a job ID.

## Get job status

`GET /jobs/{jobId}`

Returns the job information (status, creation).

Expected lifecycle:

```text
queued → processing → completed
                    ↘ failed
```

## Get the result

`GET /jobs/{jobId}/result`

Returns url to download the PDF