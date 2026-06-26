const axios = require('axios');
const { PAGESPEED_API_KEY } = require('../config');

const getPageSpeed = async (url) => {
  if (!PAGESPEED_API_KEY) {
    return {
      mobile: { performanceScore: null, seoScore: 0 },
      desktop: { performanceScore: null, seoScore: 0 },
      error: 'PageSpeed API key not configured'
    };
  }

  try {
    const [mobileRes, desktopRes] = await Promise.all([
      axios.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed', {
        params: {
          url,
          key: PAGESPEED_API_KEY,
          strategy: 'mobile'
        }
      }),
      axios.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed', {
        params: {
          url,
          key: PAGESPEED_API_KEY,
          strategy: 'desktop'
        }
      })
    ]);

    const extractScores = (data) => ({
      performanceScore: data.lighthouseResult?.categories?.performance?.score * 100 || null,
      accessibilityScore: data.lighthouseResult?.categories?.accessibility?.score * 100 || null,
      bestPracticesScore: data.lighthouseResult?.categories?.['best-practices']?.score * 100 || null,
      seoScore: data.lighthouseResult?.categories?.seo?.score * 100 || null,
      coreWebVitals: {
        LCP: data.lighthouseResult?.audits['largest-contentful-paint']?.displayValue || 'N/A',
        CLS: data.lighthouseResult?.audits['cumulative-layout-shift']?.displayValue || 'N/A',
        INP: data.lighthouseResult?.audits['interaction-to-next-paint']?.displayValue || 'N/A'
      }
    });

    return {
      mobile: extractScores(mobileRes.data),
      desktop: extractScores(desktopRes.data)
    };
  } catch (error) {
    console.error('PageSpeed API error:', error.message);
    return {
      mobile: { performanceScore: null, seoScore: 0 },
      desktop: { performanceScore: null, seoScore: 0 },
      error: error.message
    };
  }
};

module.exports = { getPageSpeed };