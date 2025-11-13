import { Card, CardContent } from "@/components/ui/card";
import { type PromptEnhancement } from "@shared/schema";
import { AlertTriangle, TrendingUp, Loader2, CheckCircle2 } from "lucide-react";

interface AnalysisResultsProps {
  enhancement: PromptEnhancement;
  visible: boolean;
  isLoading?: boolean;
}

export function AnalysisResults({ enhancement, visible, isLoading = false }: AnalysisResultsProps) {
  if (!visible) return null;

  // Show loading state - ONLY when analyzing
  if (isLoading || !enhancement.analysisResults) {
    return (
      <section className="animate-slide-up">
        <Card className="glass-effect border-border/50 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Analyzing Your Prompt</h3>
                <p className="text-xs text-gray-300">Identifying areas for improvement...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Show results when analysis is complete
  const analysis = enhancement.analysisResults as any;

  return (
    <section className="animate-slide-up">
      <Card className="glass-effect border-border/50 overflow-hidden">
        <CardContent className="p-6">
          {/* Success Header - NO SPINNER */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Analysis Complete</h3>
              <p className="text-xs text-gray-300">Here are your results...</p>
            </div>
          </div>
          
          {/* Analysis Content */}
          <div className="space-y-4">
            {/* Clarity Score */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Clarity Score</span>
                <span className="text-2xl font-bold text-orange-500">{analysis.clarityScore}/100</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                  style={{ width: `${analysis.clarityScore}%` }}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-1">Summary</p>
                  <p className="text-sm text-gray-200" data-testid="text-analysis-summary">
                    {analysis.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Gaps Grid */}
            {analysis.gaps && analysis.gaps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Missing Information</h4>
                <div className="grid gap-2">
                  {analysis.gaps.map((gap: string, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white" data-testid={`text-gap-${index}`}>
                        {gap}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weaknesses */}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Areas to Improve</h4>
                <div className="grid gap-2">
                  {analysis.weaknesses.map((weakness: string, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white" data-testid={`text-weakness-${index}`}>
                        {weakness}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
