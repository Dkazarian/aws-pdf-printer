import json
import os
from unittest.mock import patch

os.environ.setdefault("TABLE_NAME", "test-jobs")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

from lambdas.job_status import handler


@patch.object(handler, "table")
def test_get_job_status_returns_status_for_existing_job(mock_table):
    mock_table.get_item.return_value = {
        "Item": {"id": "job-123", "status": "PENDING"}
    }
    event = {"pathParameters": {"jobId": "job-123"}}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {
        "job_id": "job-123",
        "status": "PENDING",
    }
    mock_table.get_item.assert_called_once_with(Key={"id": "job-123"})


@patch.object(handler, "table")
def test_get_job_status_returns_not_found_for_missing_job(mock_table):
    mock_table.get_item.return_value = {}
    event = {"pathParameters": {"jobId": "missing-job"}}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 404
    assert response["headers"]["Content-Type"] == "application/json"
    assert json.loads(response["body"]) == {"error": "Job not found"}
    mock_table.get_item.assert_called_once_with(Key={"id": "missing-job"})
