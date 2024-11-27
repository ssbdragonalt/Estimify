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
4. Includes interesting context about the answer
`;

const QUESTION_PROMPT = `${FERMI_CONTEXT}
Format the response as a JSON object with properties:
- question: the estimation question
- answer: the numerical answer
- context: explanation of how to break down the problem and interesting facts about the answer
Example: {"question": "How many heartbeats does an average person have in their lifetime?", "answer": 2628000000, "context": "This can be estimated by breaking down: 70 years × 365 days × 24 hours × 60 minutes × 75 beats per minute. The actual number varies based on age, fitness level, and lifestyle."}`;

const initializeModel = () => {
  if (!model) {
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }
  return model;
};

export const generateQuestion = async () => {
  const model = initializeModel();
  const result = await model.generateContent(QUESTION_PROMPT);
  const response = result.response.text();
  return JSON.parse(response);
};

export const generateFeedback = async (questions: any[], guesses: number[]) => {
  const model = initializeModel();
  
  const questionsAndGuesses = questions.map((q, i) => ({
    question: q.question,
    actual: q.answer,
    guess: guesses[i]
  }));

  const feedbackPrompt = `
    Analyze these Fermi estimation attempts:
    ${JSON.stringify(questionsAndGuesses)}

    Provide constructive feedback on:
    1. Overall estimation accuracy
    2. Any systematic bias (consistently over/underestimating)
    3. Specific tips for improvement
    4. Areas where the estimations were particularly good

    Keep the response concise and encouraging.
  `;

  const result = await model.generateContent(feedbackPrompt);
  return result.response.text();
};