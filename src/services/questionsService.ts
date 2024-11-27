import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
let model: any = null;

const FERMI_CONTEXT = `
You are an expert at creating Fermi estimation problems. Generate questions that:
1. Have specific numerical answers that can be estimated through logical steps
2. Test understanding of real-world quantities and relationships
3. Can be broken down into smaller, more manageable parts
4. Are engaging and relate to everyday experiences or interesting phenomena

Example format:
{
  "question": "How many heartbeats does an average person have in their lifetime?",
  "answer": 2628000000,
  "context": "Breaking this down: Average lifespan (70 years) × 365 days/year × 24 hours/day × 60 minutes/hour × 75 beats/minute. The actual number varies based on age and fitness level."
}

Important:
- Return ONLY valid JSON
- Include step-by-step estimation process in context
- Ensure numerical answer is realistic
- No markdown formatting in response
`;

const initializeModel = () => {
  if (!model) {
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    } catch (error) {
      console.error("Failed to initialize Gemini model:", error);
      throw new Error("Failed to initialize AI model");
    }
  }
  return model;
};

// Add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateQuestion = async () => {
  try {
    const model = initializeModel();
    const result = await model.generateContent(FERMI_CONTEXT);
    const response = result.response.text();
    
    // Clean the response to ensure valid JSON
    const cleanedResponse = response.replace(/```json\n|\n```/g, '').trim();
    
    try {
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
};

export const generateFeedback = async (questions: any[], guesses: number[]) => {
  try {
    const model = initializeModel();
    
    const questionsAndGuesses = questions.map((q, i) => ({
      question: q.question,
      actual: q.answer,
      guess: guesses[i],
      logError: Math.abs(Math.log10(guesses[i]) - Math.log10(q.answer))
    }));

    const feedbackPrompt = `
      Analyze these Fermi estimation attempts and provide constructive feedback:
      ${JSON.stringify(questionsAndGuesses)}

      Focus on:
      1. Overall accuracy and patterns in estimation
      2. Which questions were estimated well vs poorly
      3. Specific strategies for breaking down similar problems
      4. Common estimation principles that could improve accuracy
      5. Practical tips for future estimations

      Keep the feedback encouraging and actionable.
    `;

    const result = await model.generateContent(feedbackPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating feedback:", error);
    throw error;
  }
};