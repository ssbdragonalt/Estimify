import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";

interface HeartButtonProps {
  questionId: string;
}

export const HeartButton = ({ questionId }: HeartButtonProps) => {
  const [likes, setLikes] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await fetch(`/api/likes/${questionId}`);
        const data = await response.json();
        setLikes(data.likes);
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };
    fetchLikes();
  }, [questionId]);

  const handleLike = async () => {
    setLikes(prev => prev + 1);
    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.id}`
        },
        body: JSON.stringify({ 
          questionId,
          userId: user?.id 
        }),
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