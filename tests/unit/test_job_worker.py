from lambdas.job_worker.handler import lambda_handler


def test_job_worker_lambda_executes():
  lambda_handler({}, None)

