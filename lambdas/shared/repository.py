import boto3

from lambdas.shared.models import Job, JobStatus


class JobRepository:
    def __init__(self, table_name: str, dynamodb=None):
        dynamodb = dynamodb or boto3.resource("dynamodb")
        self.table = dynamodb.Table(table_name)

    def create(self, job: Job) -> None:
        self.table.put_item(
            Item=job.to_item(),
            ConditionExpression="attribute_not_exists(id)",
        )

    def get(self, job_id: str) -> Job | None:
        response = self.table.get_item(Key={"id": job_id})
        item = response.get("Item")
        return Job.from_item(item) if item is not None else None

    def mark_processing(self, job_id: str) -> None:
        self.table.update_item(
            Key={"id": job_id},
            UpdateExpression="SET #status = :status",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":status": JobStatus.PROCESSING.value},
        )

    def mark_completed(self, job_id: str, result_key: str) -> None:
        self.table.update_item(
            Key={"id": job_id},
            UpdateExpression="SET #status = :status, #result_key = :result_key",
            ExpressionAttributeNames={
                "#status": "status",
                "#result_key": "result_key",
            },
            ExpressionAttributeValues={
                ":status": JobStatus.COMPLETED.value,
                ":result_key": result_key,
            },
        )

    def mark_failed(self, job_id: str, error: str) -> None:
        self.table.update_item(
            Key={"id": job_id},
            UpdateExpression="SET #status = :status, #error = :error",
            ExpressionAttributeNames={
                "#status": "status",
                "#error": "error",
            },
            ExpressionAttributeValues={
                ":status": JobStatus.FAILED.value,
                ":error": error,
            },
        )
