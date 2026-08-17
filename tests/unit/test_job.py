from uuid import UUID
import time
import pytest

from lambdas.shared.models import Job, JobStatus, ONE_DAY


def test_new_job_generates_id_status_and_ttl():
    now = int(time.time())
    job = Job(text="Hello")

    assert UUID(job.id)
    assert job.status is JobStatus.PENDING
    assert job.ttl >= now + ONE_DAY


def test_job_to_item_serializes_enum_and_optional_fields():
    job = Job(
        id="job-123",
        text="Hello",
        status=JobStatus.COMPLETED,
        result_key="results/job-123.pdf",
        error="warning",
        ttl=123,
    )

    assert job.to_item() == {
        "id": "job-123",
        "text": "Hello",
        "status": "COMPLETED",
        "result_key": "results/job-123.pdf",
        "error": "warning",
        "ttl": 123,
    }


def test_job_from_item_reconstructs_job():
    item = {
        "id": "job-123",
        "text": "Hello",
        "status": "PROCESSING",
        "ttl": 123,
    }

    job = Job.from_item(item)

    assert job == Job(
        id="job-123",
        text="Hello",
        status=JobStatus.PROCESSING,
        ttl=123,
    )


def test_job_from_item_rejects_unknown_status():
    item = {"id": "job-123", "text": "Hello", "status": "UNKNOWN"}

    with pytest.raises(ValueError):
        Job.from_item(item)
