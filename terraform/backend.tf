# =============================================================
# Terraform Remote State Backend
# =============================================================
terraform {
  # Backend configuration is supplied during `terraform init` so the state
  # bucket can be managed outside this stack.
  backend "s3" {
    # Required via -backend-config:
    #   bucket       = "<globally-unique-state-bucket>"
    #   key          = "aws-printer-sim/<environment>/terraform.tfstate"
    #   region       = "<aws-region>"
    #   encrypt      = true
    #   use_lockfile = true
  }
}
