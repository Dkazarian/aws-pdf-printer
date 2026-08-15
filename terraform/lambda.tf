# =============================================================
# Lambda Defaults
# =============================================================
locals {
  lambda_runtime = "python3.12"
  lambda_handler = "handler.lambda_handler"
}

# =============================================================
# Lambda Deployment Packages
# =============================================================
data "archive_file" "server_status" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/server_status"
  output_path = "${path.module}/server-status.zip"
}

data "archive_file" "job_status" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/job_status"
  output_path = "${path.module}/job-status.zip"
}

data "archive_file" "job_result" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/job_result"
  output_path = "${path.module}/job-result.zip"
}

data "archive_file" "job_submit" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/job_submit"
  output_path = "${path.module}/job-submit.zip"
}

data "archive_file" "job_worker" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/job_worker"
  output_path = "${path.module}/job-worker.zip"
}

data "archive_file" "job_enqueue" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/job_enqueue"
  output_path = "${path.module}/job-enqueue.zip"
}

# =============================================================
# Lambda Functions
# =============================================================
resource "aws_lambda_function" "server_status" {
  function_name    = "${local.name_prefix}-server-status"
  role             = aws_iam_role.server_status_lambda.arn
  runtime          = local.lambda_runtime
  handler          = local.lambda_handler
  filename         = data.archive_file.server_status.output_path
  source_code_hash = data.archive_file.server_status.output_base64sha256
}

resource "aws_lambda_function" "job_status" {
  function_name    = "${local.name_prefix}-job-status"
  role             = aws_iam_role.job_status_lambda.arn
  runtime          = local.lambda_runtime
  handler          = local.lambda_handler
  filename         = data.archive_file.job_status.output_path
  source_code_hash = data.archive_file.job_status.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.jobs_table.name
    }
  }
}

resource "aws_lambda_function" "job_result" {
  function_name    = "${local.name_prefix}-job-result"
  role             = aws_iam_role.job_result_lambda.arn
  runtime          = local.lambda_runtime
  handler          = local.lambda_handler
  filename         = data.archive_file.job_result.output_path
  source_code_hash = data.archive_file.job_result.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.jobs_table.name
    }
  }
}

resource "aws_lambda_function" "job_submit" {
  function_name    = "${local.name_prefix}-job-submit"
  role             = aws_iam_role.job_submit_lambda.arn
  runtime          = local.lambda_runtime
  handler          = local.lambda_handler
  filename         = data.archive_file.job_submit.output_path
  source_code_hash = data.archive_file.job_submit.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.jobs_table.name
    }
  }
}

resource "aws_lambda_function" "job_worker" {
  function_name    = "${local.name_prefix}-job-worker"
  role             = aws_iam_role.job_worker_lambda.arn
  runtime          = local.lambda_runtime
  handler          = local.lambda_handler
  filename         = data.archive_file.job_worker.output_path
  source_code_hash = data.archive_file.job_worker.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.jobs_table.name
      QUEUE_URL  = aws_sqs_queue.printing_queue.url
    }
  }
}

resource "aws_lambda_function" "job_enqueue" {
  function_name    = "${local.name_prefix}-job-enqueue"
  role             = aws_iam_role.job_enqueue_lambda.arn
  runtime          = local.lambda_runtime
  handler          = local.lambda_handler
  filename         = data.archive_file.job_enqueue.output_path
  source_code_hash = data.archive_file.job_enqueue.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.jobs_table.name
      QUEUE_URL  = aws_sqs_queue.printing_queue.url
    }
  }
}

resource "aws_lambda_event_source_mapping" "jobs_stream" {
  event_source_arn  = aws_dynamodb_table.jobs_table.stream_arn
  function_name     = aws_lambda_function.job_enqueue.arn
  starting_position = "LATEST"
  batch_size        = 1

  filter_criteria {
    filter {
      pattern = jsonencode({
        eventName = ["INSERT"]
      })
    }
  }

  depends_on = [aws_iam_role_policy.job_enqueue_lambda_stream]
}

resource "aws_lambda_event_source_mapping" "printing_queue" {
  event_source_arn = aws_sqs_queue.printing_queue.arn
  function_name    = aws_lambda_function.job_worker.arn
  batch_size       = 1
}
