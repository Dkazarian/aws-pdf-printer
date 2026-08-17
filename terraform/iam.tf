# =============================================================
# IAM: Lambda Trust Policy
# =============================================================
data "aws_iam_policy_document" "lambda_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# =============================================================
# IAM: Server Status Lambda
# =============================================================
resource "aws_iam_role" "server_status_lambda" {
  name               = "${local.name_prefix}-server-status-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

resource "aws_iam_role_policy_attachment" "server_status_lambda_logs" {
  role       = aws_iam_role.server_status_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# =============================================================
# IAM: Job Status Lambda
# =============================================================
resource "aws_iam_role" "job_status_lambda" {
  name               = "${local.name_prefix}-job-status-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

resource "aws_iam_role_policy_attachment" "job_status_lambda_logs" {
  role       = aws_iam_role.job_status_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "job_status_lambda_dynamodb" {
  name = "${local.name_prefix}-job-status-dynamodb-policy"
  role = aws_iam_role.job_status_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem"]
        Resource = aws_dynamodb_table.jobs_table.arn
      }
    ]
  })
}

# =============================================================
# IAM: Job Result Lambda
# =============================================================
resource "aws_iam_role" "job_result_lambda" {
  name               = "${local.name_prefix}-job-result-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

resource "aws_iam_role_policy_attachment" "job_result_lambda_logs" {
  role       = aws_iam_role.job_result_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "job_result_lambda_access" {
  name = "${local.name_prefix}-job-result-access-policy"
  role = aws_iam_role.job_result_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem"]
        Resource = aws_dynamodb_table.jobs_table.arn
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.printed_docs.arn}/processed/*"
      }
    ]
  })
}

# =============================================================
# IAM: Job Submit Lambda
# =============================================================
resource "aws_iam_role" "job_submit_lambda" {
  name               = "${local.name_prefix}-job-submit-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

resource "aws_iam_role_policy_attachment" "job_submit_lambda_logs" {
  role       = aws_iam_role.job_submit_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "job_submit_lambda_access" {
  name = "${local.name_prefix}-job-submit-access-policy"
  role = aws_iam_role.job_submit_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem"]
        Resource = aws_dynamodb_table.jobs_table.arn
      }
    ]
  })
}

# =============================================================
# IAM: Job Worker Lambda
# =============================================================
resource "aws_iam_role" "job_worker_lambda" {
  name               = "${local.name_prefix}-job-worker-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

resource "aws_iam_role_policy_attachment" "job_worker_lambda_logs" {
  role       = aws_iam_role.job_worker_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "job_worker_lambda_access" {
  name = "${local.name_prefix}-job-worker-access-policy"
  role = aws_iam_role.job_worker_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:UpdateItem"]
        Resource = aws_dynamodb_table.jobs_table.arn
      },
      {
        Effect   = "Allow"
        Action   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = aws_sqs_queue.printing_queue.arn
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = "${aws_s3_bucket.printed_docs.arn}/processed/*"
      }
    ]
  })
}

# =============================================================
# IAM: Job Queueing Lambda
# =============================================================
resource "aws_iam_role" "job_enqueue_lambda" {
  name               = "${local.name_prefix}-job-enqueue-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_trust.json
}

resource "aws_iam_role_policy_attachment" "job_enqueue_lambda_logs" {
  role       = aws_iam_role.job_enqueue_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "job_enqueue_lambda_stream" {
  name = "${local.name_prefix}-job-enqueue-stream-policy"
  role = aws_iam_role.job_enqueue_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:DescribeStream",
          "dynamodb:ListStreams"
        ]
        Resource = aws_dynamodb_table.jobs_table.stream_arn
      },
      {
        Effect   = "Allow"
        Action   = ["sqs:SendMessage"]
        Resource = aws_sqs_queue.printing_queue.arn
      }
    ]
  })
}
