const normalizeUrl = (url) => {
  if (!url) return '';
  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  normalized = normalized.replace(/\/$/, '');
  if (!normalized.includes('/', 8)) {
    normalized = normalized + '/';
  }
  return normalized;
};

const getDomain = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return '';
  }
};

const isInternal = (link, baseUrl) => {
  try {
    let processedLink = link;
    if (link.startsWith('//')) {
      processedLink = 'https:' + link;
    }
    const baseDomain = new URL(baseUrl).hostname.replace('www.', '');
    const linkDomain = new URL(processedLink, baseUrl).hostname.replace('www.', '');
    return baseDomain === linkDomain;
  } catch {
    return !link.startsWith('http') && !link.startsWith('//');
  }
};

const isValidUrl = (url) => {
  try {
    new URL(normalizeUrl(url));
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  normalizeUrl,
  getDomain,
  isInternal,
  isValidUrl
};