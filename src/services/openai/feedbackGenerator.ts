import { openai } from './config';

export const generateFeedback = async (questions: any[], guesses: number[]) => {
  const questionsAndGuesses = questions.map((q, i) => ({
    question: q.question,
    actual: q.answer,
    guess: guesses[i],
    logError: Math.abs(Math.log10(guesses[i]) - Math.log10(q.answer))
  }));

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI that provides constructive feedback on Fermi estimation attempts."
      },
      {
        role: "user",
        content: `
          Analyze these Fermi estimation attempts and provide constructive feedback:
          ${JSON.stringify(questionsAndGuesses)}

          Focus on:
          1. Overall accuracy and patterns in estimation
          2. Which questions were estimated well vs poorly
          3. Specific strategies for breaking down similar problems
          4. Common estimation principles that could improve accuracy
          5. Practical tips for future estimations

          Keep the feedback encouraging and actionable.
        `
      }
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content || "Unable to generate feedback";
};