# Deployment and testing

## Requirements

- AWS credentials configured for the AWS account where the stack will be deployed
- Terraform `>= 1.5`
- Python 3.12 and `pip`
- AWS CLI (useful for retrieving the generated API key)

The default deployment region is `us-east-1`. Change it with `-var='aws_region=...'`.

## Deploy with Terraform

From the repository root:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

The worker package is built automatically during Terraform execution. The build installs the Python 3.12-compatible `reportlab` dependency into `build/job_worker` before Terraform creates the worker deployment archive.

After deployment, print the API endpoints with:

```bash
terraform output
```

The stack defaults to the `demo` stage. Resource names are prefixed with `org_name-environment-project_name`; these can be overridden with Terraform variables.

## Configure the API examples

Set these variables in the same terminal session where you will run the API examples. Replace the placeholders with values from `terraform output` and the API Gateway API key.

PowerShell:

```powershell
$BASE_URL = (terraform output -raw jobs_endpoint) -replace "/jobs$", ""
$REGION = terraform output -raw aws_region
$API_KEY = (
  aws apigateway get-api-keys --include-values --region $REGION |
  ConvertFrom-Json
).items | Select-Object -First 1 -ExpandProperty value
```

Bash:

```bash
export BASE_URL="$(terraform output -raw jobs_endpoint | sed 's:/jobs$::')"
export REGION="$(terraform output -raw aws_region)"
export API_KEY="<api-key-from-api-gateway>"
```

The API key value can be retrieved from the API Gateway console or with:

```bash
aws apigateway get-api-keys --include-values --region "$REGION"
```

See the API examples in [README.md](README.md).

## Run tests locally

From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\\Scripts\\Activate.ps1
python -m pip install -r requirements.txt
pytest
```

The tests mock AWS services and do not require a live AWS account.

## Cleanup

To remove the deployed demo resources:

```bash
cd terraform
terraform destroy
```

The S3 bucket is configured with `force_destroy = false`, so remove generated objects before destroying the stack if Terraform reports that the bucket is not empty.
