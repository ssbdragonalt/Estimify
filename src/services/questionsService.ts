import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
let model: any = null;

const FERMI_CONTEXT = `
You are an expert at creating Fermi estimation problems. These are questions that require breaking down large estimation problems into smaller, more manageable parts.

Some examples of good Fermi problems:
1. "How many piano tuners are there in Chicago?" (Consider population, piano ownership rate, tuning frequency)
2. "How many breaths does a person take in their lifetime?" (Consider lifespan, breathing rate variations)
3. "How many trees are needed to print all Harry Potter books ever sold?" (Consider book length, paper per tree, sales figures)

Generate an estimation question that:
1. Has a specific numerical answer
2. Requires breaking down into smaller parts
3. Tests intuition about real-world quantities
4. Includes interesting context about the answer and how to break down the problem
5. Provides a step-by-step estimation process
`;

const QUESTION_PROMPT = `${FERMI_CONTEXT}
Format the response as a JSON object with properties:
- question: the estimation question
- answer: the numerical answer
- context: explanation of how to break down the problem and interesting facts about the answer
Example: {"question": "How many heartbeats does an average person have in their lifetime?", "answer": 2628000000, "context": "This can be estimated by breaking down: 70 years × 365 days × 24 hours × 60 minutes × 75 beats per minute. The actual number varies based on age, fitness level, and lifestyle."}`;

const initializeModel = () => {
  if (!model) {
    try {
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (error) {
      console.error("Failed to initialize Gemini model:", error);
      throw new Error("Failed to initialize AI model");
    }
  }
  return model;
};

export const generateQuestion = async () => {
  try {
    const model = initializeModel();
    const result = await model.generateContent(QUESTION_PROMPT);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error("Error generating question:", error);
    throw new Error("Failed to generate question");
  }
};

export const generateFeedback = async (questions: any[], guesses: number[]) => {
  try {
    const model = initializeModel();
    
    const questionsAndGuesses = questions.map((q, i) => ({
      question: q.question,
      actual: q.answer,
      guess: guesses[i]
    }));

    const feedbackPrompt = `
      Analyze these Fermi estimation attempts:
      ${JSON.stringify(questionsAndGuesses)}

      Provide constructive feedback in the following format:
      1. Overall Performance: How well did they do across all questions?
      2. Patterns: Were they consistently over or underestimating?
      3. Best Estimates: Which questions were estimated most accurately?
      4. Areas for Improvement: Specific tips for better estimation
      5. General Strategy: Suggest a systematic approach for breaking down similar estimation problems

      Keep the response encouraging and focused on improvement strategies.
    `;

    const result = await model.generateContent(feedbackPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating feedback:", error);
    throw new Error("Failed to generate feedback");
  }
};