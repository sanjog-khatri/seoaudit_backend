const { pass, warn, fail } = require('../utils/formatResult');

const checkH1 = ($) => {
  const h1s = $('h1');
  const count = h1s.length;
  if (count === 0) {
    return fail('No H1 tag found', 'Add exactly one H1 tag with main keyword');
  }
  if (count > 1) {
    return warn(`Multiple H1 tags (${count})`, 'Use only one H1 per page');
  }
  const text = h1s.first().text().trim();
  return pass(`Single H1 found: "${text}"`);
};

const checkH2s = ($) => {
  const h2s = $('h2');
  const count = h2s.length;
  const texts = h2s.map((i, el) => $(el).text().trim()).get();
  return {
    status: 'info',
    count,
    texts: texts.slice(0, 5) // limit for response
  };
};

const checkH3s = ($) => {
  const h3s = $('h3');
  return {
    status: 'info',
    count: h3s.length
  };
};

const checkHierarchy = ($) => {
  // Simple check for hierarchy issues
  const headings = $('h1, h2, h3').get();
  let issues = [];
  let prevLevel = 0;
  
  headings.forEach((el) => {
    const level = parseInt(el.name[1]);
    if (level > prevLevel + 1) {
      issues.push(`Skipped from H${prevLevel} to H${level}`);
    }
    prevLevel = level;
  });
  
  if (issues.length > 0) {
    return warn(`Heading hierarchy issues: ${issues.join(', ')}`, 'Maintain proper heading hierarchy (H1 > H2 > H3)');
  }
  return pass('Heading hierarchy looks good');
};

module.exports = {
  checkH1,
  checkH2s,
  checkH3s,
  checkHierarchy
};