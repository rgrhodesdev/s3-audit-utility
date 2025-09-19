resource "aws_api_gateway_rest_api" "utils_api" {
  name        = "S3-Utility-API"
  description = "API Endpoint for S3 Audit Utility APIs"
}

resource "aws_api_gateway_resource" "api_root" {
  rest_api_id = aws_api_gateway_rest_api.my_api.id
  parent_id   = aws_api_gateway_rest_api.my_api.root_resource_id
  path_part   = v1
}