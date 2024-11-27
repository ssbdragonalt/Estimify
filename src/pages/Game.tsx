import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { generateQuestion, generateFeedback } from "@/services/questionsService";
import { QuestionCard } from "@/components/game/QuestionCard";
import { FeedbackDialog } from "@/components/game/FeedbackDialog";
import { Button } from "@/components/ui/button";

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
      try {
        const feedbackText = await generateFeedback(questions, [...guesses, parseFloat(guess)]);
        setFeedback(feedbackText);
        setShowFeedback(true);

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
      } catch (error) {
        toast({
          title: "Error generating feedback",
          description: "Please try again later",
          variant: "destructive",
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
      <QuestionCard
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={TOTAL_QUESTIONS}
        score={score}
        question={currentQuestion?.question || ""}
        guess={guess}
        showResult={showResult}
        actualAnswer={showResult ? currentQuestion?.answer : undefined}
        context={showResult ? currentQuestion?.context : undefined}
        logError={
          showResult
            ? calculateLogError(parseFloat(guess), currentQuestion?.answer || 0)
            : undefined
        }
        onGuessChange={setGuess}
        onSubmit={handleSubmit}
        onNext={nextQuestion}
      />

      <FeedbackDialog
        open={showFeedback}
        onOpenChange={setShowFeedback}
        score={score}
        totalQuestions={TOTAL_QUESTIONS}
        feedback={feedback}
      />

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