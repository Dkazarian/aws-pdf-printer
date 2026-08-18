import json

import pytest

from lambdas.shared.validation import MAX_TEXT_LENGTH, parse_create_job_request


def test_parse_create_job_request_returns_text():
    assert parse_create_job_request(json.dumps({"text": "Hello"})) == "Hello"


@pytest.mark.parametrize(
    "raw_body, expected_error",
    [
        (None, "Missing request body"),
        ("", "Missing request body"),
        ("not-json", "Invalid request body"),
        (json.dumps([]), "Invalid request body"),
        (json.dumps({}), '"text" must be a non-empty string'),
        (json.dumps({"text": ""}), '"text" must be a non-empty string'),
        (json.dumps({"text": 123}), '"text" must be a non-empty string'),
        (
            json.dumps({"text": "x" * (MAX_TEXT_LENGTH + 1)}),
            f'"text" must not exceed {MAX_TEXT_LENGTH} characters',
        ),
    ],
)
def test_parse_create_job_request_rejects_invalid_body(raw_body, expected_error):
    with pytest.raises(ValueError, match=expected_error):
        parse_create_job_request(raw_body)
