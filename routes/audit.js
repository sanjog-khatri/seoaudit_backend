const express = require('express');
const { scrape } = require('../services/scraper');
const { runAllChecks } = require('../checks');
const { getPageSpeed } = require('../services/pagespeed');
const { structuredData } = require('../services/structured-data');
const { calculateOverallScore } = require('../services/scorer');
const { isValidUrl, normalizeUrl } = require('../utils/parseUrl');

const router = express.Router();

const withTimeout = (promise, ms, label) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    )
  ]);
};

router.post('/audit', async (req, res) => {
  const startTime = Date.now();

  try {
    let { url } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ 
        error: 'Valid URL is required',
        message: 'Please provide a full URL including http:// or https://'
      });
    }

    url = normalizeUrl(url);

    // Scrape page with timeout
    const { $, html, meta: scrapeMeta } = await withTimeout(
      scrape(url), 
      25000, 
      'Page scrape'
    );

    // Run checks
    const checkResults = await runAllChecks(html, scrapeMeta.finalUrl || url);

    // PageSpeed with timeout
    const pageSpeedData = await withTimeout(
      getPageSpeed(url),
      70000,
      'PageSpeed analysis'
    );

    // Structured data
    const sd = structuredData($);

    // Calculate score
    const scoreData = calculateOverallScore(
      checkResults, 
      pageSpeedData.mobile?.seoScore || pageSpeedData.desktop?.seoScore || 75,
      sd
    );

    const response = {
      url,
      timestamp: new Date().toISOString(),
      auditDuration: Date.now() - startTime,
      overallScore: scoreData,
      pageSpeed: pageSpeedData,
      structuredData: sd,
      checks: checkResults,
      scrapeMeta,
      warnings: []
    };

    // Add SPA warning if detected
    if (scrapeMeta.isSPA) {
      response.warnings.push('This appears to be a client-side rendered (SPA) site. Some SEO elements may be injected by JavaScript and not visible in this static audit.');
    }

    // Add PageSpeed fallback warning
    if (pageSpeedData.isFallback) {
      response.warnings.push('PageSpeed data is using fallback values. API key may be invalid or quota exceeded.');
    }

    res.json(response);
  } catch (error) {
    console.error('Audit error:', error);

    const errorMessage = error.message || 'Unknown error';
    let statusCode = 500;
    let errorType = 'internal_error';

    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      statusCode = 504;
      errorType = 'timeout';
    } else if (errorMessage.includes('Domain not found') || errorMessage.includes('ENOTFOUND')) {
      statusCode = 400;
      errorType = 'dns_error';
    } else if (errorMessage.includes('HTTP error')) {
      statusCode = 422;
      errorType = 'http_error';
    } else if (errorMessage.includes('SSL certificate')) {
      statusCode = 400;
      errorType = 'ssl_error';
    } else if (errorMessage.includes('Connection refused')) {
      statusCode = 503;
      errorType = 'connection_refused';
    }

    res.status(statusCode).json({ 
      error: 'Failed to perform audit',
      type: errorType,
      message: errorMessage
    });
  }
});

module.exports = router;