const { pass, warn, fail } = require('../utils/formatResult');
const { IDEAL_TITLE_MIN, IDEAL_TITLE_MAX, IDEAL_META_DESC_MIN, IDEAL_META_DESC_MAX } = require('../config');

const checkTitle = ($) => {
  const titleTag = $('head title');
  const title = titleTag.first().text().trim();

  if (!title) {
    return fail('No title tag found', `Add a unique, keyword-rich <title> tag (${IDEAL_TITLE_MIN}-${IDEAL_TITLE_MAX} characters)`);
  }

  // FIXED: Use Array.from to properly count characters (handles Unicode correctly)
  const length = Array.from(title).length;

  if (length < IDEAL_TITLE_MIN) {
    return warn(`Title is too short (${length} chars): "${title}"`, `Make it ${IDEAL_TITLE_MIN}-${IDEAL_TITLE_MAX} characters with main keywords`);
  }
  if (length > IDEAL_TITLE_MAX) {
    return warn(`Title is too long (${length} chars): "${title}"`, `Shorten to ${IDEAL_TITLE_MIN}-${IDEAL_TITLE_MAX} characters to avoid truncation in search results`);
  }
  return pass(`Great title (${length} chars): "${title}"`);
};

const checkMetaDescription = ($) => {
  const metaDesc = $('head meta[name="description"]').attr('content') || '';
  const length = Array.from(metaDesc.trim()).length;

  if (!metaDesc.trim()) {
    return fail('No meta description found', `Add a compelling meta description (${IDEAL_META_DESC_MIN}-${IDEAL_META_DESC_MAX} characters)`);
  }
  if (length < IDEAL_META_DESC_MIN) {
    return warn(`Meta description too short (${length} chars)`, `Expand to ${IDEAL_META_DESC_MIN}-${IDEAL_META_DESC_MAX} characters for better CTR`);
  }
  if (length > IDEAL_META_DESC_MAX) {
    return warn(`Meta description too long (${length} chars)`, `Shorten to ~${IDEAL_META_DESC_MAX} characters to prevent truncation`);
  }
  return pass(`Good meta description (${length} chars)`);
};

const checkOpenGraph = ($) => {
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogUrl = $('meta[property="og:url"]').attr('content');
  const ogType = $('meta[property="og:type"]').attr('content');

  const issues = [];
  if (!ogTitle) issues.push('og:title');
  if (!ogDesc) issues.push('og:description');
  if (!ogImage) issues.push('og:image');
  if (!ogUrl) issues.push('og:url');
  if (!ogType) issues.push('og:type');

  if (issues.length > 0) {
    return warn(`Missing Open Graph tags: ${issues.join(', ')}`, 'Add Open Graph meta tags for better social sharing');
  }
  return pass('Open Graph tags present');
};

const checkTwitterCard = ($) => {
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  const twitterDesc = $('meta[name="twitter:description"]').attr('content');
  const twitterImage = $('meta[name="twitter:image"]').attr('content');

  const issues = [];
  if (!twitterCard) issues.push('twitter:card');
  if (!twitterTitle) issues.push('twitter:title');
  if (!twitterDesc) issues.push('twitter:description');
  if (!twitterImage) issues.push('twitter:image');

  if (issues.length > 0) {
    return warn(`Twitter Card tags incomplete: ${issues.join(', ')}`, 'Add twitter:card, twitter:title, twitter:description, and twitter:image meta tags');
  }
  return pass('Twitter Card tags present');
};

const checkCanonical = ($, url) => {
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    return warn('No canonical tag found', 'Add a canonical link tag to prevent duplicate content issues');
  }
  const normalizedCanonical = canonical.replace(/\/$/, '');
  const normalizedUrl = url.replace(/\/$/, '');
  if (normalizedCanonical !== normalizedUrl) {
    return warn('Canonical URL does not match audited URL', 'Ensure canonical points to the correct URL');
  }
  return pass('Canonical tag is correctly set');
};

const checkRobotsMeta = ($) => {
  const robots = $('meta[name="robots"]').attr('content') || '';
  if (robots.includes('noindex')) {
    return fail('Page has noindex meta tag', 'Remove noindex if you want this page indexed by search engines');
  }
  if (robots.includes('nofollow')) {
    return warn('Page has nofollow meta tag', 'Remove nofollow if you want search engines to follow links on this page');
  }
  return pass('No noindex/nofollow meta tag detected');
};

const checkViewport = ($) => {
  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    return fail('No viewport meta tag found', 'Add viewport meta tag for mobile responsiveness');
  }
  if (!viewport.includes('width=device-width')) {
    return warn('Viewport meta tag may be incorrect', 'Use width=device-width for proper mobile rendering');
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