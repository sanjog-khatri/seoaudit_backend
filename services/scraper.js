const fetchPage = require('../utils/fetchPage');
const cheerio = require('cheerio');

const scrape = async (url) => {
  const { html, finalUrl, statusCode, headers } = await fetchPage(url);
  const $ = cheerio.load(html);

  // Detect if page might be client-side rendered (SPA)
  const isSPA = html.includes('id="root"') || 
                html.includes('id="app"') || 
                html.includes('data-reactroot') ||
                html.includes('__NEXT_DATA__') ||
                html.includes('window.__INITIAL_STATE__');

  return {
    $,
    html,
    meta: {
      finalUrl,
      statusCode,
      contentType: headers['content-type'],
      isSPA,
      title: $('head title').first().text().trim() || null
    }
  };
};

module.exports = { scrape };