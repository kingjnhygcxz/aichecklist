import { useAIAssistant } from "@/hooks/useAIAssistant";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface AIAssistantProps {
  onSelectSuggestion: (suggestion: string) => void;
}

export function AIAssistant({ onSelectSuggestion }: AIAssistantProps) {
  const { suggestions, isLoading } = useAIAssistant();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="mb-4 p-3 border border-border bg-background/50 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted-foreground text-sm">
          {isLoading 
            ? "Generating suggestions..." 
            : "Based on your patterns, consider adding:"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <Plus className="h-4 w-4 text-primary" />
          ) : (
            <Minus className="h-4 w-4 text-primary" />
          )}
        </Button>
      </div>
      {!isCollapsed && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              className="bg-background hover:bg-primary/10 text-sm px-3 py-1.5 rounded-full border border-border transition-colors flex items-center gap-1 h-auto"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              <Plus className="h-3 w-3 text-primary" />
              <span>{suggestion}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
