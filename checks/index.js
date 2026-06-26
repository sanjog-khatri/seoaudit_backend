const cheerio = require('cheerio');
const { getDomain } = require('../utils/parseUrl');
const { 
  checkTitle, checkMetaDescription, checkOpenGraph, checkTwitterCard, 
  checkCanonical, checkRobotsMeta, checkViewport 
} = require('./meta');
const { checkH1, checkH2s, checkH3s, checkHierarchy } = require('./headings');
const { checkAltTexts, checkImageCount, checkLazyLoading } = require('./images');
const { 
  checkInternalLinks, checkExternalLinks, checkNoopener, 
  checkGenericAnchors, checkBrokenAnchors 
} = require('./links');
const { checkHttps, checkRobotsTxt, checkSitemap, checkWwwRedirect } = require('./technical');

const runAllChecks = async (html, url) => {
  const $ = cheerio.load(html);
  
  const meta = {
    title: checkTitle($),
    metaDescription: checkMetaDescription($),
    openGraph: checkOpenGraph($),
    twitterCard: checkTwitterCard($),
    canonical: checkCanonical($, url),
    robotsMeta: checkRobotsMeta($),
    viewport: checkViewport($)
  };

  const headings = {
    h1: checkH1($),
    h2s: checkH2s($),
    h3s: checkH3s($),
    hierarchy: checkHierarchy($)
  };

  const images = {
    altTexts: checkAltTexts($),
    count: checkImageCount($),
    lazyLoading: checkLazyLoading($)
  };

  const links = {
    internal: checkInternalLinks($, url),
    external: checkExternalLinks($, url),
    noopener: checkNoopener($, url),
    genericAnchors: checkGenericAnchors($),
    brokenAnchors: checkBrokenAnchors($)
  };

  const technical = {
    https: checkHttps(url),
    robotsTxt: await checkRobotsTxt(getDomain(url)),
    sitemap: await checkSitemap(getDomain(url)),
    wwwRedirect: await checkWwwRedirect(url)
  };

  return {
    meta,
    headings,
    images,
    links,
    technical
  };
};

module.exports = { runAllChecks };