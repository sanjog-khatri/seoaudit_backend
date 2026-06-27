const { pass, warn, fail } = require('../utils/formatResult');
const { isInternal } = require('../utils/parseUrl');

// Helper to get valid link elements (excludes anchors, mailto, tel)
const getValidLinks = ($) => {
  return $('a[href]').filter((i, el) => {
    const href = $(el).attr('href');
    return href && !href.startsWith('mailto:') && !href.startsWith('tel:');
  });
};

const checkInternalLinks = ($, url) => {
  const links = getValidLinks($);
  const internal = links.filter((i, el) => {
    const href = $(el).attr('href');
    return !href.startsWith('#') && isInternal(href, url);
  }).length;
  return {
    status: 'info',
    count: internal
  };
};

const checkExternalLinks = ($, url) => {
  const links = getValidLinks($);
  const external = links.filter((i, el) => {
    const href = $(el).attr('href');
    return !href.startsWith('#') && !isInternal(href, url);
  }).length;
  return {
    status: 'info',
    count: external
  };
};

const checkNoopener = ($, url) => {
  const externalLinks = getValidLinks($).filter((i, el) => {
    const href = $(el).attr('href');
    return !href.startsWith('#') && !isInternal(href, url);
  });
  const missingNoopener = externalLinks.filter((i, el) => {
    const rel = ($(el).attr('rel') || '').toLowerCase();
    return !rel.includes('noopener');
  }).length;

  if (missingNoopener > 0) {
    return warn(`${missingNoopener} external links missing rel="noopener"`, 'Add rel="noopener noreferrer" to external links for security and SEO');
  }
  return pass('All external links have proper security attributes');
};

const checkGenericAnchors = ($) => {
  const genericTexts = ['click here', 'read more', 'here', 'learn more', 'more', 'link', 'website'];
  let genericLinks = [];

  $('a').each((i, el) => {
    const text = $(el).text().toLowerCase().trim();
    const hasGeneric = genericTexts.some(gt => text.includes(gt));
    if (hasGeneric) {
      // Check for accessible alternatives
      const ariaLabel = $(el).attr('aria-label');
      const title = $(el).attr('title');
      const ariaLabelledBy = $(el).attr('aria-labelledby');

      // Check surrounding context - look for parent card/entry with heading
      const parent = $(el).closest('article, .card, [class*="card"], .post, [class*="post"], .entry, [class*="entry"], .teaser, [class*="teaser"]');
      const cardHeading = parent.find('h2, h3, h4').first().text().trim();

      // Check if link is in a list item with context
      const listItem = $(el).closest('li');
      const listContext = listItem.length > 0 ? listItem.text().trim() : '';
      const hasListContext = listContext.length > text.length + 10;

      // If any accessible context exists, it's acceptable
      if (!ariaLabel && !title && !ariaLabelledBy && !cardHeading && !hasListContext) {
        genericLinks.push(text.substring(0, 30));
      }
    }
  });

  if (genericLinks.length > 0) {
    return warn(`${genericLinks.length} links with generic anchor text`, 'Use descriptive, keyword-rich anchor text for better SEO and accessibility');
  }
  return pass('No generic anchor texts found');
};

const checkBrokenAnchors = ($) => {
  const allLinks = $('a');
  let brokenNavLinks = 0;
  let jsInteractiveLinks = 0;
  let anchorLinks = 0; // href="#section" - legitimate

  allLinks.each((i, el) => {
    const href = $(el).attr('href');

    // Skip links with actual URLs
    if (href && href.startsWith('http')) return;
    if (href && href.startsWith('/')) return;
    if (href && href.startsWith('./')) return;
    if (href && href.startsWith('../')) return;

    const hasJsHandler = $(el).attr('onclick') || 
                         $(el).attr('data-toggle') || 
                         $(el).attr('data-target') ||
                         $(el).attr('data-bs-toggle') ||
                         $(el).hasClass('dropdown-toggle') ||
                         $(el).attr('role') === 'button' ||
                         $(el).attr('aria-haspopup') ||
                         $(el).attr('data-toggle');

    if (!href || href === '' || href === '#') {
      if (hasJsHandler) {
        jsInteractiveLinks++;
      } else {
        brokenNavLinks++;
      }
    } else if (href.startsWith('#') && href.length > 1) {
      // href="#section" - legitimate anchor link
      anchorLinks++;
    }
  });

  if (brokenNavLinks > 0) {
    let message = `${brokenNavLinks} broken or empty anchor links`;
    const extras = [];
    if (jsInteractiveLinks > 0) extras.push(`${jsInteractiveLinks} are JS-interactive`);
    if (anchorLinks > 0) extras.push(`${anchorLinks} are section anchor links`);
    if (extras.length > 0) message += ` (${extras.join(', ')})`;

    return warn(message, 'Fix navigation links with empty href. JS-interactive elements should use <button> for accessibility.');
  }

  if (jsInteractiveLinks > 0) {
    return warn(`${jsInteractiveLinks} links used as JS-interactive elements`, 'Consider using <button> elements instead of <a> for interactive controls (better accessibility)');
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