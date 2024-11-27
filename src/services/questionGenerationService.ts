import { generateQuestionWithAI } from './aiService';
import { getUserQuestions, saveUserQuestion } from './userQuestionsService';
import { validateQuestion } from './questionValidationService';

export const generateQuestion = async (userId: string, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const categories = [
    'human biology', 'daily activities', 'global phenomena',
    'technology', 'nature', 'space', 'time', 'transportation'
  ];
  
  try {
    const userQuestions = await getUserQuestions(userId);
    const currentQuestionCount = userQuestions.length;
    const category = categories[currentQuestionCount % categories.length];

    const prompt = `Generate a unique Fermi estimation question for the category: ${category}. 
                   Previous questions: ${JSON.stringify(userQuestions.map(q => q.question))}`;

    const response = await generateQuestionWithAI(prompt);
    const question = JSON.parse(response);
    
    await validateQuestion(question, userQuestions);
    await saveUserQuestion(userId, question);
    
    return question;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      return generateQuestion(userId, retryCount + 1);
    }
    throw error;
  }
};