import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
let model: any = null;

const FERMI_CONTEXT = `
You are a Fermi estimation expert. Generate a unique Fermi estimation question following this EXACT format:

{
  "question": "How many heartbeats does an average person have in their lifetime?",
  "answer": 2628000000,
  "context": "Think about it intuitively: A resting heart beats about once per second, so that's 60 beats per minute. In an hour, that's 60 × 60 = 3,600 beats. For a full day: 3,600 × 24 = 86,400 beats. Over a year: 86,400 × 365 = 31,536,000 beats. For a typical 83-year lifespan: 31,536,000 × 83 = 2,628,000,000 beats."
}

Requirements:
1. The answer MUST be based on verified statistical data or scientific facts
2. The context should guide users through intuitive steps that would help them arrive at the answer
3. Break down complex calculations into relatable, everyday concepts
4. Use common reference points that people can easily understand
5. NO additional text or formatting - return ONLY the JSON object
6. NO markdown formatting in the response
7. NEVER repeat questions from this list of previously asked questions: [PREVIOUS_QUESTIONS]

The context should read like a helpful friend explaining their thought process, not just listing calculations.

Categories to draw from:
1. Human biology (heartbeats, breaths, blinks)
2. Daily activities (steps walked, words spoken)
3. Global phenomena (raindrops falling, lightning strikes)
4. Technology (emails sent, web searches)
5. Nature (trees on Earth, birds in flight)
6. Space (distance to moon in football fields)
7. Time (seconds in a lifetime)
8. Transportation (total flight distance of all planes)

Use verified sources and consistent data across questions.
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

const cleanJsonResponse = (response: string): string => {
  let cleaned = response.replace(/```json\n|\n```|```/g, '');
  cleaned = cleaned.trim();
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace > 0) {
    cleaned = cleaned.slice(firstBrace);
  }
  const lastBrace = cleaned.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }
  return cleaned;
};

let askedQuestions: string[] = [];

export const generateQuestion = async () => {
  try {
    const model = initializeModel();
    const promptWithPrevious = FERMI_CONTEXT.replace(
      '[PREVIOUS_QUESTIONS]',
      JSON.stringify(askedQuestions)
    );

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptWithPrevious }]}],
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1024,
      },
    });
    
    const response = result.response.text();
    const cleanedResponse = cleanJsonResponse(response);
    
    try {
      const parsed = JSON.parse(cleanedResponse);
      
      if (!parsed.question || !parsed.answer || !parsed.context) {
        throw new Error("Invalid response structure");
      }
      
      if (typeof parsed.answer !== 'number') {
        throw new Error("Answer must be a number");
      }

      if (askedQuestions.includes(parsed.question)) {
        throw new Error("Duplicate question generated");
      }

      askedQuestions.push(parsed.question);
      
      // Keep only the last 100 questions to prevent memory issues
      if (askedQuestions.length > 100) {
        askedQuestions = askedQuestions.slice(-100);
      }
      
      return parsed;
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
