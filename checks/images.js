const { pass, warn, fail } = require('../utils/formatResult');

const checkAltTexts = ($) => {
  const images = $('img');
  const missingAlt = [];
  const emptyAlt = [];
  
  images.each((i, el) => {
    const alt = $(el).attr('alt');
    const src = $(el).attr('src') || 'unknown';
    if (!alt && !$(el).attr('role') === 'presentation') {
      missingAlt.push(src);
    } else if (alt === '') {
      emptyAlt.push(src);
    }
  });
  
  if (missingAlt.length > 0) {
    return warn(`${missingAlt.length} images missing alt text`, 'Add descriptive alt text to all images');
  }
  if (emptyAlt.length > 0) {
    return warn(`${emptyAlt.length} images have empty alt text`, 'Add meaningful alt text or use role="presentation" for decorative images');
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
  const total = $('img').length;
  if (total > 0 && lazyImages < total * 0.5) {
    return warn(`Only ${lazyImages} of ${total} images use lazy loading`, 'Add loading="lazy" to images below the fold');
  }
  return pass('Good use of lazy loading for images');
};

module.exports = {
  checkAltTexts,
  checkImageCount,
  checkLazyLoading
};