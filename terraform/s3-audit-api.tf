module "api_s3_audit_post" {
  source = "./modules/api-gateway-lambda"

  env         = var.env
  http_method = "POST"
  path_part   = "s3audit"

  rest_api_id = aws_api_gateway_rest_api.utils.id
  root_resource_id = aws_api_gateway_rest_api.utils.root_resource_id


}