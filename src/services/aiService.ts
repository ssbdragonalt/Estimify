import { Claude } from '@anthropic-ai/sdk';

const claude = new Claude({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY
});

export const generateQuestionWithAI = async (prompt: string) => {
  const response = await claude.messages.create({
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

  return response.content[0].text;
};