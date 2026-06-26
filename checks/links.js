const { pass, warn, fail } = require('../utils/formatResult');
const { isInternal } = require('../utils/parseUrl');

const checkInternalLinks = ($, url) => {
  const links = $('a[href]').filter((i, el) => {
    const href = $(el).attr('href');
    return href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:');
  });
  const internal = links.filter((i, el) => isInternal($(el).attr('href'), url)).length;
  return {
    status: 'info',
    count: internal
  };
};

const checkExternalLinks = ($, url) => {
  const links = $('a[href]').filter((i, el) => {
    const href = $(el).attr('href');
    return href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:');
  });
  const external = links.filter((i, el) => !isInternal($(el).attr('href'), url)).length;
  return {
    status: 'info',
    count: external
  };
};

const checkNoopener = ($, url) => {
  const externalLinks = $('a[href]').filter((i, el) => !isInternal($(el).attr('href'), url));
  const missingNoopener = externalLinks.filter((i, el) => {
    const rel = $(el).attr('rel') || '';
    return !rel.includes('noopener') || !rel.includes('noreferrer');
  }).length;
  
  if (missingNoopener > 0) {
    return warn(`${missingNoopener} external links missing rel="noopener noreferrer"`, 'Add rel="noopener noreferrer" to external links for security');
  }
  return pass('All external links have proper security attributes');
};

const checkGenericAnchors = ($) => {
  const genericTexts = ['click here', 'read more', 'here', 'learn more'];
  const genericLinks = $('a').filter((i, el) => {
    const text = $(el).text().toLowerCase().trim();
    return genericTexts.some(gt => text.includes(gt));
  }).length;
  
  if (genericLinks > 0) {
    return warn(`${genericLinks} links with generic anchor text`, 'Use descriptive, keyword-rich anchor text');
  }
  return pass('No generic anchor texts found');
};

const checkBrokenAnchors = ($) => {
  const broken = $('a[href="#"], a[href=""]').length;
  if (broken > 0) {
    return warn(`${broken} broken or empty anchor links`, 'Fix links with empty href or "#"');
  }
  return pass('No obvious broken anchor links');
};

module.exports = {
  checkInternalLinks,
  checkExternalLinks,
  checkNoopener,
  checkGenericAnchors,
  checkBrokenAnchors
};