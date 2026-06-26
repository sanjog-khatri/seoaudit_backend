const { pass, warn, fail } = require('../utils/formatResult');
const axios = require('axios');
const { getDomain } = require('../utils/parseUrl');

const checkHttps = (url) => {
  if (url.startsWith('https://')) {
    return pass('Page uses HTTPS');
  }
  return fail('Page is not using HTTPS', 'Switch to HTTPS for security and SEO');
};

const checkRobotsTxt = async (domain) => {
  try {
    const robotsUrl = `${domain}/robots.txt`;
    const response = await axios.get(robotsUrl, { timeout: 5000 });
    return {
      status: 'pass',
      message: 'robots.txt found',
      content: response.data.substring(0, 500) // limit size
    };
  } catch (e) {
    return warn('robots.txt not found or inaccessible', 'Create a robots.txt file');
  }
};

const checkSitemap = async (domain) => {
  try {
    const sitemapUrl = `${domain}/sitemap.xml`;
    await axios.head(sitemapUrl, { timeout: 5000 });
    return pass('sitemap.xml found');
  } catch (e) {
    return warn('sitemap.xml not found', 'Create and submit a sitemap.xml');
  }
};

const checkWwwRedirect = async (url) => {
  // Simplified check
  try {
    const nonWww = url.replace('www.', '');
    // Would need full redirect chain check, placeholder
    return {
      status: 'info',
      message: 'WWW redirect check (advanced)'
    };
  } catch {
    return warn('WWW redirect issue detected', 'Ensure proper redirects');
  }
};

module.exports = {
  checkHttps,
  checkRobotsTxt,
  checkSitemap,
  checkWwwRedirect
};