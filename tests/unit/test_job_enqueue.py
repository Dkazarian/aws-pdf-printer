import os
from unittest.mock import call, patch

os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("QUEUE_URL", "https://sqs.example/printing")

from lambdas.job_enqueue import handler

@patch.object(handler, "sqs")
def test_valid_insert_event_is_enqueued(mock_sqs):
    event = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {"NewImage": {"id": {"S": "job-123"}}},
            }
        ]
    }

    handler.lambda_handler(event, None)

    mock_sqs.send_message.assert_called_once_with(
        QueueUrl=handler.QUEUE_URL,
        MessageBody="job-123",
    )

@patch.object(handler, "sqs")
def test_non_insert_event_is_not_queued(mock_sqs):
    event = {
        "Records": [
            {
                "eventName": "MODIFY",
                "dynamodb": {"NewImage": {"id": {"S": "job-123"}}},
            }
        ]
    }

    handler.lambda_handler(event, None)

    mock_sqs.send_message.assert_not_called()

@patch.object(handler, "sqs")
def test_multiple_events_are_enqueued(mock_sqs):
    event = {
        "Records": [
            {
                "eventName": "INSERT",
                "dynamodb": {"NewImage": {"id": {"S": "job-123"}}},
            },
            {
                "eventName": "INSERT",
                "dynamodb": {"NewImage": {"id": {"S": "job-456"}}},
            },
            {
                "eventName": "MODIFY",
                "dynamodb": {"NewImage": {"id": {"S": "job-789"}}},
            },
        ]
    }

    handler.lambda_handler(event, None)

    assert mock_sqs.send_message.call_count == 2
    mock_sqs.send_message.assert_has_calls(
        [
            call(QueueUrl=handler.QUEUE_URL, MessageBody="job-123"),
            call(QueueUrl=handler.QUEUE_URL, MessageBody="job-456"),
        ]
    )
