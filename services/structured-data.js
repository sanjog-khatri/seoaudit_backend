const structuredData = ($) => {
  const schemas = [];
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const content = $(el).html();
      const json = JSON.parse(content);
      if (json['@type']) {
        schemas.push(json['@type']);
      } else if (Array.isArray(json['@graph'])) {
        json['@graph'].forEach(item => {
          if (item['@type']) schemas.push(item['@type']);
        });
      }
    } catch (e) {
      // Skip invalid JSON-LD
    }
  });

  return {
    found: schemas.length > 0,
    schemas: [...new Set(schemas)],
    count: schemas.length
  };
};

module.exports = { structuredData };