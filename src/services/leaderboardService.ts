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
    // Updated to fetch all-time top scores
    const response = await fetch("/api/leaderboard/top?limit=10");
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    const data = await response.json();
    
    // Sort by score in descending order and take top 10
    return data.sort((a: any, b: any) => b.score - a.score).slice(0, 10);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};