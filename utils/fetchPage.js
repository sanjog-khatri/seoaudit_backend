const axios = require('axios');
const { USER_AGENT } = require('../config');

const fetchPage = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT
      },
      timeout: 10000,
      maxRedirects: 5
    });

    return {
      html: response.data,
      finalUrl: response.request.res.responseUrl || url,
      statusCode: response.status,
      headers: response.headers
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP error! Status: ${error.response.status}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    } else {
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
  }
};

module.exports = fetchPage;