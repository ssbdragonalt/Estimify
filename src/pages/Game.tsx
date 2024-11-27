import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { generateQuestion } from "@/services/questionsService";

interface Question {
  question: string;
  answer: number;
  context: string;
}

const Game = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guess, setGuess] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    try {
      const question = await generateQuestion();
      setCurrentQuestion(question);
    } catch (error) {
      toast({
        title: "Error loading question",
        description: "Please try again later",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const calculateLogError = (guess: number, actual: number) => {
    return Math.abs(Math.log10(guess) - Math.log10(actual));
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    const numericGuess = parseFloat(guess);
    if (isNaN(numericGuess)) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    const logError = calculateLogError(numericGuess, currentQuestion.answer);
    const questionScore = Math.max(0, 1 - logError);
    setScore((prev) => prev + questionScore);
    setQuestionsAnswered((prev) => prev + 1);
    setShowResult(true);

    // Update leaderboard if user is signed in
    if (user) {
      const accuracy = (score + questionScore) / (questionsAnswered + 1);
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          accuracy,
        }),
      });
    }
  };

  const nextQuestion = () => {
    setGuess("");
    setShowResult(false);
    fetchNextQuestion();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg glass p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Questions Answered: {questionsAnswered} | Average Score: {questionsAnswered > 0 ? (score / questionsAnswered).toFixed(2) : "0.00"}
          </p>
          <h2 className="text-2xl font-bold">{currentQuestion?.question}</h2>
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
                <p className="text-lg">Actual answer: {currentQuestion?.answer}</p>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion?.context}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your guess was off by {calculateLogError(parseFloat(guess), currentQuestion?.answer || 0).toFixed(2)} orders of magnitude
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