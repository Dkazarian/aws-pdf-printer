import os
import json
from uuid import UUID
from unittest.mock import patch
from lambdas.shared.models import Job, JobStatus


os.environ.setdefault("TABLE_NAME", "test-jobs")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

from lambdas.job_submit import handler


@patch.object(handler, "table")
def test_job_submit_creates_job(mock_table):
    event = {"body": json.dumps({"text": "Hello, World!"})}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 201
    assert response["headers"]["Content-Type"] == "application/json"
    assert "job_id" in json.loads(response["body"])
    assert "status" in json.loads(response["body"])
    
    item = mock_table.put_item.call_args.kwargs["Item"]
    Job.from_item(item)

    assert UUID(item["id"])
    assert item["text"] == "Hello, World!"
    assert item["status"] == JobStatus.PENDING.value
    assert item["ttl"] > 0
    assert "result_key" not in item
    assert "error" not in item

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


@patch.object(handler, "table")
def test_job_submit_returns_server_error_when_dynamodb_fails(mock_table):
    mock_table.put_item.side_effect = RuntimeError("DynamoDB unavailable")
    event = {"body": json.dumps({"text": "Hello, World!"})}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 500
    assert json.loads(response["body"]) == "Internal server error"
