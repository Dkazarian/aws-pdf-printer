# =============================================================
# Core Printer Resources
# =============================================================

# -------------------------------------------------------------
# S3: Printed Documents
# -------------------------------------------------------------
resource "aws_s3_bucket" "printed_docs" {
  bucket        = "${local.name_prefix}-printed-documents"
  force_destroy = false
}

resource "aws_s3_bucket_public_access_block" "printed_docs" {
  bucket = aws_s3_bucket.printed_docs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "printed_docs" {
  bucket = aws_s3_bucket.printed_docs.id

  rule {
    id     = "expire-processed-documents"
    status = "Enabled"

    expiration {
      days = 1
    }

    filter {
      prefix = "processed/"
    }
  }
}

# -------------------------------------------------------------
# SQS: Printing Queue
# -------------------------------------------------------------
resource "aws_sqs_queue" "printing_queue" {
  name                       = "${local.name_prefix}-printing-queue"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 86400
}

# -------------------------------------------------------------
# DynamoDB: Job Records
# -------------------------------------------------------------
resource "aws_dynamodb_table" "jobs_table" {
  name           = "${local.name_prefix}-jobs"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"
  point_in_time_recovery {
    enabled = false
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

}
