import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type PromptEnhancement } from "@shared/schema";
import { Clock, BookmarkPlus, Eye, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface HistoryPanelProps {
  onSelectEnhancement?: (enhancement: PromptEnhancement) => void;
  onSaveEnhancement?: (id: string, title?: string) => void;
}

export function HistoryPanel({ onSelectEnhancement, onSaveEnhancement }: HistoryPanelProps) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: history = [], isLoading } = useQuery<PromptEnhancement[]>({
    queryKey: ["/api/history"],
  });

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: "Copied!",
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

  const handleSave = (enhancement: PromptEnhancement) => {
    const title = enhancement.originalPrompt.substring(0, 50) + (enhancement.originalPrompt.length > 50 ? "..." : "");
    onSaveEnhancement?.(enhancement.id, title);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Recent History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Recent History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No enhancement history yet</p>
            <p className="text-sm">Complete your first prompt enhancement to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Recent History</span>
          <Badge variant="secondary" data-testid="badge-history-count">
            {history.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-6">
            {history.map((enhancement: PromptEnhancement, index: number) => (
              <div key={enhancement.id}>
                <div className="group relative p-4 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-medium text-foreground line-clamp-2 mb-1"
                        data-testid={`text-history-prompt-${index}`}
                      >
                        {enhancement.originalPrompt}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span data-testid={`text-history-time-${index}`}>
                          {formatDistanceToNow(new Date(enhancement.createdAt!), { addSuffix: true })}
                        </span>
                        {enhancement.saved && (
                          <Badge variant="outline" className="h-4 px-1 text-xs">
                            Saved
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onSelectEnhancement?.(enhancement)}
                        data-testid={`button-view-${enhancement.id}`}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {enhancement.enhancedPrompt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleCopyPrompt(enhancement.enhancedPrompt!)}
                          data-testid={`button-copy-${enhancement.id}`}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {!enhancement.saved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSave(enhancement)}
                          data-testid={`button-save-${enhancement.id}`}
                        >
                          <BookmarkPlus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < history.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}