from lambdas.job_result.handler import lambda_handler


def test_job_result_lambda_returns_status_ok():
    response = lambda_handler({}, None)

    assert response["statusCode"] == 200
    assert response["headers"]["Content-Type"] == "application/json"
    assert response["body"] == '{"message":"OK"}'
