import logger from './logger.js';

function handleError(error) {
  logger.error(error.message); // Log the error message

  // Additional error handling actions (optional)
  // - Notify administrators
  // - Send error reports
  // - Fallback logic
}

export default handleError;
