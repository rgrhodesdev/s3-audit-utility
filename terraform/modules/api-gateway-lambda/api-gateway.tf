resource "aws_api_gateway_resource" "api_root" {
  rest_api_id = var.rest_api_id
  parent_id   = var.root_resource_id
  path_part   = var.path_part
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = var.rest_api_id
  resource_id   = var.root_resource_id
  http_method   = var.http_method
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = var.root_resource_id
  http_method             = aws_api_gateway_method.proxy.http_method
  integration_http_method = var.http_method
  type                    = "MOCK"
}

resource "aws_api_gateway_method_response" "proxy" {
  rest_api_id = var.rest_api_id
  resource_id = var.root_resource_id
  http_method = aws_api_gateway_method.proxy.http_method
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "proxy" {
  rest_api_id = var.rest_api_id
  resource_id = var.root_resource_id
  http_method = aws_api_gateway_method.proxy.http_method
  status_code = aws_api_gateway_method_response.proxy.status_code

  depends_on = [
    aws_api_gateway_method.proxy,
    aws_api_gateway_integration.lambda_integration
  ]
}