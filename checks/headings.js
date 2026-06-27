const { pass, warn, fail } = require('../utils/formatResult');

const checkH1 = ($) => {
  const h1s = $('h1');
  const count = h1s.length;
  if (count === 0) {
    return fail('No H1 tag found', 'Add exactly one H1 tag with main keyword');
  }
  if (count > 1) {
    const sectioningParents = h1s.map((i, el) => {
      const parent = $(el).closest('article, section, aside, nav, main').prop('tagName') || 'body';
      return parent.toLowerCase();
    }).get();
    const uniqueParents = [...new Set(sectioningParents)];

    if (uniqueParents.length > 1) {
      return warn(`Multiple H1 tags (${count}) in ${uniqueParents.length} sections`, 
        'Multiple H1s are valid in HTML5 when inside separate <article>, <section>, etc. Ensure the main content H1 is most prominent');
    }
    return warn(`Multiple H1 tags (${count})`, 'Use only one H1 per page for clear content hierarchy');
  }
  const text = h1s.first().text().trim();
  if (text.length < 10) {
    return warn('H1 tag is very short', 'Use a descriptive H1 with your main keyword (20-70 characters recommended)');
  }
  return pass(`Single H1 found: "${text}"`);
};

const checkH2s = ($) => {
  const h2s = $('h2');
  const count = h2s.length;
  const texts = h2s.map((i, el) => $(el).text().trim()).get();

  if (count === 0) {
    return warn('No H2 tags found', 'Add H2 tags to structure your content into sections');
  }

  return {
    status: 'info',
    count,
    texts: texts.slice(0, 5)
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
  // FIXED: Check hierarchy within direct sibling groups, not across entire sections
  // A "skip" is only bad if it happens within the same content block (same parent)
  const sectioningElements = ['main', 'article', 'section', 'aside'];
  let allIssues = [];
  let sectionsChecked = 0;

  sectioningElements.forEach(tag => {
    $(tag).each((sectionIdx, section) => {
      const headings = $(section).find('h1, h2, h3, h4, h5, h6').get();
      if (headings.length === 0) return;

      sectionsChecked++;
      let sectionIssues = [];

      // Group headings by their direct parent to detect skips within content blocks
      const headingsByParent = {};
      headings.forEach(h => {
        const parentKey = h.parentNode.tagName + (h.parentNode.className ? '.' + h.parentNode.className : '');
        if (!headingsByParent[parentKey]) headingsByParent[parentKey] = [];
        headingsByParent[parentKey].push(h);
      });

      // Check each parent group for sequential issues
      Object.entries(headingsByParent).forEach(([parentKey, parentHeadings]) => {
        if (parentHeadings.length < 2) return;

        let prevLevel = parseInt(parentHeadings[0].name[1]);
        for (let i = 1; i < parentHeadings.length; i++) {
          const level = parseInt(parentHeadings[i].name[1]);
          if (level > prevLevel + 1) {
            sectionIssues.push(`Skipped from H${prevLevel} to H${level} in same block`);
          }
          prevLevel = level;
        }
      });

      // Also check: first heading in <main> should be H1 or H2
      const firstHeading = headings[0];
      const firstLevel = parseInt(firstHeading.name[1]);
      if (tag === 'main' && firstLevel > 2) {
        sectionIssues.push(`First heading in <main> is H${firstLevel}, should be H1 or H2`);
      }

      if (sectionIssues.length > 0) {
        const sectionName = tag === 'main' ? '<main>' : `<${tag}> #${sectionIdx + 1}`;
        allIssues.push(`${sectionName}: ${sectionIssues.join('; ')}`);
      }
    });
  });

  // Fallback for old HTML without sectioning elements
  if (sectionsChecked === 0) {
    const headings = $('body').find('h1, h2, h3, h4, h5, h6').get();
    if (headings.length > 0) {
      let issues = [];
      let prevLevel = parseInt(headings[0].name[1]);

      if (prevLevel !== 1) {
        issues.push(`First heading is H${prevLevel}, should be H1`);
      }

      for (let i = 1; i < headings.length; i++) {
        const level = parseInt(headings[i].name[1]);
        if (level > prevLevel + 1) {
          issues.push(`Skipped from H${prevLevel} to H${level}`);
        }
        prevLevel = level;
      }

      if (issues.length > 0) {
        allIssues.push(`page: ${issues.join('; ')}`);
      }
    }
  }

  if (allIssues.length > 0) {
    return warn(`Heading hierarchy issues: ${allIssues.join(' | ')}`, 'Maintain proper heading hierarchy within each content block');
  }
  return pass('Heading hierarchy looks good');
};

module.exports = {
  checkH1,
  checkH2s,
  checkH3s,
  checkHierarchy
};