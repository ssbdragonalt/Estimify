export const validateQuestion = async (parsed: any, previousQuestions: any[]) => {
  if (!parsed.question || !parsed.answer || !parsed.context) {
    throw new Error("Missing required fields");
  }
  
  if (typeof parsed.answer !== 'number' || isNaN(parsed.answer)) {
    throw new Error("Answer must be a number");
  }
  
  if (typeof parsed.question !== 'string' || parsed.question.trim() === '') {
    throw new Error("Question must be a non-empty string");
  }

  const similarQuestion = previousQuestions.find(q => 
    calculateSimilarity(q.question.toLowerCase(), parsed.question.toLowerCase()) > 0.8
  );

  if (similarQuestion) {
    throw new Error("Similar question already exists");
  }
  
  return true;
};

// Levenshtein distance for string similarity
const calculateSimilarity = (s1: string, s2: string) => {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longerLength - distance) / longerLength;
};

const levenshteinDistance = (s1: string, s2: string) => {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};