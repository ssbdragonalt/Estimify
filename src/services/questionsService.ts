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
1. The answer MUST be based on verified statistical data or scientific facts from reputable sources
2. The context should guide users through intuitive steps that would help them arrive at the answer
3. Break down complex calculations into relatable, everyday concepts
4. Use common reference points that people can easily understand
5. NO additional text or formatting - return ONLY the JSON object
6. NO markdown formatting in the response
7. NEVER repeat questions from this list of previously asked questions: [PREVIOUS_QUESTIONS]
8. All numerical answers must be exact and consistent across all instances
9. Include source citation in the context when possible

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
  // Remove any markdown code blocks
  let cleaned = response.replace(/```json\n|\n```|```/g, '');
  cleaned = cleaned.trim();
  
  // Find the first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Invalid JSON format: Missing braces");
  }
  
  // Extract just the JSON object
  cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  
  return cleaned;
};

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

const validateQuestion = (parsed: any) => {
  if (!parsed.question || !parsed.answer || !parsed.context) {
    throw new Error("Missing required fields");
  }
  
  if (typeof parsed.answer !== 'number' || isNaN(parsed.answer)) {
    throw new Error("Answer must be a number");
  }
  
  if (typeof parsed.question !== 'string' || parsed.question.trim() === '') {
    throw new Error("Question must be a non-empty string");
  }
  
  return true;
};

export const generateQuestion = async (userId: string, retryCount = 0) => {
  const MAX_RETRIES = 3;
  
  try {
    const model = initializeModel();
    const userQuestions = await getUserQuestions(userId);
    
    const promptWithPrevious = FERMI_CONTEXT.replace(
      '[PREVIOUS_QUESTIONS]',
      JSON.stringify(userQuestions)
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
      validateQuestion(parsed);
      
      if (userQuestions.includes(parsed.question)) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Duplicate question detected, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
          return generateQuestion(userId, retryCount + 1);
        }
        throw new Error("Max retries reached for duplicate questions");
      }

      // Save the question to user's history
      await fetch("/api/user-questions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userId}`
        },
        body: JSON.stringify({
          userId,
          question: parsed.question
        }),
      });
      
      return parsed;
    } catch (parseError) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Invalid response format, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        return generateQuestion(userId, retryCount + 1);
      }
      throw new Error("Invalid response format after max retries");
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
