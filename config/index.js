require('dotenv').config();

const PORT = process.env.PORT || 5000;
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY;

const USER_AGENT = 'Mozilla/5.0 (compatible; SEOAuditBot/1.0; +https://yourdomain.com)';

const CONSTANTS = {
  IDEAL_TITLE_MIN: 50,
  IDEAL_TITLE_MAX: 60,
  IDEAL_META_DESC_MIN: 150,
  IDEAL_META_DESC_MAX: 160,
  SCORE_WEIGHTS: {
    meta: 20,
    headings: 15,
    images: 15,
    links: 10,
    structuredData: 15,
    technical: 10,
    pagespeed: 15
  }
};

// Verify weights sum to 100
const totalWeight = Object.values(CONSTANTS.SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
if (totalWeight !== 100) {
  console.error(`WARNING: SCORE_WEIGHTS sum to ${totalWeight}, not 100`);
}

module.exports = {
  PORT,
  PAGESPEED_API_KEY,
  USER_AGENT,
  ...CONSTANTS
};