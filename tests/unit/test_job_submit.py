import os
import json
from uuid import UUID
from unittest.mock import patch
from lambdas.shared.models import Job, JobStatus


os.environ.setdefault("TABLE_NAME", "test-jobs")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

from lambdas.job_submit import handler


@patch.object(handler, "repository")
def test_job_submit_creates_job(mock_repository):
    event = {"body": json.dumps({"text": "Hello, World!"})}

    response = handler.lambda_handler(event, None)

    job = mock_repository.create.call_args.args[0]

    assert response["statusCode"] == 201
    assert response["headers"]["Content-Type"] == "application/json"
    assert json.loads(response["body"]) == {
        "job_id": job.id,
        "status": job.status.value,
    }

def test_job_submit_rejects_missing_body():
    response = handler.lambda_handler({}, None)

    assert response["statusCode"] == 400
    assert json.loads(response["body"]) == "Missing request body"


def test_job_submit_rejects_body_without_text():
    event = {"body": json.dumps({})}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 400
    assert json.loads(response["body"]) == '"text" must be a non-empty string'


def test_job_submit_rejects_non_string_text():
    event = {"body": json.dumps({"text": 123})}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 400
    assert json.loads(response["body"]) == '"text" must be a non-empty string'


@patch.object(handler, "repository")
def test_job_submit_returns_server_error_when_dynamodb_fails(mock_repository):
    mock_repository.create.side_effect = RuntimeError("DynamoDB unavailable")
    event = {"body": json.dumps({"text": "Hello, World!"})}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 500
    assert json.loads(response["body"]) == "Internal server error"
