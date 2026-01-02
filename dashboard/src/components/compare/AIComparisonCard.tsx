"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { generateAIExplanation, CompareProgramData } from "@/lib/api/compare";
import { toast } from "sonner";

interface AIComparisonCardProps {
  programA: CompareProgramData;
  programB: CompareProgramData;
  onExplanationGenerated?: (explanation: string) => void;
}

export default function AIComparisonCard({ programA, programB, onExplanationGenerated }: AIComparisonCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (summary) {
      // Already generated, just toggle expansion
      setExpanded(!expanded);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await generateAIExplanation(programA, programB);

      if (result.error) {
        setError(result.error);
        toast.error("Failed to generate AI explanation. Please try again.");
        return;
      }

      if (result.data?.summary) {
        setSummary(result.data.summary);
        setExpanded(true);
        onExplanationGenerated?.(result.data.summary);
        toast.success("AI comparison generated successfully!");
      } else {
        setError("No explanation generated");
        toast.error("Failed to generate explanation");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error("Failed to generate AI explanation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-white/20 dark:border-slate-700/20 shadow-lg overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              AI Comparison Summary
            </h2>
          </div>
          {summary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {!summary && !loading && (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Get an AI-powered comparison of these two programs, including key differences, strengths, and recommendations.
            </p>
            <Button
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Explanation
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Generating AI comparison...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-6">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button
              onClick={handleGenerate}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Retry
            </Button>
          </div>
        )}

        {summary && expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {summary}
              </div>
            </div>
          </div>
        )}

        {summary && !expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-muted-foreground">
              Click to expand AI comparison summary
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

