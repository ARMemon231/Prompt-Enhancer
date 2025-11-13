import { useState } from "react";
import { PromptInput } from "@/components/prompt-input";
import { AnalysisResults } from "@/components/analysis-results";
import { FollowUpQuestions } from "@/components/follow-up-questions";
import { EnhancedPrompt } from "@/components/enhanced-prompt";
import { HistoryPanel } from "@/components/history-panel";
import { SavedPrompts } from "@/components/saved-prompts";
import { type PromptEnhancement } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, History, Bookmark, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [enhancement, setEnhancement] = useState<PromptEnhancement | null>(null);
  const [currentStep, setCurrentStep] = useState<"input" | "analysis" | "questions" | "enhanced">("input");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const response = await apiRequest("POST", `/api/save/${id}`, { title });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Saved!",
        description: "Prompt has been saved to your collection.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save prompt.",
        variant: "destructive",
      });
    },
  });

  const handleAnalysisComplete = (result: PromptEnhancement) => {
    setIsAnalyzing(false);
    setEnhancement(result);
    setCurrentStep("analysis");
    
    // Auto-progress to questions after showing analysis
    setTimeout(() => {
      setCurrentStep("questions");
    }, 2000);
  };

  const handleEnhancementComplete = (result: PromptEnhancement) => {
    setEnhancement(result);
    setCurrentStep("enhanced");
  };

  const resetWorkflow = () => {
    setEnhancement(null);
    setCurrentStep("input");
  };

  const handleSelectFromHistory = (selectedEnhancement: PromptEnhancement) => {
    setEnhancement(selectedEnhancement);
    if (selectedEnhancement.completed) {
      setCurrentStep("enhanced");
    } else if (selectedEnhancement.followUpQuestions) {
      setCurrentStep("questions");
    } else if (selectedEnhancement.analysisResults) {
      setCurrentStep("analysis");
    } else {
      setCurrentStep("input");
    }
    setSidebarOpen(false);
  };

  const handleSaveFromHistory = (id: string, title?: string) => {
    saveMutation.mutate({ id, title: title || "Saved Prompt" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold gradient-text">Prompt Enhancer</h1>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Message - Only show on initial load */}
            {currentStep === "input" && !enhancement && (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold gradient-text">
                  Transform Your Ideas
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Describe your prompt or idea below. Our AI will analyze it, ask clarifying questions, and generate an enhanced version.
                </p>
              </div>
            )}

            {/* Conversation Flow */}
            <div className="space-y-4">
              {currentStep !== "input" && enhancement && (
              <AnalysisResults 
              enhancement={enhancement}
              visible={currentStep === "analysis" || currentStep === "questions" || currentStep === "enhanced"}
                isLoading={isAnalyzing}
                />
            )}
              
              {currentStep === "questions" && enhancement && (
                <FollowUpQuestions
                  enhancement={enhancement}
                  onEnhancementComplete={handleEnhancementComplete}
                />
              )}
              
              {currentStep === "enhanced" && enhancement && (
                <EnhancedPrompt
                  enhancement={enhancement}
                  onStartNew={resetWorkflow}
                />
              )}
            </div>

            {/* Input always at bottom */}
            <div className="sticky bottom-4">
              <PromptInput 
                onAnalysisComplete={handleAnalysisComplete}
                onAnalysisStart={() => setIsAnalyzing(true)}
                disabled={false}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className={`lg:col-span-1 ${sidebarOpen ? 'fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:relative lg:bg-transparent lg:backdrop-blur-none p-4 lg:p-0' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-20 h-full overflow-y-auto">
              {sidebarOpen && (
                <div className="flex justify-between items-center mb-4 lg:hidden">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}
              
              <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                  <TabsTrigger value="history" data-testid="tab-history" className="text-xs">
                    <History className="w-3 h-3 mr-1.5" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="saved" data-testid="tab-saved" className="text-xs">
                    <Bookmark className="w-3 h-3 mr-1.5" />
                    Saved
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="history" className="mt-4">
                  <HistoryPanel
                    onSelectEnhancement={handleSelectFromHistory}
                    onSaveEnhancement={handleSaveFromHistory}
                  />
                </TabsContent>
                
                <TabsContent value="saved" className="mt-4">
                  <SavedPrompts
                    onSelectEnhancement={handleSelectFromHistory}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
