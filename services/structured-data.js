const structuredData = ($) => {
  const schemas = [];
  const invalidSchemas = [];
  const schemaDetails = [];

  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const content = $(el).html();
      if (!content || !content.trim()) {
        invalidSchemas.push({ index: i, error: 'Empty JSON-LD block' });
        return;
      }

      // Remove HTML comments and CDATA wrappers
      const cleanContent = content
        .replace(/^\s*<!--/, '')
        .replace(/-->\s*$/, '')
        .replace(/^\s*<!\[CDATA\[/, '')
        .replace(/\]\]>\s*$/, '')
        .trim();

      const json = JSON.parse(cleanContent);

      // Handle @graph arrays
      const processSchema = (item, source) => {
        if (item['@type']) {
          const type = Array.isArray(item['@type']) ? item['@type'][0] : item['@type'];
          schemas.push(type);

          // Basic validation for common schemas
          const validationIssues = [];
          if (type === 'Organization' && !item.name) validationIssues.push('missing name');
          if (type === 'Product' && !item.name) validationIssues.push('missing name');
          if (type === 'WebPage' && !item.url) validationIssues.push('missing url');
          if (type === 'BreadcrumbList' && (!item.itemListElement || item.itemListElement.length === 0)) {
            validationIssues.push('missing itemListElement');
          }

          schemaDetails.push({
            type,
            source,
            validationIssues: validationIssues.length > 0 ? validationIssues : null
          });

          if (validationIssues.length > 0) {
            invalidSchemas.push({ index: i, type, error: validationIssues.join(', ') });
          }
        } else {
          invalidSchemas.push({ index: i, error: 'Missing @type in JSON-LD' });
        }
      };

      if (Array.isArray(json['@graph'])) {
        json['@graph'].forEach((item, idx) => processSchema(item, `@graph[${idx}]`));
      } else {
        processSchema(json, 'root');
      }

    } catch (e) {
      invalidSchemas.push({ index: i, error: `Invalid JSON: ${e.message.substring(0, 100)}` });
    }
  });

  return {
    found: schemas.length > 0,
    schemas: [...new Set(schemas)],
    count: schemas.length,
    invalidCount: invalidSchemas.length,
    invalidSchemas: invalidSchemas.slice(0, 5),
    details: schemaDetails
  };
};

module.exports = { structuredData };