import base64
import json
import os
from unittest.mock import patch

os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("TABLE_NAME", "test-jobs")
os.environ.setdefault("BUCKET_NAME", "printed-documents")

from lambdas.job_result import handler
from lambdas.shared.models import Job, JobStatus


@patch.object(handler, "s3")
@patch.object(handler, "repository")
def test_job_result_downloads_completed_pdf(mock_repository, mock_s3):
    mock_repository.get.return_value = Job(
        id="job-123",
        text="Hello",
        status=JobStatus.COMPLETED,
        result_key="processed/job-123.pdf",
    )
    mock_s3.get_object.return_value = {
        "Body": type("Body", (), {"read": lambda self: b"%PDF-result"})(),
        "ContentType": "application/pdf",
    }

    response = handler.lambda_handler({"pathParameters": {"jobId": "job-123"}}, None)

    assert response["statusCode"] == 200
    assert response["isBase64Encoded"] is True
    assert response["headers"] == {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="job-123.pdf"',
    }
    assert base64.b64decode(response["body"]) == b"%PDF-result"
    mock_repository.get.assert_called_once_with("job-123")
    mock_s3.get_object.assert_called_once_with(
        Bucket="printed-documents", Key="processed/job-123.pdf"
    )


@patch.object(handler, "repository")
def test_job_result_returns_conflict_until_job_is_completed(mock_repository):
    mock_repository.get.return_value = Job(
        id="job-123", text="Hello", status=JobStatus.PROCESSING
    )

    response = handler.lambda_handler({"pathParameters": {"jobId": "job-123"}}, None)

    assert response["statusCode"] == 409
    assert json.loads(response["body"]) == {
        "error": "Job result is not available",
        "status": "PROCESSING",
    }


def test_job_result_requires_job_id():
    response = handler.lambda_handler({}, None)

    assert response["statusCode"] == 400
    assert json.loads(response["body"]) == {"error": "Missing jobId"}
