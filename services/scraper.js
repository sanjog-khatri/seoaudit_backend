const fetchPage = require('../utils/fetchPage');
const cheerio = require('cheerio');

const scrape = async (url) => {
  const { html, finalUrl, statusCode } = await fetchPage(url);
  const $ = cheerio.load(html);
  
  return {
    $,
    html,
    meta: {
      finalUrl,
      statusCode
    }
  };
};

module.exports = { scrape };