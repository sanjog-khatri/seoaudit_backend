const { pass, warn, fail } = require('../utils/formatResult');
const axios = require('axios');
const { getDomain } = require('../utils/parseUrl');

const checkHttps = (url) => {
  if (url.startsWith('https://')) {
    return pass('Page uses HTTPS');
  }
  return fail('Page is not using HTTPS', 'Switch to HTTPS for security and SEO ranking boost');
};

const checkRobotsTxt = async (domain) => {
  try {
    const robotsUrl = `${domain}/robots.txt`;
    const response = await axios.get(robotsUrl, { 
      timeout: 5000,
      maxRedirects: 0,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOAuditBot/1.0)'
      }
    });

    // Parse sitemap references from robots.txt
    const sitemapMatches = response.data.match(/^Sitemap:\s*(.+)$/gmi) || [];
    const sitemaps = sitemapMatches.map(line => line.replace(/^Sitemap:\s*/i, '').trim());

    return {
      status: 'pass',
      message: 'robots.txt found',
      sitemaps: sitemaps.slice(0, 5)
    };
  } catch (e) {
    if (e.response && e.response.status === 404) {
      return warn('robots.txt not found (404)', 'Create a robots.txt file at the root of your domain');
    }
    return warn('robots.txt not found or inaccessible', 'Create a robots.txt file');
  }
};

const checkSitemap = async (domain) => {
  // FIXED: Try multiple sitemap paths
  const sitemapPaths = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemap-index.xml',
    '/sitemap.php'
  ];

  // Also check robots.txt for sitemap references first
  try {
    const robotsResponse = await axios.get(`${domain}/robots.txt`, { 
      timeout: 5000,
      maxRedirects: 0
    });
    const sitemapMatches = robotsResponse.data.match(/^Sitemap:\s*(.+)$/gmi) || [];
    if (sitemapMatches.length > 0) {
      return pass(`sitemap found via robots.txt (${sitemapMatches.length} reference(s))`);
    }
  } catch {
    // robots.txt not found, continue with path checks
  }

  for (const path of sitemapPaths) {
    try {
      const response = await axios.get(`${domain}${path}`, { 
        timeout: 5000,
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      });
      if (response.status === 200) {
        return pass(`sitemap found at ${path}`);
      }
    } catch {
      // Continue to next path
    }
  }

  return warn('sitemap.xml not found', 'Create and submit a sitemap.xml to Google Search Console');
};

const checkWwwRedirect = async (url) => {
  try {
    const hasWww = url.includes('://www.');
    const nonWww = url.replace('www.', '');
    const wwwVersion = hasWww ? url : url.replace('://', '://www.');

    const response = await axios.get(nonWww, { 
      timeout: 5000, 
      maxRedirects: 0,
      validateStatus: () => true
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location || '';
      if (location.includes('www.')) {
        return pass('WWW redirect properly configured (non-www → www)');
      }
    }

    const wwwResponse = await axios.get(wwwVersion, { 
      timeout: 5000, 
      maxRedirects: 0,
      validateStatus: () => true
    });

    if (wwwResponse.status >= 300 && wwwResponse.status < 400) {
      const location = wwwResponse.headers.location || '';
      if (!location.includes('www.')) {
        return pass('WWW redirect properly configured (www → non-www)');
      }
    }

    return {
      status: 'info',
      message: 'No WWW redirect detected - ensure consistent canonical URL preference'
    };
  } catch (error) {
    return warn('Could not verify WWW redirect', 'Ensure proper redirects are in place');
  }
};

module.exports = {
  checkHttps,
  checkRobotsTxt,
  checkSitemap,
  checkWwwRedirect
};