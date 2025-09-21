// Import the necessary types from the AWS Lambda package.
// This provides type safety for the Lambda event and context objects.
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 * A simple Lambda function handler that processes an API Gateway event.
 *
 * @param event The incoming API Gateway event.
 * @param context The Lambda execution context.
 * @returns A promise that resolves to an API Gateway proxy result.
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  // Log the incoming event and context for debugging purposes.
  // This is useful for understanding the request details.
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Received context:', JSON.stringify(context, null, 2));

  // Determine the user's name from a query string parameter.
  // If the 'name' parameter is not provided, default to 'World'.
  const name = event.queryStringParameters?.name || 'World';

  // Construct the response body as a JSON object.
  const responseBody = {
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  };

  // Return a well-formed API Gateway proxy result.
  // The statusCode indicates success, and the headers specify the content type.
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(responseBody),
  };
};