import json
import os
from unittest.mock import patch

from lambdas.shared.models import Job, JobStatus

os.environ.setdefault("TABLE_NAME", "test-jobs")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

from lambdas.job_status import handler


@patch.object(handler, "repository")
def test_get_job_status_returns_status_for_existing_job(mock_repository):
    mock_repository.get.return_value = Job(
        id="job-123", text="Hello", status=JobStatus.PENDING
    )
    event = {"pathParameters": {"jobId": "job-123"}}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {
        "job_id": "job-123",
        "status": "PENDING",
    }
    mock_repository.get.assert_called_once_with("job-123")


@patch.object(handler, "repository")
def test_get_job_status_returns_not_found_for_missing_job(mock_repository):
    mock_repository.get.return_value = None
    event = {"pathParameters": {"jobId": "missing-job"}}

    response = handler.lambda_handler(event, None)

    assert response["statusCode"] == 404
    assert response["headers"]["Content-Type"] == "application/json"
    assert json.loads(response["body"]) == {"error": "Job not found"}
    mock_repository.get.assert_called_once_with("missing-job")
