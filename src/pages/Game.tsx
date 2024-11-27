import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { generateQuestion, generateFeedback } from "@/services/questionsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Question {
  question: string;
  answer: number;
  context: string;
}

const TOTAL_QUESTIONS = 10;

const Game = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const questionPromises = Array(TOTAL_QUESTIONS)
        .fill(null)
        .map(() => generateQuestion());
      const loadedQuestions = await Promise.all(questionPromises);
      setQuestions(loadedQuestions);
    } catch (error) {
      toast({
        title: "Error loading questions",
        description: "Please try again later",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const calculateLogError = (guess: number, actual: number) => {
    return Math.abs(Math.log10(guess) - Math.log10(actual));
  };

  const handleSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
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
    setGuesses([...guesses, numericGuess]);
    setShowResult(true);
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex === TOTAL_QUESTIONS - 1) {
      // Generate feedback at the end of the dash
      const feedbackText = await generateFeedback(questions, [...guesses, parseFloat(guess)]);
      setFeedback(feedbackText);
      setShowFeedback(true);

      // Update leaderboard if user is signed in
      if (user) {
        const accuracy = score / TOTAL_QUESTIONS;
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
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setGuess("");
      setShowResult(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading questions...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg glass p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}
            </p>
            <p className="text-sm text-muted-foreground">
              Score: {(score / (currentQuestionIndex + 1)).toFixed(2)}
            </p>
          </div>
          <Progress
            value={(currentQuestionIndex / TOTAL_QUESTIONS) * 100}
            className="mb-4"
          />
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
                  Your guess was off by{" "}
                  {calculateLogError(
                    parseFloat(guess),
                    currentQuestion?.answer || 0
                  ).toFixed(2)}{" "}
                  orders of magnitude
                </p>
              </div>
              <Button onClick={nextQuestion} className="w-full hover-scale">
                {currentQuestionIndex === TOTAL_QUESTIONS - 1
                  ? "Finish Dash"
                  : "Next Question"}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dash Complete!</DialogTitle>
            <DialogDescription className="space-y-4">
              <p>Final Score: {(score / TOTAL_QUESTIONS).toFixed(2)}</p>
              <div className="mt-4 text-sm whitespace-pre-line">{feedback}</div>
              <div className="flex justify-end space-x-4 mt-4">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Home
                </Button>
                <Button onClick={() => navigate("/leaderboard")}>
                  View Leaderboard
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        className="mt-4 hover-scale"
        onClick={() => navigate("/")}
      >
        Exit Dash
      </Button>
    </div>
  );
};

export default Game;