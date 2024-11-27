import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const QUESTION_PROMPT = `Generate an estimation question with a numerical answer. The question should be interesting and educational.
Format the response as a JSON object with properties:
- question: the question text
- answer: the numerical answer
- context: brief explanation of the answer
Example: {"question": "How many bones are there in the adult human body?", "answer": 206, "context": "The adult human skeleton is made up of 206 bones, which provide structure, protection, and support for the body's tissues."}`;

export const generateQuestion = async () => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(QUESTION_PROMPT);
  const response = result.response.text();
  return JSON.parse(response);
};