resource "aws_lambda_function" "s3_audit_lambda" {
  s3_bucket            = "${var.env}-s3-audit-service-deployment"
  s3_key               = "initial_deployment/deployment.zip"
  function_name        = "${var.env}-s3-audit"
  handler              = "s3-audit.handler"
  role                 = aws_iam_role.s3_audit_role.arn
  runtime              = "nodejs22.x"

  publish              = true

  environment {
    variables = {
      "ENVIRONMENT" = var.env
    }
   
  }
}

resource "aws_lambda_alias" "s3_audit_alias" {
  name             = "main"
  description      = "S3 Audit Alias"
  function_name    = aws_lambda_function.s3_audit_lambda.arn
  function_version = "1"

  lifecycle {
    ignore_changes = [function_version]
  }

}

resource "aws_iam_role" "s3_audit_role" {
  name = "lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
    {
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }
  ]
})
}