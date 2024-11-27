import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const FERMI_PROMPT = `
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

The context should read like a helpful friend explaining their thought process, not just listing calculations.`;