resource "aws_api_gateway_rest_api" "utils" {
  name        = "${var.env}-S3-Utility-API"
  description = "API Endpoint for S3 Audit in the ${var.env} environment"

  lifecycle {

    create_before_destroy = true

  }

  endpoint_configuration {

    types = ["REGIONAL"]

  }

}

