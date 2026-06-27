const { SCORE_WEIGHTS } = require('../config');

const calculateCategoryScore = (checks) => {
  let total = 0;
  let count = 0;
  
  Object.values(checks).forEach(check => {
    if (typeof check === 'object' && check.status) {
      count++;
      if (check.status === 'pass') total += 1;
      else if (check.status === 'warning') total += 0.7; // Less harsh on warnings
      // fail = 0
    } else if (check.status === 'info') {
      count++;
      total += 0.8; // Info items are mostly positive
    }
  });
  
  return count > 0 ? Math.round((total / count) * 100) : 70;
};

const calculateOverallScore = (results, pagespeedSeo, structuredData) => {
  const sdScore = structuredData?.found ? 90 : 40;

  const scores = {
    meta: calculateCategoryScore(results.meta),
    headings: calculateCategoryScore(results.headings),
    images: calculateCategoryScore(results.images),
    structuredData: sdScore,
    technical: calculateCategoryScore(results.technical),
    pagespeed: pagespeedSeo || 75
  };

  let overall = 0;
  Object.keys(SCORE_WEIGHTS).forEach(cat => {
    overall += (scores[cat] / 100) * SCORE_WEIGHTS[cat];
  });

  const score = Math.round(overall);
  
  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 65) grade = 'C';
  else if (score >= 50) grade = 'D';

  return {
    score,
    grade,
    breakdown: scores
  };
};

module.exports = { calculateOverallScore };