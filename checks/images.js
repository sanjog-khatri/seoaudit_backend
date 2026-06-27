const { pass, warn, fail } = require('../utils/formatResult');

const checkAltTexts = ($) => {
  const images = $('img');
  const missingAlt = [];
  const emptyAltNoContext = [];
  const emptyAltWithContext = [];

  images.each((i, el) => {
    const alt = $(el).attr('alt');
    const src = $(el).attr('src') || 'unknown';
    const role = $(el).attr('role');
    const ariaHidden = $(el).attr('aria-hidden');
    const width = parseInt($(el).attr('width')) || 0;
    const height = parseInt($(el).attr('height')) || 0;

    const isDecorative = role === 'presentation' || role === 'none' || ariaHidden === 'true';
    const parentLink = $(el).closest('a[aria-label], a[title], button[aria-label], button[title]');
    const hasAccessibleParent = parentLink.length > 0;
    const isLikelyIcon = (width > 0 && width <= 64) || (height > 0 && height <= 64);

    if (alt === undefined) {
      if (!isDecorative) {
        missingAlt.push(src);
      }
    } else if (alt === '') {
      if (isDecorative || hasAccessibleParent || isLikelyIcon) {
        emptyAltWithContext.push(src);
      } else {
        emptyAltNoContext.push(src);
      }
    }
  });

  if (missingAlt.length > 0) {
    return fail(`${missingAlt.length} images missing alt text`, 'Add descriptive alt text to all informative images. Use role="presentation" for decorative images.');
  }
  if (emptyAltNoContext.length > 0) {
    return warn(`${emptyAltNoContext.length} images have empty alt text without context`, 'Add meaningful alt text, or use role="presentation" / aria-hidden="true" for decorative images. If inside a link/button, ensure the parent has aria-label.');
  }
  if (emptyAltWithContext.length > 0) {
    return pass(`All images have appropriate alt text (${emptyAltWithContext.length} decorative/contextual images with empty alt)`);
  }
  return pass('All images have appropriate alt text');
};

const checkImageCount = ($) => {
  const count = $('img').length;
  return {
    status: 'info',
    count
  };
};

const checkLazyLoading = ($) => {
  const lazyImages = $('img[loading="lazy"]').length;
  const dataSrcImages = $('img[data-src]').length;
  const total = $('img').length;
  const totalLazy = lazyImages + dataSrcImages;

  if (total > 0 && totalLazy < total * 0.5) {
    return warn(`Only ${totalLazy} of ${total} images use lazy loading`, 'Add loading="lazy" or data-src pattern to images below the fold');
  }
  return pass('Good use of lazy loading for images');
};

const checkImageDimensions = ($) => {
  const images = $('img');
  let missingDimensions = 0;
  let hasAspectRatio = 0;
  let largeMissing = 0;  // Track large images missing dimensions (more concerning)

  images.each((i, el) => {
    const width = $(el).attr('width');
    const height = $(el).attr('height');
    const style = ($(el).attr('style') || '').toLowerCase();
    const imgWidth = parseInt($(el).attr('width')) || parseInt($(el).css('width')) || 0;
    const imgHeight = parseInt($(el).attr('height')) || parseInt($(el).css('height')) || 0;

    const hasCssDimensions = style.includes('aspect-ratio') || 
                             (style.includes('width') && style.includes('height'));

    if (!width || !height) {
      if (!hasCssDimensions) {
        missingDimensions++;
        // Count as "large" if dimensions suggest it's a content image
        if (imgWidth > 200 || imgHeight > 200) {
          largeMissing++;
        }
      } else {
        hasAspectRatio++;
      }
    }
  });

  // FIXED: Return info-level for missing dimensions since we can't see external CSS
  // Only warn if large images (>200px) are missing dimensions
  if (missingDimensions > 0) {
    let message = `${missingDimensions} images missing width/height attributes`;
    if (hasAspectRatio > 0) {
      message += ` (${hasAspectRatio} use CSS aspect-ratio instead)`;
    }

    if (largeMissing > 0) {
      return warn(`${message} (${largeMissing} are large images)`, 
        'Large images should have explicit width/height or CSS aspect-ratio to prevent Cumulative Layout Shift (CLS)');
    }

    // Small/medium images without dimensions = info only
    return {
      status: 'info',
      message: `${message} — dimensions may be handled via external CSS`,
      fix: 'Add explicit width/height or CSS aspect-ratio for better CLS performance'
    };
  }

  if (hasAspectRatio > 0) {
    return pass(`${hasAspectRatio} images use CSS aspect-ratio for dimension control`);
  }
  return pass('All images have width/height attributes');
};

module.exports = {
  checkAltTexts,
  checkImageCount,
  checkLazyLoading,
  checkImageDimensions
};