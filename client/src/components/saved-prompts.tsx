import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { type PromptEnhancement } from "@shared/schema";
import { Bookmark, Edit3, Trash2, Eye, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SavedPromptsProps {
  onSelectEnhancement?: (enhancement: PromptEnhancement) => void;
}

export function SavedPrompts({ onSelectEnhancement }: SavedPromptsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const { data: saved = [], isLoading } = useQuery<PromptEnhancement[]>({
    queryKey: ["/api/saved"],
  });

  const unsaveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/save/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Removed from Saved",
        description: "Prompt has been removed from your saved collection.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove prompt from saved collection.",
        variant: "destructive",
      });
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const response = await apiRequest("POST", `/api/save/${id}`, { title });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved"] });
      setEditingId(null);
      setNewTitle("");
      toast({
        title: "Title Updated",
        description: "Prompt title has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update prompt title.",
        variant: "destructive",
      });
    },
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

  const handleEditTitle = (enhancement: PromptEnhancement) => {
    setEditingId(enhancement.id);
    setNewTitle(enhancement.title || "");
  };

  const handleSaveTitle = () => {
    if (editingId && newTitle.trim()) {
      updateTitleMutation.mutate({ id: editingId, title: newTitle.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewTitle("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5" />
            <span>Saved Prompts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
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

  if (saved.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5" />
            <span>Saved Prompts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No saved prompts yet</p>
            <p className="text-sm">Save your favorite enhanced prompts for quick access</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bookmark className="w-5 h-5" />
          <span>Saved Prompts</span>
          <Badge variant="secondary" data-testid="badge-saved-count">
            {saved.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-6">
            {saved.map((enhancement: PromptEnhancement, index: number) => (
              <div key={enhancement.id}>
                <div className="group relative p-4 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex-1 min-w-0">
                      {editingId === enhancement.id ? (
                        <div className="space-y-2">
                          <Label htmlFor="edit-title" className="text-xs">Edit Title</Label>
                          <Input
                            id="edit-title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Enter title..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveTitle();
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            data-testid={`input-edit-title-${enhancement.id}`}
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={handleSaveTitle}
                              disabled={updateTitleMutation.isPending || !newTitle.trim()}
                              data-testid={`button-save-title-${enhancement.id}`}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={handleCancelEdit}
                              data-testid={`button-cancel-title-${enhancement.id}`}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 
                            className="text-sm font-medium text-foreground mb-1"
                            data-testid={`text-saved-title-${index}`}
                          >
                            {enhancement.title || "Untitled Prompt"}
                          </h4>
                          <p 
                            className="text-xs text-muted-foreground line-clamp-2 mb-2"
                            data-testid={`text-saved-prompt-${index}`}
                          >
                            {enhancement.originalPrompt}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span data-testid={`text-saved-time-${index}`}>
                              Saved {formatDistanceToNow(new Date(enhancement.createdAt!), { addSuffix: true })}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {editingId !== enhancement.id && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onSelectEnhancement?.(enhancement)}
                          data-testid={`button-view-saved-${enhancement.id}`}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        
                        {enhancement.enhancedPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleCopyPrompt(enhancement.enhancedPrompt!)}
                            data-testid={`button-copy-saved-${enhancement.id}`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditTitle(enhancement)}
                          data-testid={`button-edit-saved-${enhancement.id}`}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              data-testid={`button-delete-saved-${enhancement.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove from Saved</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove "{enhancement.title || "this prompt"}" from your saved collection? 
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end space-x-2">
                              <DialogTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogTrigger>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => unsaveMutation.mutate(enhancement.id)}
                                  disabled={unsaveMutation.isPending}
                                  data-testid={`button-confirm-delete-${enhancement.id}`}
                                >
                                  {unsaveMutation.isPending ? "Removing..." : "Remove"}
                                </Button>
                              </DialogTrigger>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
                
                {index < saved.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}