variable "env" {
  description = "The deployment environment"
  type        = string
}

variable "http_method" {
  description = "The HTTP Method"
  type        = string
}

variable "path_part" {
  description = "The vlaue of the API path under the root resource"
  type        = string
}