import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchProductsByGraphQL } from './data/shopify-api.js';
import { convertShopifyToFacebookGraphQLType } from './data/data-converter.js';
import { uploadToS3 } from './s3/s3-uploader.js';
import handleError from './utils/error-handler.js';
import logger from './utils/logger.js';
import awsConfig from './config/aws.js';

const app = express();
const PORT = process.env.PORT || 5555; // Use PORT from environment or 3000
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main function (now exported)
export async function main() {
  try {
    logger.info('Shopify to Facebook Catalog conversion process started...');

    const products = await fetchProductsByGraphQL();
    const facebookCatalog = convertShopifyToFacebookGraphQLType(products);
    await uploadToS3(facebookCatalog);

    logger.info('Process completed successfully!');
  } catch (error) {
    handleError(error);
  }
}

// Route to trigger the process
app.get('/trigger-sync', async (req, res) => {
  try {
    logger.info('Sync triggered via HTTP request');
    await main();

    // Get the S3 URL
    const s3Link = `https://${awsConfig.s3BucketName}.s3.amazonaws.com/facebook_catalog.csv`; 

    res.status(200).json({
      message: 'Sync process initiated successfully!',
      s3Link: s3Link,
    });
  } catch (error) {
    handleError(error);
    res.status(500).json({ error: 'An error occurred during the sync process.' });
  }
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
