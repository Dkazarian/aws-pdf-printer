from unittest.mock import Mock

from lambdas.shared.models import Job, JobStatus
from lambdas.shared.repository import JobRepository


def test_create_stores_job_item_without_overwriting_existing_job():
    table = Mock()
    repository = JobRepository("test-jobs", dynamodb=Mock(Table=Mock(return_value=table)))
    job = Job(id="job-123", text="Hello")

    repository.create(job)

    table.put_item.assert_called_once_with(
        Item=job.to_item(),
        ConditionExpression="attribute_not_exists(id)",
    )


def test_get_returns_job_for_existing_item():
    table = Mock()
    table.get_item.return_value = {
        "Item": {
            "id": "job-123",
            "text": "Hello",
            "status": "PENDING",
            "ttl": 123,
        }
    }
    repository = JobRepository("test-jobs", dynamodb=Mock(Table=Mock(return_value=table)))

    job = repository.get("job-123")

    assert job == Job(id="job-123", text="Hello", status=JobStatus.PENDING, ttl=123)
    table.get_item.assert_called_once_with(Key={"id": "job-123"})


def test_get_returns_none_for_missing_item():
    table = Mock()
    table.get_item.return_value = {}
    repository = JobRepository("test-jobs", dynamodb=Mock(Table=Mock(return_value=table)))

    assert repository.get("missing-job") is None


def test_mark_processing_updates_status():
    table = Mock()
    repository = JobRepository("test-jobs", dynamodb=Mock(Table=Mock(return_value=table)))

    repository.mark_processing("job-123")

    table.update_item.assert_called_once_with(
        Key={"id": "job-123"},
        UpdateExpression="SET #status = :status",
        ExpressionAttributeNames={"#status": "status"},
        ExpressionAttributeValues={":status": "PROCESSING"},
    )


def test_mark_completed_updates_status_and_result():
    table = Mock()
    repository = JobRepository("test-jobs", dynamodb=Mock(Table=Mock(return_value=table)))

    repository.mark_completed("job-123", "results/job-123.pdf")

    table.update_item.assert_called_once_with(
        Key={"id": "job-123"},
        UpdateExpression="SET #status = :status, #result_key = :result_key",
        ExpressionAttributeNames={"#status": "status", "#result_key": "result_key"},
        ExpressionAttributeValues={
            ":status": "COMPLETED",
            ":result_key": "results/job-123.pdf",
        },
    )


def test_mark_failed_updates_status_and_error():
    table = Mock()
    repository = JobRepository("test-jobs", dynamodb=Mock(Table=Mock(return_value=table)))

    repository.mark_failed("job-123", "Printer unavailable")

    table.update_item.assert_called_once_with(
        Key={"id": "job-123"},
        UpdateExpression="SET #status = :status, #error = :error",
        ExpressionAttributeNames={"#status": "status", "#error": "error"},
        ExpressionAttributeValues={
            ":status": "FAILED",
            ":error": "Printer unavailable",
        },
    )
