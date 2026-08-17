import os

import boto3
from boto3.dynamodb.types import TypeDeserializer

sqs = boto3.client("sqs")
deserializer = TypeDeserializer()

QUEUE_URL = os.environ["QUEUE_URL"]


def lambda_handler(event, context):
    for record in event.get("Records", []):
        if record.get("eventName") != "INSERT":
            continue
        image = record["dynamodb"].get("NewImage", {})

        job_id = deserializer.deserialize(image["id"])
        
        
        sqs.send_message(
            QueueUrl=QUEUE_URL,
            MessageBody=job_id,
        )

    return {"statusCode": 200}
