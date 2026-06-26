const { SCORE_WEIGHTS } = require('../config');

const calculateCategoryScore = (checks) => {
  let total = 0;
  let count = 0;
  
  Object.values(checks).forEach(check => {
    if (typeof check === 'object' && check.status) {
      count++;
      if (check.status === 'pass') total += 1;
      else if (check.status === 'warning') total += 0.5;
      // fail = 0
    }
  });
  
  return count > 0 ? Math.round((total / count) * 100) : 0;
};

const calculateOverallScore = (results, pagespeedSeo) => {
  const scores = {
    meta: calculateCategoryScore(results.meta),
    headings: calculateCategoryScore(results.headings),
    images: calculateCategoryScore(results.images),
    structuredData: 0, // to be added
    technical: calculateCategoryScore(results.technical),
    pagespeed: pagespeedSeo || 0
  };

  let overall = 0;
  Object.keys(SCORE_WEIGHTS).forEach(cat => {
    overall += (scores[cat] / 100) * SCORE_WEIGHTS[cat];
  });

  const score = Math.round(overall);
  
  let grade = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 40) grade = 'D';

  return {
    score,
    grade,
    breakdown: scores
  };
};

module.exports = { calculateOverallScore };