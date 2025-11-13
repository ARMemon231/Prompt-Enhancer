import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type PromptEnhancement } from "@shared/schema";
import { CheckCircle2, Copy, Download, Share2, Sparkles, RotateCcw, Bookmark, BookmarkCheck } from "lucide-react";

interface EnhancedPromptProps {
  enhancement: PromptEnhancement;
  onStartNew: () => void;
}

export function EnhancedPrompt({ enhancement, onStartNew }: EnhancedPromptProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const response = await apiRequest("POST", `/api/save/${id}`, { title });
      return response.json();
    },
    onSuccess: (data) => {
      if (enhancement.id === data.id) {
        Object.assign(enhancement, { saved: true, title: data.title });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "✨ Saved!",
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

  const unsaveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/save/${id}`);
      return response.json();
    },
    onSuccess: (data) => {
      if (enhancement.id === data.id) {
        Object.assign(enhancement, { saved: false, title: null });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Removed",
        description: "Prompt has been removed from saved collection.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove prompt.",
        variant: "destructive",
      });
    },
  });

  const handleCopy = async () => {
    if (!enhancement.enhancedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(enhancement.enhancedPrompt);
      toast({
        title: "📋 Copied!",
        description: "Enhanced prompt copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!enhancement.enhancedPrompt) return;
    
    const blob = new Blob([enhancement.enhancedPrompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enhanced-prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "📥 Downloaded",
      description: "Enhanced prompt saved as text file.",
    });
  };

  const handleShare = () => {
    if (navigator.share && enhancement.enhancedPrompt) {
      navigator.share({
        title: "Enhanced Prompt",
        text: enhancement.enhancedPrompt,
      });
    } else {
      toast({
        title: "Sharing",
        description: "Use the copy button to share your enhanced prompt.",
      });
    }
  };

  const handleSave = () => {
    const title = enhancement.originalPrompt.substring(0, 50) + (enhancement.originalPrompt.length > 50 ? "..." : "");
    saveMutation.mutate({ id: enhancement.id, title });
  };

  const handleUnsave = () => {
    unsaveMutation.mutate(enhancement.id);
  };

  const improvementSummary = enhancement.improvementSummary as any;

  return (
    <section className="animate-slide-up space-y-4">
      {/* Success Banner */}
      <Card className="glass-effect border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Enhancement Complete!</h3>
              <p className="text-xs text-gray-300">Your improved prompt is ready to use</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          </div>

          {/* Enhanced Prompt Display */}
          <div className="rounded-xl bg-secondary/50 border border-border/50 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enhanced Prompt</span>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                data-testid="button-copy-prompt"
              >
                <Copy className="w-3 h-3 mr-1.5" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-white leading-relaxed" data-testid="text-enhanced-prompt">
              {enhancement.enhancedPrompt}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleCopy}
              className="bg-primary hover:bg-primary/90 text-xs h-8"
              data-testid="button-copy-prompt"
            >
              <Copy className="w-3 h-3 mr-1.5" />
              Copy
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="secondary"
              className="text-xs h-8"
              data-testid="button-download-prompt"
            >
              <Download className="w-3 h-3 mr-1.5" />
              Download
            </Button>
            
            <Button
              onClick={handleShare}
              variant="ghost"
              className="text-xs h-8"
              data-testid="button-share-prompt"
            >
              <Share2 className="w-3 h-3 mr-1.5" />
              Share
            </Button>
            
            {enhancement.saved ? (
              <Button
                onClick={handleUnsave}
                variant="ghost"
                className="text-xs h-8 text-amber-500 hover:text-amber-600"
                disabled={unsaveMutation.isPending}
                data-testid="button-unsave-prompt"
              >
                <BookmarkCheck className="w-3 h-3 mr-1.5" />
                {unsaveMutation.isPending ? "Removing..." : "Saved"}
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                variant="ghost"
                className="text-xs h-8"
                disabled={saveMutation.isPending}
                data-testid="button-save-prompt"
              >
                <Bookmark className="w-3 h-3 mr-1.5" />
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            )}

            <div className="flex-1" />
            
            <Button
              onClick={onStartNew}
              variant="outline"
              className="text-xs h-8"
              data-testid="button-start-new"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" />
              New Enhancement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original */}
        <Card className="glass-effect border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                <span className="text-xs">📝</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Original</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed" data-testid="text-original-prompt">
              {enhancement.originalPrompt}
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="glass-effect border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-green-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Improvements</span>
            </div>
            <div className="space-y-2">
              {improvementSummary && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Clarity Score</span>
                    <span className="text-sm font-semibold text-green-500">
                      {improvementSummary.enhancedClarityScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Detail Level</span>
                    <span className="text-sm font-semibold text-primary">
                      {improvementSummary.improvementRatio}x
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                  Production Ready
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
