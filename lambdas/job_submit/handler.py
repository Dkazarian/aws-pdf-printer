import json
import logging
import os
import uuid

import boto3


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])
logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    raw_body = event.get("body") if isinstance(event, dict) else None

    if not raw_body:
        return {"statusCode": 400, "body": json.dumps("Missing request body")}

    try:
        body = json.loads(raw_body)
    except (TypeError, json.JSONDecodeError):
        return {"statusCode": 400, "body": json.dumps("Invalid request body")}

    if not isinstance(body, dict):
        return {"statusCode": 400, "body": json.dumps("Invalid request body")}

    text = body.get("text")

    if not isinstance(text, str) or not text.strip():
        return {
            "statusCode": 400,
            "body": json.dumps('"text" must be a non-empty string'),
        }

    job = {
        "id": str(uuid.uuid4()),
        "text": text,
        "status": "PENDING",
    }

    try:
        table.put_item(Item=job)
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
        "body": json.dumps({"job_id": job["id"], "status": job["status"]}),
    }
