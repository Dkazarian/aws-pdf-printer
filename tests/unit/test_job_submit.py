import os
import json
from unittest.mock import patch

os.environ.setdefault("TABLE_NAME", "test-jobs")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

from lambdas.job_submit import handler


@patch.object(handler, "table")
@patch.object(handler.uuid, "uuid4", return_value="job-123")
def test_job_submit_creates_job(mock_uuid4, mock_table):
    event = {"body": json.dumps({"text": "Hello, World!"})}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 201
    assert json.loads(response["body"]) == {
        "job_id": "job-123",
        "status": "PENDING",
    }
    mock_table.put_item.assert_called_once_with(
        Item={
            "id": "job-123",
            "text": "Hello, World!",
            "status": "PENDING",
        }
    )
    mock_uuid4.assert_called_once_with()


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
