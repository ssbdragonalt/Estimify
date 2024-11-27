import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  totalQuestions: number;
  feedback: string;
}

export const FeedbackDialog = ({
  open,
  onOpenChange,
  score,
  totalQuestions,
  feedback,
}: FeedbackDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dash Complete!</DialogTitle>
          <DialogDescription className="space-y-4">
            <p>Final Score: {(score / totalQuestions).toFixed(2)}</p>
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
  );
};