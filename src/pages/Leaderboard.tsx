import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { getTopScores } from "@/services/leaderboardService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  timestamp: string;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await getTopScores();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg glass p-6 space-y-6">
        <h2 className="text-2xl font-bold">Top Scores</h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow key={`${entry.userId}-${entry.timestamp}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{entry.username}</TableCell>
                <TableCell className="text-right">
                  {(entry.score * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="hover-scale"
        >
          Back to Home
        </Button>
        <Button
          onClick={() => navigate("/game")}
          className="hover-scale"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default Leaderboard;