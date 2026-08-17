# =============================================================
# API Gateway: Printer API
# =============================================================

resource "aws_api_gateway_rest_api" "status" {
  name               = "${local.name_prefix}-api"
  binary_media_types = ["application/pdf"]
}

resource "aws_api_gateway_api_key" "demo" {
  name    = "${local.name_prefix}-demo-key"
  enabled = true
}

# =============================================================
# GET /status -> server-status Lambda
# =============================================================

resource "aws_api_gateway_resource" "status" {
  rest_api_id = aws_api_gateway_rest_api.status.id
  parent_id   = aws_api_gateway_rest_api.status.root_resource_id
  path_part   = "status"
}

resource "aws_api_gateway_method" "status_get" {
  rest_api_id      = aws_api_gateway_rest_api.status.id
  resource_id      = aws_api_gateway_resource.status.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "status_get" {
  rest_api_id             = aws_api_gateway_rest_api.status.id
  resource_id             = aws_api_gateway_resource.status.id
  http_method             = aws_api_gateway_method.status_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.server_status.invoke_arn
}

resource "aws_lambda_permission" "allow_api_gateway_status" {
  statement_id  = "AllowExecutionFromApiGatewayStatus"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.server_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.status.execution_arn}/*/GET/status"
}

# =============================================================
# /jobs resources
# =============================================================

resource "aws_api_gateway_resource" "jobs" {
  rest_api_id = aws_api_gateway_rest_api.status.id
  parent_id   = aws_api_gateway_rest_api.status.root_resource_id
  path_part   = "jobs"
}

resource "aws_api_gateway_resource" "job_id" {
  rest_api_id = aws_api_gateway_rest_api.status.id
  parent_id   = aws_api_gateway_resource.jobs.id
  path_part   = "{jobId}"
}

resource "aws_api_gateway_resource" "job_result" {
  rest_api_id = aws_api_gateway_rest_api.status.id
  parent_id   = aws_api_gateway_resource.job_id.id
  path_part   = "result"
}

# =============================================================
# POST /jobs -> job-submit Lambda
# =============================================================

resource "aws_api_gateway_method" "jobs_post" {
  rest_api_id      = aws_api_gateway_rest_api.status.id
  resource_id      = aws_api_gateway_resource.jobs.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "jobs_post" {
  rest_api_id             = aws_api_gateway_rest_api.status.id
  resource_id             = aws_api_gateway_resource.jobs.id
  http_method             = aws_api_gateway_method.jobs_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.job_submit.invoke_arn
}

resource "aws_lambda_permission" "allow_api_gateway_job_submit" {
  statement_id  = "AllowExecutionFromApiGatewayJobSubmit"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.job_submit.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.status.execution_arn}/*/POST/jobs"
}

# =============================================================
# GET /jobs/{jobId} -> job-status Lambda
# =============================================================

resource "aws_api_gateway_method" "job_status_get" {
  rest_api_id      = aws_api_gateway_rest_api.status.id
  resource_id      = aws_api_gateway_resource.job_id.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "job_status_get" {
  rest_api_id             = aws_api_gateway_rest_api.status.id
  resource_id             = aws_api_gateway_resource.job_id.id
  http_method             = aws_api_gateway_method.job_status_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.job_status.invoke_arn
}

resource "aws_lambda_permission" "allow_api_gateway_job_status" {
  statement_id  = "AllowExecutionFromApiGatewayJobStatus"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.job_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.status.execution_arn}/*/GET/jobs/*"
}

# =============================================================
# GET /jobs/{jobId}/result -> job-result Lambda
# =============================================================

resource "aws_api_gateway_method" "job_result_get" {
  rest_api_id      = aws_api_gateway_rest_api.status.id
  resource_id      = aws_api_gateway_resource.job_result.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "job_result_get" {
  rest_api_id             = aws_api_gateway_rest_api.status.id
  resource_id             = aws_api_gateway_resource.job_result.id
  http_method             = aws_api_gateway_method.job_result_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.job_result.invoke_arn
}

resource "aws_lambda_permission" "allow_api_gateway_job_result" {
  statement_id  = "AllowExecutionFromApiGatewayJobResult"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.job_result.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.status.execution_arn}/*/GET/jobs/*/result"
}

# =============================================================
# API Gateway Deployment
# =============================================================

resource "aws_api_gateway_deployment" "status" {
  rest_api_id = aws_api_gateway_rest_api.status.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.status.id,
      aws_api_gateway_method.status_get.id,
      aws_api_gateway_integration.status_get.id,
      aws_api_gateway_resource.jobs.id,
      aws_api_gateway_method.jobs_post.id,
      aws_api_gateway_integration.jobs_post.id,
      aws_api_gateway_resource.job_id.id,
      aws_api_gateway_method.job_status_get.id,
      aws_api_gateway_integration.job_status_get.id,
      aws_api_gateway_resource.job_result.id,
      aws_api_gateway_method.job_result_get.id,
      aws_api_gateway_integration.job_result_get.id,
      aws_lambda_function.job_result.id,
    ]))
  }

  depends_on = [
    aws_api_gateway_integration.status_get,
    aws_api_gateway_integration.jobs_post,
    aws_api_gateway_integration.job_status_get,
    aws_api_gateway_integration.job_result_get,
  ]
}

resource "aws_api_gateway_stage" "demo" {
  rest_api_id   = aws_api_gateway_rest_api.status.id
  deployment_id = aws_api_gateway_deployment.status.id
  stage_name    = var.environment
}

resource "aws_api_gateway_method_settings" "demo" {
  rest_api_id = aws_api_gateway_rest_api.status.id
  stage_name  = aws_api_gateway_stage.demo.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled        = false
    logging_level          = "OFF"
    throttling_rate_limit  = var.api_stage_throttle_rate
    throttling_burst_limit = var.api_stage_throttle_burst
  }
}

resource "aws_api_gateway_usage_plan" "demo" {
  name = "${local.name_prefix}-demo-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.status.id
    stage  = aws_api_gateway_stage.demo.stage_name
  }

  throttle_settings {
    rate_limit  = var.api_key_throttle_rate
    burst_limit = var.api_key_throttle_burst
  }

  quota_settings {
    limit  = var.api_key_daily_quota
    period = "DAY"
  }
}

resource "aws_api_gateway_usage_plan_key" "demo" {
  key_id        = aws_api_gateway_api_key.demo.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.demo.id
}
