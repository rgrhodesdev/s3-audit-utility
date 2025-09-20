module "api_s3_audit_post" {
    source = "./modules/api-gateway-lambda"

    env = var.env
    http_method = "POST"
    path_part = "s3audit"

}