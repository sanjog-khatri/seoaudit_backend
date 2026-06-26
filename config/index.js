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
    meta: 25,
    headings: 15,
    images: 15,
    structuredData: 15,
    technical: 15,
    pagespeed: 15
  }
};

module.exports = {
  PORT,
  PAGESPEED_API_KEY,
  USER_AGENT,
  ...CONSTANTS
};