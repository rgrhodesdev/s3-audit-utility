resource "aws_dynamodb_table" "s3_audit_table" {
  name           = "${var.env}_s3_audit_table"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "BucketName"

  attribute {
    name = "BucketName"
    type = "S"
  }

}

