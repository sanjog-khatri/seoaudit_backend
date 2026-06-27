const axios = require('axios');
const { PAGESPEED_API_KEY } = require('../config');

const getPageSpeed = async (url) => {
  if (!PAGESPEED_API_KEY || PAGESPEED_API_KEY.length < 20 || PAGESPEED_API_KEY.includes('your_google') || PAGESPEED_API_KEY.includes('placeholder')) {
    console.log('⚠️ PageSpeed API key not configured or invalid - using fallback');
    return getFallbackData('API key not configured');
  }

  try {
    // FIXED: Use URLSearchParams to properly pass multiple category values
    const buildParams = (strategy) => {
      const params = new URLSearchParams();
      params.append('url', url);
      params.append('key', PAGESPEED_API_KEY);
      params.append('strategy', strategy);
      // CRITICAL FIX: Must request each category explicitly
      params.append('category', 'performance');
      params.append('category', 'accessibility');
      params.append('category', 'best-practices');
      params.append('category', 'seo');
      return params.toString();
    };

    const [mobileRes, desktopRes] = await Promise.all([
      axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${buildParams('mobile')}`, {
        timeout: 60000,
        validateStatus: (status) => status < 500
      }),
      axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${buildParams('desktop')}`, {
        timeout: 60000,
        validateStatus: (status) => status < 500
      })
    ]);

    // Handle API errors
    if (mobileRes.status !== 200) {
      const errorMsg = mobileRes.data?.error?.message || `Mobile API error: ${mobileRes.status}`;
      console.error('PageSpeed mobile API error:', errorMsg);
      return getFallbackData(errorMsg);
    }
    if (desktopRes.status !== 200) {
      const errorMsg = desktopRes.data?.error?.message || `Desktop API error: ${desktopRes.status}`;
      console.error('PageSpeed desktop API error:', errorMsg);
      return getFallbackData(errorMsg);
    }

    const extractScores = (data) => {
      if (!data || !data.lighthouseResult) {
        console.error('Invalid PageSpeed response structure');
        return null;
      }

      const lh = data.lighthouseResult;
      const categories = lh.categories || {};
      const audits = lh.audits || {};

      // FIXED: Use !== undefined to handle score of 0 correctly
      const getScore = (cat) => {
        const score = categories[cat]?.score;
        return score !== undefined && score !== null ? Math.round(score * 100) : null;
      };

      return {
        performanceScore: getScore('performance'),
        accessibilityScore: getScore('accessibility'),
        bestPracticesScore: getScore('best-practices'),
        seoScore: getScore('seo'),
        coreWebVitals: {
          LCP: audits['largest-contentful-paint']?.displayValue || 'N/A',
          CLS: audits['cumulative-layout-shift']?.displayValue || 'N/A',
          INP: audits['interaction-to-next-paint']?.displayValue || audits['first-input-delay']?.displayValue || 'N/A',
          FCP: audits['first-contentful-paint']?.displayValue || 'N/A',
          TBT: audits['total-blocking-time']?.displayValue || 'N/A',
          TTI: audits['interactive']?.displayValue || 'N/A',
          SI: audits['speed-index']?.displayValue || 'N/A'
        }
      };
    };

    const mobile = extractScores(mobileRes.data);
    const desktop = extractScores(desktopRes.data);

    if (!mobile || !desktop) {
      return getFallbackData('Failed to parse PageSpeed response');
    }

    return { mobile, desktop };

  } catch (error) {
    console.error('PageSpeed API Error:', error.message);
    return getFallbackData(error.message);
  }
};

const getFallbackData = (errorMsg = '') => ({
  mobile: { 
    performanceScore: 70, 
    accessibilityScore: 85, 
    bestPracticesScore: 90, 
    seoScore: 80,
    coreWebVitals: {
      LCP: '2.4 s',
      CLS: '0.12',
      INP: '180 ms',
      FCP: '1.8 s',
      TBT: '320 ms',
      TTI: '3.5 s',
      SI: '3.2 s'
    }
  },
  desktop: { 
    performanceScore: 80, 
    accessibilityScore: 90, 
    bestPracticesScore: 93, 
    seoScore: 85,
    coreWebVitals: {
      LCP: '1.2 s',
      CLS: '0.05',
      INP: '80 ms',
      FCP: '0.8 s',
      TBT: '120 ms',
      TTI: '1.5 s',
      SI: '1.8 s'
    }
  },
  error: errorMsg || 'Using fallback data',
  isFallback: true
});

module.exports = { getPageSpeed };