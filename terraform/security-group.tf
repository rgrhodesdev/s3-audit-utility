resource "aws_security_group" "allow_tls" {
  # checkov:skip=CKV2_AWS_5:Temp
  name        = "my_test_sg"
  description = "Test SG for pipeline"
  vpc_id      = "vpc-c554eebc"
}