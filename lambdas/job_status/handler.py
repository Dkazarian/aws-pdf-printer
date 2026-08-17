import json
import os

from lambdas.shared.models import Job
from lambdas.shared.repository import JobRepository


repository = JobRepository(os.environ["TABLE_NAME"])


def lambda_handler(event, context):
    path_parameters = event.get("pathParameters") or {}
    job_id = path_parameters.get("jobId")

    if not job_id:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing jobId"}),
        }

    job = repository.get(job_id)
    if job is None:
        return {
            "statusCode": 404,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Job not found"}),
        }

    return {
        "headers": {"Content-Type": "application/json"},
        "statusCode": 200,
        "body": json.dumps({
            "job_id": job_id,
            "status": job.status.value,
        }),
    }
