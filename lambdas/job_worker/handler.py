import logging
import os
from io import BytesIO

import boto3
from reportlab.pdfgen import canvas

from lambdas.shared.models import Job, JobStatus
from lambdas.shared.repository import JobRepository


logger = logging.getLogger(__name__)
repository = JobRepository(os.environ["TABLE_NAME"])
s3 = boto3.client("s3")
sqs = boto3.client("sqs")

QUEUE_URL = os.environ["QUEUE_URL"]
BUCKET_NAME = os.environ["BUCKET_NAME"]


def lambda_handler(event, context):
    processed = 0
    records = event.get("Records", []) if isinstance(event, dict) else []
    for record in records:
        job = _get_pending_job(record)
        if not job:
            _delete_message(record)
            continue
        try:
            repository.mark_processing(job.id)
            result_key = f"processed/{job.id}.pdf"
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=result_key,
                Body=_pdf_for_text(job.text),
                ContentType="application/pdf",
            )
            repository.mark_completed(job.id, result_key)
            processed += 1
        except Exception as exc:
            logger.exception("Failed to process job %s", job.id)
            try:
                repository.mark_failed(job.id, str(exc))
            except Exception:
                logger.exception("Failed to mark job %s as failed", job.id)
        finally:
            _delete_message(record)
    return {"processed": processed}


def _get_pending_job(record: dict) -> Job | None:
    job_id = record.get("body")
    if not job_id:
        logger.warning("Skipping SQS record without a job ID: %s", record)
        return None
    job = repository.get(job_id)
    if job is None:
        logger.warning("Job %s was not found; discarding queue message", job_id)
        return None
    if job.status is JobStatus.PROCESSING:
        logger.warning("Job %s is already processing; discarding duplicate message", job_id)
        return None
    return job

def _delete_message(record: dict) -> None:
    receipt_handle = record.get("receiptHandle")
    if receipt_handle:
        sqs.delete_message(QueueUrl=QUEUE_URL, ReceiptHandle=receipt_handle)

def _pdf_for_text(text: str) -> bytes:
    buffer = BytesIO()
    document = canvas.Canvas(buffer, pageCompression=0)
    document.drawString(72, 720, text)
    document.save()
    return buffer.getvalue()
