const { pass, warn, fail } = require('../utils/formatResult');
const { IDEAL_TITLE_MIN, IDEAL_TITLE_MAX, IDEAL_META_DESC_MIN, IDEAL_META_DESC_MAX } = require('../config');

const checkTitle = ($) => {
  const title = $('title').first().text().trim();
  if (!title) {
    return fail('No title tag found', 'Add a descriptive <title> tag');
  }
  const length = title.length;
  if (length < IDEAL_TITLE_MIN) {
    return warn(`Title is too short (${length} chars)`, `Aim for ${IDEAL_TITLE_MIN}-${IDEAL_TITLE_MAX} characters`);
  }
  if (length > IDEAL_TITLE_MAX) {
    return warn(`Title is too long (${length} chars)`, `Aim for ${IDEAL_TITLE_MIN}-${IDEAL_TITLE_MAX} characters`);
  }
  return pass(`Title is good (${length} chars): "${title}"`);
};

const checkMetaDescription = ($) => {
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  if (!metaDesc) {
    return fail('No meta description found', 'Add a meta description tag');
  }
  const length = metaDesc.length;
  if (length < IDEAL_META_DESC_MIN) {
    return warn(`Meta description too short (${length} chars)`, `Aim for ${IDEAL_META_DESC_MIN}-${IDEAL_META_DESC_MAX} characters`);
  }
  if (length > IDEAL_META_DESC_MAX) {
    return warn(`Meta description too long (${length} chars)`, `Aim for ${IDEAL_META_DESC_MIN}-${IDEAL_META_DESC_MAX} characters`);
  }
  return pass(`Meta description is good (${length} chars)`);
};

const checkOpenGraph = ($) => {
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  
  const issues = [];
  if (!ogTitle) issues.push('og:title');
  if (!ogDesc) issues.push('og:description');
  if (!ogImage) issues.push('og:image');

  if (issues.length > 0) {
    return warn(`Missing Open Graph tags: ${issues.join(', ')}`, 'Add Open Graph meta tags for better social sharing');
  }
  return pass('Open Graph tags present');
};

const checkTwitterCard = ($) => {
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  
  if (!twitterCard || !twitterTitle) {
    return warn('Twitter Card tags incomplete', 'Add twitter:card and twitter:title meta tags');
  }
  return pass('Twitter Card tags present');
};

const checkCanonical = ($, url) => {
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    return warn('No canonical tag found', 'Add a canonical link tag');
  }
  if (canonical !== url && canonical !== url.replace(/\/$/, '')) {
    return warn('Canonical URL does not match audited URL', 'Ensure canonical points to the correct URL');
  }
  return pass('Canonical tag is correctly set');
};

const checkRobotsMeta = ($) => {
  const robots = $('meta[name="robots"]').attr('content') || '';
  if (robots.includes('noindex')) {
    return fail('Page has noindex meta tag', 'Remove noindex if you want this page indexed');
  }
  return pass('No noindex meta tag detected');
};

const checkViewport = ($) => {
  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    return warn('No viewport meta tag found', 'Add viewport meta tag for mobile responsiveness');
  }
  return pass('Viewport meta tag present');
};

module.exports = {
  checkTitle,
  checkMetaDescription,
  checkOpenGraph,
  checkTwitterCard,
  checkCanonical,
  checkRobotsMeta,
  checkViewport
};