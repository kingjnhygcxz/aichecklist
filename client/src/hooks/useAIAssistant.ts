import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useTaskManager } from "./useTaskManager";

interface AIAssistantResponse {
  suggestions: string[];
  insights: string[];
}

export function useAIAssistant() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { tasks } = useTaskManager();

  // Create a stable hash that only changes on meaningful task changes
  // (ignores checklist item changes to prevent unnecessary AI calls)
  const taskHash = tasks.map(task => 
    `${task.id}|${task.title}|${task.category}|${task.priority}|${task.completed}`
  ).join('::');

  useEffect(() => {
    // Use a flag to prevent redundant fetches
    let isMounted = true;
    
    async function fetchAIAssistance() {
      // No need to fetch if there are no tasks
      if (tasks.length === 0) {
        if (isMounted) {
          setSuggestions([
            "Review weekly metrics",
            "Schedule team meeting",
            "Update project documents"
          ]);
        }
        return;
      }

      // Don't set loading state if we're already unmounted
      if (isMounted) {
        setIsLoading(true);
      }
      
      try {
        // Create a stable reference to the tasks to prevent unnecessary re-renders
        const taskData = tasks.map(task => ({
          id: task.id,
          title: task.title,
          category: task.category,
          priority: task.priority,
          completed: task.completed
        }));
        
        const response = await apiRequest("POST", "/api/ai/suggestions", { tasks: taskData });
        
        if (!isMounted) return;
        
        const data: AIAssistantResponse = await response.json();
        setSuggestions(data.suggestions);
        if (data.insights && data.insights.length > 0) {
          setInsights(data.insights);
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error("Failed to fetch AI suggestions:", error);
        // Fallback suggestions
        setSuggestions([
          "Review weekly metrics",
          "Schedule team meeting",
          "Update project documents"
        ]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    // Debounce the fetch to avoid multiple requests
    const timerId = setTimeout(() => {
      fetchAIAssistance();
    }, 300);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [taskHash]); // Only trigger when taskHash changes (not on checklist item changes!)

  return { suggestions, insights, isLoading };
}
