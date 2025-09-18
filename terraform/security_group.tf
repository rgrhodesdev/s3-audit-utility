resource "aws_security_group" "allow_tls" {
  name        = "my_test_sg"
  description = "Test SG for pipeline"
  vpc_id      = "vpc-c554eebc"
}