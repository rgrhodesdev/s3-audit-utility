resource "aws_iam_policy" "s3_audit_policy" {
  name        = "${var.env}-s3-audit-policy"
  description = "IAM policy for Lambda to audit S3 buckets and write to DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [

      {
        Effect = "Allow"
        Action = [
          "s3:ListAllMyBuckets",
          "s3:GetBucketPolicy",
          "s3:GetPublicAccessBlock"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = aws_dynamodb_table.s3_audit_table.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Attach the policy to the role.
resource "aws_iam_role_policy_attachment" "lambda_s3_checker_attachment" {
  role       = aws_iam_role.s3_audit_role.name
  policy_arn = aws_iam_policy.s3_audit_policy.arn
}
