import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import awsConfig from '../config/aws.js';
import logger from '../utils/logger.js';

async function uploadToS3(catalogData) {
  try {
    // Create S3 client
    const client = new S3Client(awsConfig);

    // Use Upload utility
    const parallelUploads3 = new Upload({
      client: client,
      params: {
        Bucket: awsConfig.s3BucketName,
        Key: 'facebook_catalog.csv',
        Body: catalogData,
        ACL: 'public-read' // Optional: Make the file publicly accessible 
      },
    });
    parallelUploads3.on("httpUploadProgress", (progress) => {
      logger.info(`Uploaded ${progress.loaded} bytes of ${progress.total} bytes`);
    });
    await parallelUploads3.done();
    logger.info(`Facebook Catalog uploaded to S3 successfully`);
  } catch (error) {
    logger.error('Error uploading to S3:', error);
    throw error;
  }
}

export { uploadToS3 };
