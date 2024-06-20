import logger from '../utils/logger.js';
import shopifyConfig from '../config/shopify.js'

function convertShopifyToFacebook(products) {
  try {
    // Facebook Catalog Header
    const header = [
      'id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 
      'brand', 'google_product_category'
    ];
    
    const facebookCatalogRows = products.map((product) => {
      const variant = product.variants[0]; // Assuming you want to use the first variant
      
      return [
        product.id,
        product.title,
        product.body_html?.replace?.(/<[^>]*>?/gm, '') || `${product.title} - description`, // Remove HTML tags
        product.available ? 'in stock' : 'out of stock',
        'new',
        `${variant.price} USD`, // Format price with currency
        `https://${shopifyConfig.shopName}.myshopify.com/products/${product.handle}`,
        product.images[0]?.src || '', // Use the first image, or empty string if none
        product.vendor || '',
        product.product_type || '' // You might need to map this to Google's taxonomy
      ];
    });
    
    // Combine header and rows into CSV content
    const csvContent = [header.join(','), ...facebookCatalogRows.map(row => row.join(','))].join('\n');

    logger.info(`Converted ${products.length} products to Facebook Catalog format`);
    return csvContent;
  } catch (error) {
    logger.error('Error converting products:', error);
    throw error; // Re-throw the error to be handled in the main function
  }
}

function convertShopifyToFacebookGraphQLType(products) {
  try {
    // Facebook Catalog Header
    const header = [
      'id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 
      'brand', 'google_product_category'
    ];
    
    const facebookCatalogRows = products.map((product) => {
      const variant = product.variants[0]; // Assuming you want to use the first variant
      
      return [
        product.id?.replace('gid://shopify/Product/', ''),
        product.title,
        product.description || `${product.title} - description`,
        product.totalInventory > 0 ? 'in stock' : 'out of stock',
        'new',
        `${variant.price} USD`, // Format price with currency
        product.onlineStoreUrl || `https://${shopifyConfig.shopName}.myshopify.com/products/${product.handle}`,
        product.featuredImage?.url || '', // Use the first image, or empty string if none
        product.vendor || '',
        product.product_type || '' // You might need to map this to Google's taxonomy
      ];
    });
    
    // Combine header and rows into CSV content
    const csvContent = [header.join(','), ...facebookCatalogRows.map(row => row.join(','))].join('\n');

    logger.info(`Converted ${products.length} products to Facebook Catalog format`);
    return csvContent;
  } catch (error) {
    logger.error('Error converting products:', error);
    throw error; // Re-throw the error to be handled in the main function
  }
}

export { convertShopifyToFacebook, convertShopifyToFacebookGraphQLType };
