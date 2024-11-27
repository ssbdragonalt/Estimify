import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `User feedback for Estimify game: "${feedback}". Please provide a concise, helpful response acknowledging their feedback and suggesting potential improvements or explaining current design decisions.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      toast({
        title: "Thank you for your feedback!",
        description: response,
      });

      setFeedback("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg glass p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Feedback</h2>
          <p className="text-muted-foreground">
            Share your thoughts about Estimify. Our AI will respond to your feedback!
          </p>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Type your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[150px]"
          />

          <Button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isLoading}
            className="w-full hover-scale"
          >
            {isLoading ? "Processing..." : "Submit Feedback"}
          </Button>
        </div>
      </Card>

      <Button
        variant="outline"
        className="mt-4 hover-scale"
        onClick={() => navigate("/")}
      >
        Back to Home
      </Button>
    </div>
  );
};

export default Feedback;