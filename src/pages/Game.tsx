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
const MIN_SCORE = 0;
const MAX_SCORE = 1;

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
    if (!user) {
      navigate("/");
      return;
    }
    loadQuestions();
  }, [user, navigate]);

  const loadQuestions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const questions = [];
      for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        try {
          const question = await generateQuestion(user.id);
          questions.push(question);
          // Add delay between requests to avoid rate limiting
          if (i < TOTAL_QUESTIONS - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error generating question ${i + 1}:`, error);
          toast({
            title: "Error loading question",
            description: "Retrying...",
            variant: "destructive",
          });
          i--; // Retry this question
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer before retry
        }
      }
      setQuestions(questions);
    } catch (error) {
      toast({
        title: "Error loading questions",
        description: "Please try again later",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const calculateScore = (logError: number) => {
    // Convert log error to a score between 0 and 1
    const score = Math.max(MIN_SCORE, Math.min(MAX_SCORE, 1 - logError));
    return score;
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

    const logError = Math.abs(Math.log10(numericGuess) - Math.log10(currentQuestion.answer));
    const questionScore = calculateScore(logError);
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
          const finalScore = score / TOTAL_QUESTIONS;
          await fetch("/api/leaderboard", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${user.id}`
            },
            body: JSON.stringify({
              userId: user.id,
              username: user.username || user.firstName || "Anonymous",
              score: finalScore,
              totalQuestions: TOTAL_QUESTIONS,
              timestamp: new Date().toISOString()
            }),
          });
        }
      } catch (error) {
        toast({
          title: "Error saving score",
          description: "Your score might not appear on the leaderboard",
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
            ? Math.abs(Math.log10(parseFloat(guess)) - Math.log10(currentQuestion?.answer || 0))
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