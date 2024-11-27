import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

export const generateQuestionWithAI = async (prompt: string) => {
  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    temperature: 0.7,
    system: "You are a Fermi estimation expert. Generate unique, well-researched questions with accurate answers and clear explanations.",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return message.content[0].text;
};

export const generateFeedback = async (questions: any[], guesses: number[]) => {
  const questionsAndGuesses = questions.map((q, i) => ({
    question: q.question,
    actual: q.answer,
    guess: guesses[i],
    logError: Math.abs(Math.log10(guesses[i]) - Math.log10(q.answer))
  }));

  const message = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    temperature: 0.7,
    system: "You are providing feedback on Fermi estimation performance.",
    messages: [
      {
        role: "user",
        content: `Analyze these Fermi estimation attempts and provide constructive feedback:
        ${JSON.stringify(questionsAndGuesses)}
        
        Focus on:
        1. Overall accuracy and patterns in estimation
        2. Which questions were estimated well vs poorly
        3. Specific strategies for breaking down similar problems
        4. Common estimation principles that could improve accuracy
        5. Practical tips for future estimations
        
        Keep the feedback encouraging and actionable.`
      }
    ]
  });

  return message.content[0].text;
};