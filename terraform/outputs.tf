# =============================================================
# Terraform Outputs
# =============================================================

data "aws_region" "current" {}

output "aws_region" {
  description = "AWS region containing the printer resources"
  value       = var.aws_region
}

output "environment" {
  description = "Deployment environment"
  value       = var.environment
}

# =============================================================
# API Gateway
# =============================================================

output "api_gateway_id" {
  description = "ID of the REST API Gateway API"
  value       = aws_api_gateway_rest_api.status.id
}

output "api_gateway_stage" {
  description = "Deployed API Gateway stage name"
  value       = var.environment
}

output "status_endpoint" {
  description = "Authenticated GET endpoint for checking service status"
  value       = "https://${aws_api_gateway_rest_api.status.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}/status"
}

output "jobs_endpoint" {
  description = "Authenticated POST endpoint for submitting print jobs"
  value       = "https://${aws_api_gateway_rest_api.status.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}/jobs"
}

output "job_status_endpoint_template" {
  description = "Authenticated GET endpoint template for checking a job"
  value       = "https://${aws_api_gateway_rest_api.status.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}/jobs/{jobId}"
}

output "job_result_endpoint_template" {
  description = "Authenticated GET endpoint template for retrieving a job result"
  value       = "https://${aws_api_gateway_rest_api.status.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}/jobs/{jobId}/result"
}

# =============================================================
# Core Resources
# =============================================================

output "printed_documents_bucket_name" {
  description = "S3 bucket used for generated documents"
  value       = aws_s3_bucket.printed_docs.bucket
}

output "printing_queue_url" {
  description = "SQS queue URL used by the printing workflow"
  value       = aws_sqs_queue.printing_queue.url
}

output "jobs_table_name" {
  description = "DynamoDB table containing print jobs"
  value       = aws_dynamodb_table.jobs_table.name
}

# =============================================================
# Lambda Functions
# =============================================================

output "lambda_function_names" {
  description = "Names of the deployed Lambda functions"
  value = {
    server_status = aws_lambda_function.server_status.function_name
    job_status    = aws_lambda_function.job_status.function_name
    job_result    = aws_lambda_function.job_result.function_name
    job_submit    = aws_lambda_function.job_submit.function_name
    job_worker    = aws_lambda_function.job_worker.function_name
    job_enqueue   = aws_lambda_function.job_enqueue.function_name
  }
}
