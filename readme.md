Serverless Image Resizer (AWS Lambda + Node.js + Jimp)

This project implements a serverless image resizing service using AWS Lambda. Images uploaded to an S3 bucket are automatically resized and saved to a destination bucket.

Features

- Resizes images automatically when uploaded to S3
- Built with Node.js and Jimp
- No servers to manage; fully serverless
- Easy to extend for multiple sizes or formats

Architecture

S3 Source Bucket – Upload your images here.
AWS Lambda Function – Triggered by S3 object creation events. It downloads the image, resizes it using Jimp, and uploads it to the destination bucket.
S3 Destination Bucket – Stores resized images.

Setup Instructions
1. Create S3 Buckets

source-bucket – For original images

destination-bucket – For resized images

2. Configure Lambda

Runtime: Node.js 20.x

Handler: index.handler

Memory: 512 MB

Timeout: 15 seconds (adjust for large images)

Environment Variable: DEST_BUCKET = your-destination-bucket-name

3. Install Dependencies Locally

Install jimp@0.16.1 and @aws-sdk/client-s3 using npm in your project directory.

4. Add Lambda Handler

Create index.js and export a function named handler that fetches the image from the source bucket, resizes it with Jimp, and uploads it to the destination bucket.

5. Deploy to Lambda

Zip the index.js file along with the node_modules folder and upload it via the AWS Lambda console. Then set up an S3 trigger for the source bucket using object creation events.

Usage

Upload an image to the source bucket.

Lambda automatically resizes the image to a width of 300px (maintains aspect ratio).

The resized image appears in the destination bucket.

Notes

Memory and Timeout: For large images, increase Lambda memory and timeout.

Multiple sizes: The handler can be modified to generate multiple widths (e.g., 100px, 300px, 600px).

Logging: Use logs to debug S3 keys and image dimensions.

Dependencies

Jimp 0.16.1 – For image processing

AWS SDK v3 (@aws-sdk/client-s3) – For accessing S3

License

MIT License


