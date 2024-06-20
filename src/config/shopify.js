import dotenv from 'dotenv';
dotenv.config();

const shopifyConfig = {
  shopName: process.env.SHOPIFY_SHOP_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_PASSWORD,
  apiVersion: '2023-10', // Update to the latest stable version
};

export default shopifyConfig;
