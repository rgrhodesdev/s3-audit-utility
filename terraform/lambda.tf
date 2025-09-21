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
  name = "${var.env}-s3-audit-role"

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

resource "aws_iam_role_policy_attachment" "s3_audit_lambda" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role = aws_iam_role.s3_audit_role.name
}

resource "aws_lambda_permission" "s3_audit_api_gateway" {
  statement_id = "AllowExecutionFromAPIGateway"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.s3_audit_lambda.function_name
  principal = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.utils.execution_arn}/*/*/*"
}