const axios = require('axios');

const fetchRobotsTxt = async (domain) => {
  try {
    const response = await axios.get(`${domain}/robots.txt`, { timeout: 5000 });
    return {
      status: 'found',
      content: response.data
    };
  } catch (e) {
    return { status: 'not_found' };
  }
};

const parseRobotsTxt = (content, url) => {
  // Basic parser - checks for disallow
  if (!content) return { disallowed: false };
  const lines = content.toLowerCase().split('\n');
  let disallowed = false;
  for (let line of lines) {
    if (line.includes('disallow:') && line.includes(url.split('/').pop() || '')) {
      disallowed = true;
      break;
    }
  }
  return { disallowed };
};

const fetchSitemap = async (domain) => {
  try {
    await axios.head(`${domain}/sitemap.xml`, { timeout: 5000 });
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