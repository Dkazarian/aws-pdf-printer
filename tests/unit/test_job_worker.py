import os
from unittest.mock import patch

os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("TABLE_NAME", "test-jobs")
os.environ.setdefault("QUEUE_URL", "https://sqs.example/printing")
os.environ.setdefault("BUCKET_NAME", "printed-documents")

from lambdas.job_worker import handler
from lambdas.shared.models import Job, JobStatus


def _record(job_id="job-123"):
    return {"body": job_id, "receiptHandle": f"receipt-{job_id}"}


@patch.object(handler, "sqs")
@patch.object(handler, "s3")
@patch.object(handler, "repository")
def test_worker_generates_uploads_completes_and_deletes_message(
    mock_repository, mock_s3, mock_sqs
):
    mock_repository.get.return_value = Job(id="job-123", text="Hello, printer!")

    response = handler.lambda_handler({"Records": [_record()]}, None)

    assert response == {"processed": 1}
    mock_repository.get.assert_called_once_with("job-123")
    mock_repository.mark_processing.assert_called_once_with("job-123")
    mock_repository.mark_completed.assert_called_once_with(
        "job-123", "processed/job-123.pdf"
    )
    mock_s3.put_object.assert_called_once()
    upload = mock_s3.put_object.call_args.kwargs
    assert upload["Bucket"] == "printed-documents"
    assert upload["Key"] == "processed/job-123.pdf"
    assert upload["ContentType"] == "application/pdf"
    assert upload["Body"].startswith(b"%PDF-")
    assert b"Hello, printer!" in upload["Body"]
    mock_sqs.delete_message.assert_called_once_with(
        QueueUrl="https://sqs.example/printing",
        ReceiptHandle="receipt-job-123",
    )


@patch.object(handler, "sqs")
@patch.object(handler, "repository")
def test_worker_discards_message_for_missing_job(mock_repository, mock_sqs):
    mock_repository.get.return_value = None

    response = handler.lambda_handler({"Records": [_record()]}, None)

    assert response == {"processed": 0}
    mock_sqs.delete_message.assert_called_once_with(
        QueueUrl="https://sqs.example/printing",
        ReceiptHandle="receipt-job-123",
    )
    mock_repository.mark_processing.assert_not_called()


@patch.object(handler, "sqs")
@patch.object(handler, "s3")
@patch.object(handler, "repository")
def test_worker_discards_message_for_job_already_processing(
    mock_repository, mock_s3, mock_sqs
):
    mock_repository.get.return_value = Job(
        id="job-123", text="Hello", status=JobStatus.PROCESSING
    )

    response = handler.lambda_handler({"Records": [_record()]}, None)

    assert response == {"processed": 0}
    mock_repository.mark_processing.assert_not_called()
    mock_s3.put_object.assert_not_called()
    mock_sqs.delete_message.assert_called_once_with(
        QueueUrl="https://sqs.example/printing",
        ReceiptHandle="receipt-job-123",
    )


@patch.object(handler, "sqs")
@patch.object(handler, "s3")
@patch.object(handler, "repository")
def test_worker_marks_failed_and_deletes_message_without_retry(
    mock_repository, mock_s3, mock_sqs
):
    mock_repository.get.return_value = Job(id="job-123", text="Hello")
    mock_s3.put_object.side_effect = RuntimeError("S3 unavailable")

    response = handler.lambda_handler({"Records": [_record()]}, None)

    assert response == {"processed": 0}
    mock_repository.mark_failed.assert_called_once_with("job-123", "S3 unavailable")
    mock_repository.mark_completed.assert_not_called()
    mock_sqs.delete_message.assert_called_once_with(
        QueueUrl="https://sqs.example/printing",
        ReceiptHandle="receipt-job-123",
    )


def test_worker_ignores_empty_event():
    assert handler.lambda_handler({}, None) == {"processed": 0}

