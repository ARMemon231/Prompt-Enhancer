import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type PromptEnhancement, type EnhancementStyle } from "@shared/schema";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface PromptInputProps {
  onAnalysisComplete: (enhancement: PromptEnhancement) => void;
  onAnalysisStart?: () => void;
  disabled?: boolean;
}

export function PromptInput({ onAnalysisComplete, onAnalysisStart, disabled = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<EnhancementStyle>("detailed");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async ({ originalPrompt, style }: { originalPrompt: string; style: EnhancementStyle }) => {
      const response = await apiRequest("POST", "/api/analyze", { originalPrompt, style });
      return response.json();
    },
    onSuccess: (data: PromptEnhancement) => {
      setPrompt(""); // Clear input after successful submission
      onAnalysisComplete(data);
      toast({
        title: "✨ Analysis Complete",
        description: "Your prompt has been analyzed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze prompt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to analyze.",
        variant: "destructive",
      });
      return;
    }
    onAnalysisStart?.();
    analyzeMutation.mutate({ originalPrompt: prompt.trim(), style });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [prompt]);

  return (
    <section className="mb-6 animate-slide-up">
      <Card className="glass-effect border-border/50 overflow-hidden bg-black/30">
        <div className="p-4">
          {/* Style Selector */}
          <div className="mb-3">
            <Select 
              value={style} 
              onValueChange={(value: EnhancementStyle) => setStyle(value)}
              disabled={disabled || analyzeMutation.isPending}
            >
              <SelectTrigger 
                data-testid="select-style"
                className="w-[200px] h-8 text-xs bg-secondary/50 border-border/50 text-white"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detailed">
                  <span className="text-xs">💎 Detailed</span>
                </SelectItem>
                <SelectItem value="creative">
                  <span className="text-xs">✨ Creative</span>
                </SelectItem>
                <SelectItem value="technical">
                  <span className="text-xs">⚙️ Technical</span>
                </SelectItem>
                <SelectItem value="conversational">
                  <span className="text-xs">💬 Conversational</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chat-style Input */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id="initial-prompt"
              data-testid="input-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your idea or prompt... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[60px] max-h-[300px] resize-none bg-black/40 border-border/50 pr-24 py-3 text-sm focus-visible:ring-primary/50 rounded-2xl text-white placeholder:text-gray-400 placeholder:opacity-60"
              disabled={disabled || analyzeMutation.isPending}
              rows={1}
            />
            
            {/* Send Button */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <div className="text-[10px] text-gray-400 hidden sm:block">
                {prompt.length > 0 && `${prompt.length} chars`}
              </div>
              <Button
                onClick={handleSubmit}
                data-testid="button-analyze"
                disabled={disabled || analyzeMutation.isPending || !prompt.trim()}
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-primary hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
              >
                {analyzeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-[10px] text-gray-400 mt-2 px-1">
            Press <kbd className="px-1.5 py-0.5 text-[9px] bg-gray-700 text-white rounded border border-gray-600">Enter</kbd> to send • 
            <kbd className="px-1.5 py-0.5 text-[9px] bg-gray-700 text-white rounded border border-gray-600 ml-1">Shift+Enter</kbd> for new line
          </p>
        </div>
      </Card>
    </section>
  );
}
