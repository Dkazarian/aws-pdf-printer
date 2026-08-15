from lambdas.server_status.handler import lambda_handler


def test_server_status_lambda_returns_status_online():
    response = lambda_handler({}, None)

    assert response["statusCode"] == 200
    assert response["headers"]["Content-Type"] == "application/json"
    assert response["body"] == '{"message":"ONLINE"}'
