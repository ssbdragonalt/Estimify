import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

// Mock data - replace with actual API calls
const mockLeaderboard = [
  { id: 1, name: "Alice", score: 95.2, visible: true },
  { id: 2, name: "Bob", score: 87.5, visible: true },
  // Add more entries
];

const Leaderboard = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg glass p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Global Leaderboard</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show on leaderboard</span>
            <Switch
              checked={isVisible}
              onCheckedChange={setIsVisible}
            />
          </div>
        </div>

        <div className="space-y-4">
          {mockLeaderboard.map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between items-center p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
            >
              <span className="font-medium">{entry.name}</span>
              <span className="text-muted-foreground">{entry.score.toFixed(1)}</span>
            </div>
          ))}
        </div>
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