import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HeartButton } from "./HeartButton";

interface QuestionCardProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  question: string;
  guess: string;
  showResult: boolean;
  actualAnswer?: number;
  context?: string;
  logError?: number;
  questionId?: string;
  onGuessChange: (value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export const QuestionCard = ({
  currentQuestionIndex,
  totalQuestions,
  score,
  question,
  guess,
  showResult,
  actualAnswer,
  context,
  logError,
  questionId,
  onGuessChange,
  onSubmit,
  onNext,
}: QuestionCardProps) => {
  return (
    <Card className="w-full max-w-lg glass p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Score: {(score / (currentQuestionIndex + 1)).toFixed(2)}
            </p>
            {questionId && <HeartButton questionId={questionId} />}
          </div>
        </div>
        <Progress
          value={(currentQuestionIndex / totalQuestions) * 100}
          className="mb-4"
        />
        <h2 className="text-2xl font-bold">{question}</h2>
      </div>

      <div className="space-y-4">
        <Input
          type="number"
          placeholder="Enter your estimate"
          value={guess}
          onChange={(e) => onGuessChange(e.target.value)}
          disabled={showResult}
          className="text-lg"
        />

        {!showResult ? (
          <Button onClick={onSubmit} className="w-full hover-scale">
            Submit Guess
          </Button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <p className="text-lg">Actual answer: {actualAnswer}</p>
              <p className="text-sm text-muted-foreground">{context}</p>
              {logError !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Your guess was off by {logError.toFixed(2)} orders of magnitude
                </p>
              )}
            </div>
            <Button onClick={onNext} className="w-full hover-scale">
              {currentQuestionIndex === totalQuestions - 1
                ? "Finish Dash"
                : "Next Question"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};