export const submitScore = async (userId: string, username: string, score: number) => {
  try {
    const response = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userId}`
      },
      body: JSON.stringify({
        userId,
        username,
        score,
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit score');
    }
  } catch (error) {
    console.error("Error submitting score:", error);
    throw error;
  }
};

export const getTopScores = async () => {
  try {
    const response = await fetch("/api/leaderboard/top");
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};