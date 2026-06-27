const axios = require('axios');

const fetchRobotsTxt = async (domain) => {
  try {
    const response = await axios.get(`${domain}/robots.txt`, { 
      timeout: 5000,
      maxRedirects: 0
    });
    return {
      status: 'found',
      content: response.data
    };
  } catch (e) {
    return { status: 'not_found' };
  }
};

const parseRobotsTxt = (content, urlPath) => {
  if (!content) return { disallowed: false, allowed: true, sitemaps: [] };

  const lines = content.split('\n');
  let disallowed = false;
  let sitemaps = [];
  let currentUserAgent = '*';
  let inRelevantSection = true;

  for (let line of lines) {
    line = line.trim().toLowerCase();
    if (line.startsWith('#') || !line) continue;

    if (line.startsWith('user-agent:')) {
      const ua = line.split(':')[1]?.trim();
      inRelevantSection = (ua === '*' || ua.includes('google') || ua.includes('bot'));
      currentUserAgent = ua;
    } else if (inRelevantSection && line.startsWith('disallow:')) {
      const path = line.split(':')[1]?.trim();
      if (path) {
        // Simple path matching - check if urlPath starts with disallow path
        const normalizedPath = urlPath.split('?')[0]; // Remove query params
        if (normalizedPath.startsWith(path) || path === '/') {
          disallowed = true;
        }
      }
    } else if (line.startsWith('sitemap:')) {
      sitemaps.push(line.split(':')[1]?.trim());
    }
  }

  return { disallowed, allowed: !disallowed, sitemaps: [...new Set(sitemaps)] };
};

const fetchSitemap = async (domain) => {
  try {
    await axios.get(`${domain}/sitemap.xml`, { timeout: 5000 });
    return { status: 'found' };
  } catch {
    return { status: 'not_found' };
  }
};

module.exports = {
  fetchRobotsTxt,
  parseRobotsTxt,
  fetchSitemap
};