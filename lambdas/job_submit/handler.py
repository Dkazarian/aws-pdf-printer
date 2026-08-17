import json
import logging
import os


import boto3

from lambdas.shared.models import Job, JobStatus
from lambdas.shared.validation import parse_create_job_request


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])
logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    try:
        raw_body = event.get("body") if isinstance(event, dict) else None
        text = parse_create_job_request(raw_body)
    except ValueError as exc:
        return {"statusCode": 400, "body": json.dumps(str(exc))}

    job = Job(text=text)

    try:
        table.put_item(Item=job.to_item())
    except Exception:
        logger.exception("Failed to store job in DynamoDB")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps("Internal server error"),
        }

    return {
        "statusCode": 201,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"job_id": job.id, "status": job.status.value}),
    }
