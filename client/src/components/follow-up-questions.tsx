import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type PromptEnhancement, type Question, type Answer, type EnhancementStyle } from "@shared/schema";
import { MessageCircle, Send, Loader2 } from "lucide-react";

interface FollowUpQuestionsProps {
  enhancement: PromptEnhancement;
  onEnhancementComplete: (enhancement: PromptEnhancement) => void;
}

export function FollowUpQuestions({ enhancement, onEnhancementComplete }: FollowUpQuestionsProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { toast } = useToast();

  const questions = enhancement.followUpQuestions as Question[] || [];

  const enhanceMutation = useMutation({
    mutationFn: async (data: { enhancementId: string; answers: Answer[]; style?: EnhancementStyle }) => {
      const response = await apiRequest("POST", "/api/enhance", data);
      return response.json();
    },
    onSuccess: (data: PromptEnhancement) => {
      onEnhancementComplete(data);
      toast({
        title: "✨ Enhancement Complete",
        description: "Your enhanced prompt is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Enhancement Failed",
        description: error.message || "Failed to enhance prompt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnswerChange = (questionId: string, answer: string | string[] | number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, answer } : a);
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleSubmit = () => {
    if (answers.length < questions.length) {
      toast({
        title: "Please Answer All Questions",
        description: "All questions are required to generate the best enhanced prompt.",
        variant: "destructive",
      });
      return;
    }

    enhanceMutation.mutate({
      enhancementId: enhancement.id,
      answers,
      style: enhancement.style as EnhancementStyle
    });
  };

  const answeredCount = answers.filter(a => 
    a.answer !== "" && a.answer !== null && a.answer !== undefined
  ).length;

  return (
    <section className="animate-slide-up">
      <Card className="glass-effect border-border/50">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Clarifying Questions</h3>
              <p className="text-xs text-gray-300">Help us understand your needs better</p>
            </div>
            <Badge variant="secondary" className="text-xs" data-testid="badge-questions-count">
              {answeredCount}/{questions.length}
            </Badge>
          </div>
          
          {/* Questions */}
          <div className="space-y-4 mb-6">
            {questions.map((question, index) => (
              <div 
                key={question.id} 
                className="p-4 rounded-xl bg-secondary/50 border border-border/50 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <h4 className="font-medium text-white text-sm flex-1" data-testid={`text-question-${question.id}`}>
                    {question.question}
                  </h4>
                </div>
                
                <div className="ml-9">
                  {question.type === "text" && (
                    <Textarea
                      data-testid={`input-answer-${question.id}`}
                      placeholder="Type your answer here..."
                      className="w-full h-20 bg-black border border-border/50 text-sm resize-none text-white placeholder:text-gray-400"
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                  )}
                  
                  {question.type === "choice" && question.options && (
                    <RadioGroup
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                      data-testid={`radio-group-${question.id}`}
                      className="space-y-2"
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                          <Label htmlFor={`${question.id}-${optIndex}`} className="text-sm cursor-pointer flex-1">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  {question.type === "checkbox" && question.options && (
                    <div className="grid gap-2" data-testid={`checkbox-group-${question.id}`}>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <Checkbox
                            id={`${question.id}-${optIndex}`}
                            onCheckedChange={(checked) => {
                              const currentAnswers = (answers.find(a => a.questionId === question.id)?.answer as string[]) || [];
                              if (checked) {
                                handleAnswerChange(question.id, [...currentAnswers, option]);
                              } else {
                                handleAnswerChange(question.id, currentAnswers.filter(a => a !== option));
                              }
                            }}
                          />
                          <Label htmlFor={`${question.id}-${optIndex}`} className="text-sm cursor-pointer flex-1">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === "scale" && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Simple</span>
                      <div className="flex gap-2" data-testid={`scale-${question.id}`}>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={answers.find(a => a.questionId === question.id)?.answer === value ? "default" : "outline"}
                            size="sm"
                            className="w-10 h-10 rounded-lg p-0 text-sm"
                            onClick={() => handleAnswerChange(question.id, value)}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Complex</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="text-sm text-gray-300">
              <span className="font-medium text-white" data-testid="text-answered-count">
                {answeredCount}
              </span> of <span data-testid="text-total-questions">{questions.length}</span> answered
            </div>
            <Button
              onClick={handleSubmit}
              disabled={enhanceMutation.isPending || answeredCount < questions.length}
              className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90"
              data-testid="button-generate-enhanced"
            >
              {enhanceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate Enhancement
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
