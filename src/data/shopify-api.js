import Shopify from 'shopify-api-node';
import shopifyConfig from '../config/shopify.js';
import logger from '../utils/logger.js';

const shopify = new Shopify(shopifyConfig);

async function fetchProducts() {
  try {
    let allProducts = [];
    let pageInfo = undefined;

    do {
      const productsResponse = await shopify.product.list({
        limit: 250, // Fetch products in batches of 250 (maximum allowed)
        ...(pageInfo && { page_info: pageInfo }), // Include page_info for subsequent pages
        fields: 'id,title,body_html,handle,available,images,variants,product_type,vendor' // Only fetch necessary fields
      });

      allProducts = allProducts.concat(productsResponse);

      pageInfo = productsResponse.nextPageInfo;
    } while (pageInfo);

    logger.info(`Fetched ${allProducts.length} products from Shopify`);
    return allProducts;
  } catch (error) {
    logger.error('Error fetching products from Shopify:', error);
    throw error; // Re-throw the error for handling in the main function
  }
}

async function fetchProductsByGraphQL() {
  try {
    let allProducts = [];
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
      const query = `
        query ($cursor: String) {
          products(first: 250, after: $cursor) { 
            edges {
              node {
                id
                title
                description
                handle
                featuredImage {
                  url
                }
                priceRangeV2 {
                  maxVariantPrice {
                    amount
                  }
                  minVariantPrice {
                    amount
                  }
                }
                totalInventory
                vendor
                productType
                onlineStoreUrl
                variants(first: 1) {
                  edges {
                    node {
                      price
                      availableForSale
                    }
                  }
                }
              }
              cursor  # Get the cursor for the next page
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      `;

      const variables = { cursor };

      const result = await shopify.graphql(query, variables);
      const products = result.products.edges.map(edge => ({
        ...edge.node,
        variants: edge.node.variants.edges.map(edge => edge.node)
      }));

      allProducts = allProducts.concat(products);
      hasNextPage = result.products.pageInfo.hasNextPage;

      // Update the cursor for the next iteration
      if (hasNextPage) {
        cursor = products[products.length - 1].cursor;
      }
    }

    logger.info(`Fetched ${allProducts.length} products from Shopify (GraphQL)`);
    return allProducts;
  } catch (error) {
    logger.error('Error fetching products from Shopify (GraphQL):', error);
    throw error;
  }
}

export { fetchProducts, fetchProductsByGraphQL };
