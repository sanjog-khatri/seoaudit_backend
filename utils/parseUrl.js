const normalizeUrl = (url) => {
  if (!url) return '';
  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
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
    const baseDomain = new URL(baseUrl).hostname;
    const linkDomain = new URL(link, baseUrl).hostname;
    return baseDomain === linkDomain;
  } catch {
    return false;
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