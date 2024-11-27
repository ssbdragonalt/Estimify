import { generateSingleQuestion } from './openai/questionGenerator';
import { generateFeedback as generateAIFeedback } from './openai/feedbackGenerator';

const getUserQuestions = async (userId: string) => {
  try {
    const response = await fetch(`/api/user-questions/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return [];
  }
};

export const generateQuestion = async (userId: string, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const categories = [
    'human biology',
    'daily activities',
    'global phenomena',
    'technology',
    'nature',
    'space',
    'time',
    'transportation'
  ];
  
  try {
    const userQuestions = await getUserQuestions(userId);
    const currentQuestionCount = userQuestions.length;
    const category = categories[currentQuestionCount % categories.length];

    try {
      const question = await generateSingleQuestion(userQuestions, category);

      await fetch("/api/user-questions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        },
        body: JSON.stringify({
          userId,
          question: question.question
        }),
      });
      
      return question;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Error generating question, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        return generateQuestion(userId, retryCount + 1);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
};

export const generateFeedback = generateAIFeedback;