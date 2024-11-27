import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const questions = [
  { id: 1, question: "How many countries are there in the world?", answer: 195 },
  { id: 2, question: "What is the average lifespan of an elephant in years?", answer: 70 },
  // Add more questions here
];

const Game = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [guess, setGuess] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();

  const calculateLogError = (guess: number, actual: number) => {
    return Math.abs(Math.log10(guess) - Math.log10(actual));
  };

  const handleSubmit = () => {
    const numericGuess = parseFloat(guess);
    if (isNaN(numericGuess)) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    const logError = calculateLogError(numericGuess, questions[currentQuestion].answer);
    setScore((prev) => prev + (1 - logError));
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setGuess("");
      setShowResult(false);
    } else {
      // Game over
      toast({
        title: "Game Over!",
        description: `Final score: ${score.toFixed(2)}`,
      });
      navigate("/leaderboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg glass p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Question {currentQuestion + 1}/{questions.length}</p>
          <h2 className="text-2xl font-bold">{questions[currentQuestion].question}</h2>
        </div>

        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Enter your estimate"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={showResult}
            className="text-lg"
          />

          {!showResult ? (
            <Button onClick={handleSubmit} className="w-full hover-scale">
              Submit Guess
            </Button>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center space-y-2">
                <p className="text-lg">Actual answer: {questions[currentQuestion].answer}</p>
                <p className="text-sm text-muted-foreground">
                  Your guess was off by {calculateLogError(parseFloat(guess), questions[currentQuestion].answer).toFixed(2)} orders of magnitude
                </p>
              </div>
              <Button onClick={nextQuestion} className="w-full hover-scale">
                Next Question
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Button
        variant="outline"
        className="mt-4 hover-scale"
        onClick={() => navigate("/")}
      >
        Exit Game
      </Button>
    </div>
  );
};

export default Game;