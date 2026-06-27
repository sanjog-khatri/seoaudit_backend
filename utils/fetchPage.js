const axios = require('axios');
const { USER_AGENT } = require('../config');

const fetchPage = async (url, retries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 20000,
        maxRedirects: 5,
        responseType: 'text',
        responseEncoding: 'utf8',
        // Handle compressed responses
        decompress: true
      });

      // FIXED: Validate status code
      if (response.status >= 400) {
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText || 'Unknown error'}`);
      }

      return {
        html: response.data,
        finalUrl: response.request.res.responseUrl || url,
        statusCode: response.status,
        headers: response.headers
      };
    } catch (error) {
      lastError = error;

      // Retry on timeout or 5xx errors
      if (attempt < retries && (error.code === 'ECONNABORTED' || 
          (error.response && error.response.status >= 500))) {
        console.log(`Retry ${attempt + 1}/${retries} for ${url}`);
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // Exponential backoff
        continue;
      }

      break;
    }
  }

  // All retries exhausted or non-retryable error
  if (lastError.response) {
    throw new Error(`HTTP error! Status: ${lastError.response.status} - ${lastError.response.statusText || 'Unknown error'}`);
  } else if (lastError.code === 'ECONNABORTED') {
    throw new Error('Request timeout - the server took too long to respond');
  } else if (lastError.code === 'ENOTFOUND') {
    throw new Error('Domain not found - check the URL spelling');
  } else if (lastError.code === 'ECONNREFUSED') {
    throw new Error('Connection refused - the server is not accepting connections');
  } else if (lastError.code === 'CERT_HAS_EXPIRED' || lastError.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    throw new Error('SSL certificate error - the site has an invalid or expired certificate');
  } else {
    throw new Error(`Failed to fetch page: ${lastError.message}`);
  }
};

module.exports = fetchPage;