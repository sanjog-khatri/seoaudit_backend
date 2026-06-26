const express = require('express');
const { scrape } = require('../services/scraper');
const { runAllChecks } = require('../checks');
const { getPageSpeed } = require('../services/pagespeed');
const { structuredData } = require('../services/structured-data');
const { calculateOverallScore } = require('../services/scorer');
const { isValidUrl, normalizeUrl } = require('../utils/parseUrl');

const router = express.Router();

router.post('/audit', async (req, res) => {
  try {
    let { url } = req.body;
    
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    url = normalizeUrl(url);

    // Scrape page
    const { $, html, meta: scrapeMeta } = await scrape(url);

    // Run checks
    const checkResults = await runAllChecks(html, url);

    // PageSpeed
    const pageSpeedData = await getPageSpeed(url);

    // Structured data
    const sd = structuredData($);

    // Calculate score
    const scoreData = calculateOverallScore(checkResults, pageSpeedData.mobile?.seoScore || 0);

    const response = {
      url,
      timestamp: new Date().toISOString(),
      overallScore: scoreData,
      pageSpeed: pageSpeedData,
      structuredData: sd,
      checks: checkResults,
      scrapeMeta
    };

    res.json(response);
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ 
      error: 'Failed to perform audit', 
      message: error.message 
    });
  }
});

module.exports = router;