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
resource "terraform_data" "job_worker_package" {
  triggers_replace = [
    filesha256("${path.module}/../lambdas/job_worker/handler.py"),
    filesha256("${path.module}/../scripts/build_job_worker.py"),
  ]

  provisioner "local-exec" {
    working_dir = abspath(path.module)
    command     = "python ../scripts/build_job_worker.py"
  }
}

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
  source_dir  = "${path.module}/../build/job_worker"
  output_path = "${path.module}/job-worker.zip"
  depends_on  = [terraform_data.job_worker_package]
}

data "archive_file" "job_enqueue" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/job_enqueue"
  output_path = "${path.module}/job-enqueue.zip"
}

# =============================================================
# Shared Code Package
# =============================================================

data "archive_file" "shared_layer" {
  type        = "zip"
  output_path = "${path.module}/shared-layer.zip"

  source {
    content  = file("${path.module}/../lambdas/__init__.py")
    filename = "python/lambdas/__init__.py"
  }

  source {
    content  = file("${path.module}/../lambdas/shared/__init__.py")
    filename = "python/lambdas/shared/__init__.py"
  }

  source {
    content  = file("${path.module}/../lambdas/shared/models.py")
    filename = "python/lambdas/shared/models.py"
  }

  source {
    content  = file("${path.module}/../lambdas/shared/repository.py")
    filename = "python/lambdas/shared/repository.py"
  }

  source {
    content  = file("${path.module}/../lambdas/shared/validation.py")
    filename = "python/lambdas/shared/validation.py"
  }
}

resource "aws_lambda_layer_version" "shared" {
  layer_name          = "${local.name_prefix}-shared"
  filename            = data.archive_file.shared_layer.output_path
  source_code_hash    = data.archive_file.shared_layer.output_base64sha256
  compatible_runtimes = [local.lambda_runtime]
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
  layers           = [aws_lambda_layer_version.shared.arn]
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
  layers           = [aws_lambda_layer_version.shared.arn]
  filename         = data.archive_file.job_result.output_path
  source_code_hash = data.archive_file.job_result.output_base64sha256

  environment {
    variables = {
      TABLE_NAME  = aws_dynamodb_table.jobs_table.name
      BUCKET_NAME = aws_s3_bucket.printed_docs.bucket
    }
  }
}

resource "aws_lambda_function" "job_submit" {
  function_name    = "${local.name_prefix}-job-submit"
  role             = aws_iam_role.job_submit_lambda.arn
  runtime          = local.lambda_runtime
  handler          = local.lambda_handler
  layers           = [aws_lambda_layer_version.shared.arn]
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
  layers           = [aws_lambda_layer_version.shared.arn]
  filename         = data.archive_file.job_worker.output_path
  source_code_hash = data.archive_file.job_worker.output_base64sha256

  environment {
    variables = {
      TABLE_NAME  = aws_dynamodb_table.jobs_table.name
      QUEUE_URL   = aws_sqs_queue.printing_queue.url
      BUCKET_NAME = aws_s3_bucket.printed_docs.bucket
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
