export const getUserQuestions = async (userId: string) => {
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

export const saveUserQuestion = async (userId: string, question: any) => {
  await fetch("/api/user-questions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userId}`
    },
    body: JSON.stringify({
      userId,
      question: question.question
    }),
  });
};