import { SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Estimify
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Test your intuition. Compete globally. Have fun estimating.
        </p>
      </div>

      <SignedIn>
        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full hover-scale"
            onClick={() => navigate("/game")}
          >
            Play Now
          </Button>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/leaderboard")}
              className="hover-scale"
            >
              Leaderboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/feedback")}
              className="hover-scale"
            >
              Feedback
            </Button>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="w-full max-w-sm glass rounded-lg p-6 animate-slide-up">
          <SignIn />
        </div>
      </SignedOut>
    </div>
  );
};

export default Index;