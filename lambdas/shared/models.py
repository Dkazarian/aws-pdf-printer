from dataclasses import dataclass, field
from enum import Enum
import uuid
import time
from typing import Any

class JobStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

ONE_DAY = 86400

@dataclass(frozen=True)
class Job:
    text: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    status: JobStatus = JobStatus.PENDING
    result_key: str | None = None
    error: str | None = None
    ttl: int = field(default_factory=lambda: int(time.time()) + ONE_DAY)

    def to_item(self) -> dict[str, Any]:
        item: dict[str, Any] = {
            "id": self.id,
            "text": self.text,
            "status": self.status.value,
            "ttl": self.ttl,
        }
        if self.result_key is not None:
            item["result_key"] = self.result_key
        if self.error is not None:
            item["error"] = self.error
        return item

    @classmethod
    def from_item(cls, item: dict[str, Any]) -> "Job":
        return cls(
            id=item["id"],
            text=item["text"],
            status=JobStatus(item["status"]),
            result_key=item.get("result_key"),
            error=item.get("error"),
            ttl=item.get("ttl"),
        )
