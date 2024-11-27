import { generateSingleQuestion } from './openai/questionGenerator';
import { generateFeedback as generateAIFeedback } from './openai/feedbackGenerator';

const getUserQuestions = async (userId: string) => {
  try {
    const response = await fetch(`/api/user-questions/${userId}`);
    if (!response.ok) {
      console.warn("Failed to fetch user questions, continuing with empty list");
      return [];
    }
    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.warn("Error fetching user questions, continuing with empty list:", error);
    return [];
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateQuestion = async (userId: string, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
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
      
      // Don't try to save the question if we're having API issues
      try {
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
      } catch (error) {
        console.warn("Failed to save question, continuing anyway:", error);
      }
      
      return question;
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Rate limit hit, waiting ${RETRY_DELAY}ms before retry ${retryCount + 1}/${MAX_RETRIES}...`);
          await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
          return generateQuestion(userId, retryCount + 1);
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
};

export const generateFeedback = generateAIFeedback;