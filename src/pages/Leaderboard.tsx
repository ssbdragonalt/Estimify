import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
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
  accuracy: number;
  visible: boolean;
}

const Leaderboard = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  const toggleVisibility = async () => {
    if (!user) return;

    try {
      await fetch("/api/leaderboard/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          visible: !isVisible,
        }),
      });
      setIsVisible(!isVisible);
      fetchLeaderboard();
    } catch (error) {
      console.error("Failed to update visibility:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg glass p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Global Leaderboard</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show on leaderboard</span>
            <Switch
              checked={isVisible}
              onCheckedChange={toggleVisibility}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard
              .filter((entry) => entry.visible)
              .map((entry, index) => (
                <TableRow key={entry.userId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell className="text-right">
                    {(entry.accuracy * 100).toFixed(1)}%
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