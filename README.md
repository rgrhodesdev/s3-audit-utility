S3 Audit Utility

This repository contains the infrastructure as code (IaC) and a TypeScript function for an AWS-based utility that audits all S3 buckets in your account, determines if they are publicly accessible, and logs the results to a DynamoDB table.


Features

Automated S3 Auditing: Automatically checks all S3 buckets for public access.

Public Access Check: Differentiates between public and private buckets by checking both public access blocks and bucket policies.

Centralized Logging: Stores the audit results in a DynamoDB table for easy querying and record-keeping.

Infrastructure as Code: Uses per environment Github Workflow, leveraging terraform to provision the entire stack, including the Lambda function, DynamoDB table, and IAM permissions.

Automated Code Deployment: Dedicated Workflow for per environment Typescript code deployment.

Serverless Architecture: The solution is entirely serverless, running on AWS Lambda, which scales automatically and incurs costs only when executed.