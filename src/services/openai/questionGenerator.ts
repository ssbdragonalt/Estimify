import { openai, FERMI_PROMPT } from './config';

export const generateSingleQuestion = async (previousQuestions: any[], category?: string) => {
  const categoryPrompt = category ? `Focus on questions from the ${category} category.` : '';
  const prompt = `${FERMI_PROMPT}\n${categoryPrompt}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a Fermi estimation expert that generates questions in JSON format."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;
  if (!response) throw new Error("No response from OpenAI");
  
  const parsed = JSON.parse(response);
  validateQuestion(parsed, previousQuestions);
  return parsed;
};

const validateQuestion = (parsed: any, previousQuestions: any[]) => {
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
    q.question.toLowerCase().includes(parsed.question.toLowerCase()) ||
    parsed.question.toLowerCase().includes(q.question.toLowerCase())
  );

  if (similarQuestion) {
    throw new Error("Similar question already exists");
  }
  
  return true;
};