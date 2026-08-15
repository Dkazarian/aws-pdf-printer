# =============================================================
# Input Variables
# =============================================================
variable "org_name" {
  type        = string
  default     = "danielakazarian"
  description = "Organization or namespace used in resource names"
}

variable "environment" {
  type        = string
  default     = "demo"
  description = "The deployment stage or environment name"
}

variable "project_name" {
  type        = string
  default     = "printer"
  description = "Project name used in resource names"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region where resources are deployed"
}

variable "api_stage_throttle_rate" {
  type        = number
  default     = 2
  description = "Target requests per second for the whole API stage"
}

variable "api_stage_throttle_burst" {
  type        = number
  default     = 5
  description = "Maximum short burst for the whole API stage"
}

variable "api_key_daily_quota" {
  type        = number
  default     = 500
  description = "Best-effort daily request quota for the demo API key"
}

variable "api_key_throttle_rate" {
  type        = number
  default     = 1
  description = "Best-effort requests-per-second limit for the demo API key"
}

variable "api_key_throttle_burst" {
  type        = number
  default     = 2
  description = "Best-effort burst limit for the demo API key"
}
