variable "env" {
  description = "The deployment environment"
  type        = string
}

variable "http_method" {
  description = "The HTTP Method"
  type        = string
}

variable "rest_api_id" {
  description = "The ID of the REST API"
  type        = string
}

variable "root_resource_id" {
  description = "The ID of the Root Resource under which to create the new API"
  type        = string
}

variable "path_part" {
  description = "The value of the API path under the root resource"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "The value of the lambda invoke arn"
  type        = string
}