import { S3Client, ListBucketsCommand, GetBucketPolicyCommand, GetPublicAccessBlockCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

// The handler function that API Gateway will invoke.
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    // Read environment variables for the table name and AWS region.
    const DYNAMO_TABLE_NAME = process.env.DYNAMO_TABLE_NAME;
    const AWS_REGION = process.env.AWS_REGION || 'eu-west-1'; // Default to us-east-1 if not set

    if (!DYNAMO_TABLE_NAME) {
        console.error("DYNAMO_TABLE_NAME environment variable is not set.");
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error: DYNAMO_TABLE_NAME not configured." }),
        };
    }

    const s3Client = new S3Client({ region: AWS_REGION });
    const ddbClient = new DynamoDBClient({ region: AWS_REGION });

    try {
        // 1. List all S3 buckets in the account.
        const listBucketsCommand = new ListBucketsCommand({});
        const { Buckets } = await s3Client.send(listBucketsCommand);

        if (!Buckets || Buckets.length === 0) {
            console.log("No S3 buckets found.");
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "No S3 buckets found." }),
            };
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
                    if (PublicAccessBlockConfiguration.BlockPublicAcls ||
                        PublicAccessBlockConfiguration.IgnorePublicAcls ||
                        PublicAccessBlockConfiguration.BlockPublicPolicy ||
                        PublicAccessBlockConfiguration.RestrictPublicBuckets) {
                        isPublic = false;
                    }
                }
            } catch (e: any) {
                if (e.name === 'NoSuchPublicAccessBlockConfiguration') {
                    console.log(`No public access block found for bucket: ${bucketName}. Checking policy...`);
                } else {
                    throw e;
                }
            }

            // If no public access block, check the bucket policy.
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
                    if (e.name === 'NoSuchBucketPolicy') {
                        console.log(`No bucket policy found for bucket: ${bucketName}. Assumed private.`);
                    } else {
                        throw e;
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

        // Return a successful API Gateway response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "S3 bucket statuses have been audited and logged to DynamoDB." }),
        };

    } catch (error) {
        console.error("An error occurred:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred while processing S3 buckets.", error: (error as Error).message }),
        };
    }
};