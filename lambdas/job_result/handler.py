import base64
import json
import logging
import os

import boto3

from lambdas.shared.models import JobStatus
from lambdas.shared.repository import JobRepository


logger = logging.getLogger(__name__)
repository = JobRepository(os.environ["TABLE_NAME"])
s3 = boto3.client("s3")
BUCKET_NAME = os.environ["BUCKET_NAME"]


def lambda_handler(event, context):
    path_parameters = event.get("pathParameters") or {}
    job_id = path_parameters.get("jobId")

    if not job_id:
        return _json_response(400, {"error": "Missing jobId"})

    try:
        job = repository.get(job_id)
    except Exception:
        logger.exception("Failed to read job %s from DynamoDB", job_id)
        return _json_response(500, {"error": "Internal server error"})

    if job is None:
        return _json_response(404, {"error": "Job not found"})

    if job.status is not JobStatus.COMPLETED:
        return _json_response(
            409,
            {"error": "Job result is not available", "status": job.status.value},
        )

    if not job.result_key:
        logger.error("Completed job %s has no result key", job_id)
        return _json_response(500, {"error": "Internal server error"})

    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=job.result_key)
        body = response["Body"].read()
    except Exception:
        logger.exception("Failed to read result for job %s from S3", job_id)
        return _json_response(500, {"error": "Internal server error"})

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": response.get("ContentType", "application/pdf"),
            "Content-Disposition": f'attachment; filename="{job_id}.pdf"',
        },
        "isBase64Encoded": True,
        "body": base64.b64encode(body).decode("ascii"),
    }


def _json_response(status_code: int, payload: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }
