from lambdas.job_status.handler import lambda_handler


def test_job_status_lambda_returns_status_ok():
    response = lambda_handler({}, None)

    assert response["statusCode"] == 200
    assert response["headers"]["Content-Type"] == "application/json"
    assert response["body"] == '{"message":"OK"}'
