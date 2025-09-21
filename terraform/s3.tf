resource "aws_s3_bucket" "s3_audit_service_bucket" {

  bucket = "${var.env}-s3-audit-service-deployment"

}


resource "aws_s3_bucket_versioning" "s3_audit_service_bucket_versioning" {
  bucket = aws_s3_bucket.s3_audit_service_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}