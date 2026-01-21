const Jimp = require("jimp");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({});
const DEST_BUCKET = process.env.DEST_BUCKET;
const WIDTH = 300;

exports.handler = async (event) => {
  for (const record of event.Records) {
    const srcBucket = record.s3.bucket.name;
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Get image from S3
    const getResult = await s3.send(new GetObjectCommand({ Bucket: srcBucket, Key: srcKey }));
    const chunks = [];
    for await (const chunk of getResult.Body) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Resize image
    const image = await Jimp.read(buffer);
    image.resize(WIDTH, Jimp.AUTO);
    const resizedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // Upload resized image
    await s3.send(new PutObjectCommand({
      Bucket: DEST_BUCKET,
      Key: srcKey,
      Body: resizedBuffer,
      ContentType: "image/jpeg"
    }));
  }

  return { status: "Success" };
};
