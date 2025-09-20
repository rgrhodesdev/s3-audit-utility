resource "aws_api_gateway_rest_api" "utils_api" {
  name        = "${var.env}-S3-Utility-API"
  description = "API Endpoint for S3 Audit in the ${var.env} environment"

  lifecycle {

    create_before_destroy  = true

  }

resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.my_api.id

}

resource "aws_api_gateway_stage" "deployment"

  deployment_id = aws_api_gateway_deployment.deployment.id
  rest_api_id   = aws_api_gateway_rest_api.utils_api.id
  stage         = var.env

}

