import { S3Client, ListBucketsCommand, GetBucketPolicyCommand, GetPublicAccessBlockCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";


async function processS3Buckets(): Promise<void> {
  const s3Client = new S3Client('eu-west-1');
  const ddbClient = new DynamoDBClient('eu-west-1');
  const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME as string;

  try {
    // 1. List all S3 buckets in the account.
    const listBucketsCommand = new ListBucketsCommand({});
    const { Buckets } = await s3Client.send(listBucketsCommand);

    if (!Buckets || Buckets.length === 0) {
      console.log("No S3 buckets found.");
      return;
    }

    // 2. Process each bucket to determine if it's public or private.
    for (const bucket of Buckets) {
      if (!bucket.Name) continue;

      const bucketName = bucket.Name;
      let isPublic = false;

      // Check for a public access block.
      try {
        const publicAccessBlockCommand = new GetPublicAccessBlockCommand({ Bucket: bucketName });
        const { PublicAccessBlockConfiguration } = await s3Client.send(publicAccessBlockCommand);

        if (PublicAccessBlockConfiguration) {
          // If any of these are true, the bucket is likely private.
          if (PublicAccessBlockConfiguration.BlockPublicAcls ||
              PublicAccessBlockConfiguration.IgnorePublicAcls ||
              PublicAccessBlockConfiguration.BlockPublicPolicy ||
              PublicAccessBlockConfiguration.RestrictPublicBuckets) {
            isPublic = false;
          }
        }
      } catch (e: any) {
        // If the public access block configuration isn't found, it's a potential sign of a public bucket.
        // Ignore the error and proceed to check the bucket policy.
        if (e.name === 'NoSuchPublicAccessBlockConfiguration') {
          console.log(`No public access block found for bucket: ${bucketName}. Checking policy...`);
        } else {
          throw e; // Re-throw other unexpected errors.
        }
      }

      // If no public access block was found or it didn't fully block public access, check the bucket policy.
      if (!isPublic) {
        try {
          const getBucketPolicyCommand = new GetBucketPolicyCommand({ Bucket: bucketName });
          const { Policy } = await s3Client.send(getBucketPolicyCommand);
          if (Policy) {
            const policyJson = JSON.parse(Policy);
            const hasPublicRead = policyJson.Statement.some((statement: any) =>
              statement.Effect === "Allow" &&
              statement.Principal?.AWS === "*" &&
              statement.Action.includes("s3:GetObject")
            );
            if (hasPublicRead) {
              isPublic = true;
            }
          }
        } catch (e: any) {
          // A bucket with no policy is generally private by default.
          if (e.name === 'NoSuchBucketPolicy') {
            console.log(`No bucket policy found for bucket: ${bucketName}. Assumed private.`);
          } else {
            throw e; // Re-throw other unexpected errors.
          }
        }
      }

      const status = isPublic ? "Public" : "Private";
      console.log(`Bucket: ${bucketName} is ${status}`);

      // 3. Write the result to DynamoDB.
      const putItemCommand = new PutItemCommand({
        TableName: DYNAMO_TABLE_NAME,
        Item: {
          'BucketName': { S: bucketName },
          'PublicStatus': { S: status },
        },
      });

      await ddbClient.send(putItemCommand);
      console.log(`Wrote status for ${bucketName} to DynamoDB.`);
    }
    console.log("Process complete. All bucket statuses have been logged to DynamoDB.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Example usage
const DYNAMO_TABLE_NAME = "S3BucketStatus"; // Replace with your DynamoDB table name
const AWS_REGION = "us-east-1"; // Replace with your desired region

// To run this function, you would call it like this:
// processS3Buckets(DYNAMO_TABLE_NAME, AWS_REGION);