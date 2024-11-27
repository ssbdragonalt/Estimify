import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface HeartButtonProps {
  questionId: string;
}

export const HeartButton = ({ questionId }: HeartButtonProps) => {
  const [likes, setLikes] = useState(0);
  const { toast } = useToast();

  const handleLike = async () => {
    setLikes(prev => prev + 1);
    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
    } catch (error) {
      toast({
        title: "Error saving like",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 hover:bg-pink-100 hover:text-pink-500 transition-colors"
      onClick={handleLike}
    >
      <Heart className="w-4 h-4" />
      <span>{likes}</span>
    </Button>
  );
};