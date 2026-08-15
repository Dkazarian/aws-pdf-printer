# =============================================================
# Naming Convention
# =============================================================
locals {
  name_prefix = "${var.org_name}-${var.environment}-${var.project_name}"
}
