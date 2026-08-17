import json
import os

import boto3

from lambdas.shared.models import Job


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


def lambda_handler(event, context):
    path_parameters = event.get("pathParameters") or {}
    job_id = path_parameters.get("jobId")

    if not job_id:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing jobId"}),
        }

    job = table.get_item(Key={"id": job_id})
    if "Item" not in job:
        return {
            "statusCode": 404,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Job not found"}),
        }

    job = Job.from_item(job["Item"])

    return {
        "headers": {"Content-Type": "application/json"},
        "statusCode": 200,
        "body": json.dumps({
            "job_id": job_id,
            "status": job.status.value,
        }),
    }
