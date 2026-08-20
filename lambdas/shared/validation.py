import json
from typing import Any

MAX_TEXT_LENGTH = 500


def parse_create_job_request(raw_body: str | None) -> str:
    if not raw_body:
        raise ValueError("Missing request body")

    try:
        body: Any = json.loads(raw_body)
    except (TypeError, json.JSONDecodeError) as exc:
        raise ValueError("Invalid request body") from exc

    if not isinstance(body, dict):
        raise ValueError("Invalid request body")

    text = body.get("text")
    if not isinstance(text, str) or not text.strip():
        raise ValueError('"text" must be a non-empty string')
    if len(text) > MAX_TEXT_LENGTH:
        raise ValueError(f'"text" must not exceed {MAX_TEXT_LENGTH} characters')

    return text
