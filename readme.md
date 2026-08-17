# Serverless Image Resizer (AWS Lambda + Node.js + Jimp)

## Project Overview

This project implements a serverless image resizing pipeline using AWS Lambda, Amazon S3, Node.js, and Jimp.

When an image is uploaded to an S3 source bucket, an S3 Object Created event automatically triggers a Lambda function. The function downloads the original image, resizes it while maintaining its aspect ratio, and uploads the processed image to a separate destination S3 bucket.

The architecture requires no dedicated servers and can be extended to support multiple image sizes, formats, or additional image-processing operations.

---
## Repository Structure
```
.
├── index.js
├── package.json
├── package-lock.json
└── README.md
```
---
## Architecture

```
                                    ┌──────────────────────┐
                                    │       User / App     │
                                    │                      │
                                    │   Upload image       │
                                    └──────────┬───────────┘
                                               │
                                               │ PutObject
                                               ▼
                                    ┌────────────────────────────┐
                                    │       S3 Source Bucket     │
                                    │                            │
                                    │   original-image.jpg       │
                                    │   original-image.png       │
                                    └─────────────┬──────────────┘
                                                  │
                                                  │ Object Created
                                                  │ Event
                                                  ▼
                                    ┌────────────────────────────┐
                                    │       AWS Lambda           │
                                    │                            │
                                    │   Node.js 20.x             │
                                    │   index.handler            │
                                    │                            │
                                    │   ┌────────────────────┐   │
                                    │   │ Download image     │   │
                                    │   │        ↓           │   │
                                    │   │ Jimp resize        │   │
                                    │   │        ↓           │   │
                                    │   │ Upload image       │   │
                                    │   └────────────────────┘   │
                                    └─────────────┬──────────────┘
                                                  │
                                                  │ PutObject
                                                  ▼
                                    ┌────────────────────────────┐
                                    │    S3 Destination Bucket   │
                                    │                            │
                                    │   resized-image.jpg        │
                                    │   resized-image.png        │
                                    └────────────────────────────┘
```
---
## Processing Flow

```
                                          Image Upload
                                               │
                                               ▼
                                          S3 Source Bucket
                                               │
                                               │ S3 Event
                                               ▼
                                          AWS Lambda
                                               │
                                               ├── Download original
                                               │
                                               ├── Process with Jimp
                                               │
                                               ├── Resize to 300px width
                                               │
                                               └── Preserve aspect ratio
                                               │
                                               ▼
                                          S3 Destination Bucket
                                               │
                                               ▼
                                          Resized Image
```
---
## Features
- Automatic image processing — images are processed immediately after upload.
- Serverless architecture — no servers or application infrastructure to manage.
- S3 event-driven execution — Lambda runs in response to S3 object creation events.
- Aspect-ratio preservation — images are resized to a width of 300px without distortion.
- Jimp image processing — Node.js-based image manipulation.
- Separate source and destination buckets — original and processed images remain isolated.
- Extensible design — can be adapted for multiple sizes and image formats.
---
## Technologies Used
| Technology                    | Purpose                              |
| ----------------------------- | ------------------------------------ |
| **AWS Lambda**                | Serverless image-processing function |
| **Amazon S3**                 | Image storage and event source       |
| **Node.js 20.x**              | Lambda runtime                       |
| **Jimp 0.16.1**               | Image resizing and processing        |
| **AWS SDK for JavaScript v3** | S3 API operations                    |
| **JavaScript**                | Lambda implementation                |
---
## How it works
1. Upload an image
An image is uploaded to the source S3 bucket

2. S3 generates an event
The S3 Object Created event invokes the Lambda function.

3. Lambda downloads the image
The Lambda function retrieves the image from the source bucket using the AWS SDK.

4. Jimp processes the image
Jimp resizes the image to a width of 300 pixels while maintaining the original aspect ratio.
For example:
```
Original:
1200 × 800

Resized:
300 × 200
```
5. Lambda uploads the result
The processed image is uploaded to the destination bucket.
---
## Setup
1. Create S3 Buckets
Create two S3 buckets:
```
source-bucket
destination-bucket
```
The source bucket stores original images, while the destination bucket stores processed images.
**Use globally unique S3 bucket names when deploying to real AWS.**
2. Configure the Lambda Function
Recommended configuration:
| Setting              | Value           |
| -------------------- | --------------- |
| Runtime              | Node.js 20.x    |
| Handler              | `index.handler` |
| Memory               | 512 MB          |
| Timeout              | 15 seconds      |
| Environment Variable | `DEST_BUCKET`   |

Configure the destination bucket as:
```
DEST_BUCKET=your-destination-bucket-name
```
The Lambda execution role also needs appropriate permissions to read from the source bucket and write to the destination bucket.
3. Install Dependencies
Initialize the Node.js project:
```bash
npm init -y
```
Install the required packages:
```bash
npm install jimp@0.16.1 @aws-sdk/client-s3
```
This creates the required `node_modules` directory and package files.
4. Create the Lambda Handler
Create:
```
index.js
```
The handler should:
- Read the S3 event.
- Extract the source bucket and object key.
- Download the image from S3.
- Load the image with Jimp.
- Resize it to 300px width.
- Preserve the aspect ratio.
- Upload the processed image to the destination bucket.

The handler should export:
```JavaScript
export const handler = async (event) => {
  // Image processing logic
};
```
If using CommonJS instead, use the corresponding `module.exports` syntax and ensure it matches the Lambda runtime configuration.
5. Package the Lambda Function
The deployment package should contain the Lambda source code and dependencies:
```
serverless-image-processing/
├── index.js
├── package.json
├── package-lock.json
└── node_modules/
```

Create the deployment ZIP:
```
zip -r lambda.zip index.js package.json package-lock.json node_modules/
```
Upload lambda.zip to the Lambda function.
6. Configure the S3 Trigger
Configure the source bucket to invoke the Lambda function when an object is created.
Recommended event:
```
s3:ObjectCreated:*
```
The resulting flow is:
```
S3 Source Bucket
      │
      │ Object Created
      ▼
AWS Lambda
      │
      │ Process
      ▼
S3 Destination Bucket
```
---
## Usage
Upload an image to the source bucket:
```
aws s3 cp photo.jpg s3://source-bucket/
```
S3 automatically triggers Lambda.

Lambda then:
```
photo.jpg
    │
    ▼
Download
    │
    ▼
Jimp
    │
    ▼
300px width
    │
    ▼
Upload
    │
    ▼
destination-bucket/photo.jpg
```
The resized image should appear in the destination bucket.
---
## IAM Permissions
The Lambda execution role should follow the principle of least privilege.

At minimum, the function needs permission to:

- Read objects from the source bucket
- Write objects to the destination bucket
- Write logs to Amazon CloudWatch Logs
Avoid granting unrestricted permissions such as `s3:*` on all buckets when narrower resource-level permissions are sufficient.
---
## Dependencies

Jimp `0.16.1`

Used for reading, manipulating, and resizing images.

AWS SDK for JavaScript

`@aws-sdk/client-s3` is used to interact with Amazon S3 from the Lambda function.
---

## Learning Outcomes

This project demonstrates practical experience with:

- AWS Lambda
- Amazon S3
- Event-driven serverless architecture
- Node.js
- Image processing
- AWS SDK for JavaScript
- IAM permissions
- CloudWatch logging
- S3 event notifications
- Serverless application design
---
## License

This project is intended for educational and portfolio purposes.
