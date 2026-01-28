import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTaskManager } from "@/hooks/useTaskManager";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ListChecks, Clock, Calendar, Trash, Pencil, Printer, Edit2, X, CheckCircle, Plane, ChevronDown, ChevronUp } from "lucide-react";
import { ChecklistDialog } from "./task/ChecklistDialog";
import { EditTaskDialog } from "./task/EditTaskDialog";
import { TemplateSelector } from "./templates/TemplateSelector";
import { Task } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export function ChecklistView() {
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks']
  });
  const { deleteTask } = useTaskManager();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [aviationMode, setAviationMode] = useState(false);
  const [templateBannerExpanded, setTemplateBannerExpanded] = useState(false);
  const [templateBannerHidden, setTemplateBannerHidden] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-collapse template banner after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTemplateBannerExpanded(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Filter tasks that have checklist items
  const tasksWithChecklists = tasks.filter(task => 
    task.checklistItems && task.checklistItems.length > 0
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-400 bg-red-50 dark:bg-red-950";
      case "Medium": return "text-primary bg-primary/10";
      case "Low": return "text-muted-foreground bg-muted";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getCategoryColor = (completed: boolean) => {
    return completed ? "bg-primary/5 text-muted-foreground" : "bg-primary/10 text-primary";
  };

  const getChecklistProgress = (checklistItems: ChecklistItem[]) => {
    const completed = checklistItems.filter(item => item.completed).length;
    const total = checklistItems.length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  // Mutation to update checklist items with optimistic updates
  const updateChecklistMutation = useMutation({
    mutationFn: async ({ taskId, checklistItems }: { taskId: string, checklistItems: ChecklistItem[] }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${taskId}/checklist`, { checklistItems });
      return response.json();
    },
    onMutate: async ({ taskId, checklistItems }) => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["/api/tasks"] });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(["/api/tasks"]);
      
      // Optimistically update the cache
      queryClient.setQueryData<Task[]>(["/api/tasks"], (old) => {
        if (!old) return old;
        return old.map(task => 
          task.id === taskId 
            ? { ...task, checklistItems } 
            : task
        );
      });
      
      return { previousTasks };
    },
    onError: (error, variables, context) => {
      // Rollback to the previous state on error
      if (context?.previousTasks) {
        queryClient.setQueryData(["/api/tasks"], context.previousTasks);
      }
      console.error("Checklist update error:", error);
      toast({
        title: "❌ Update failed",
        description: "Could not update checklist. Please try again.",
        variant: "destructive",
      });
    },
    // NO onSuccess, NO refetch - optimistic update is enough!
  });

  // Toggle checklist item completion
  const toggleChecklistItem = (task: Task, itemId: string) => {
    const updatedItems = task.checklistItems!.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    // Pre-sort here so no sorting happens during render
    .sort((a, b) => {
      // First sort by completion status (incomplete items first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Keep existing order within each group
      return 0;
    });
    updateChecklistMutation.mutate({ taskId: task.id, checklistItems: updatedItems });
  };

  // Update checklist item text
  const updateChecklistItemText = (task: Task, itemId: string, newText: string) => {
    if (!newText.trim()) return;
    const updatedItems = task.checklistItems!.map(item => 
      item.id === itemId ? { ...item, text: newText.trim() } : item
    );
    updateChecklistMutation.mutate({ taskId: task.id, checklistItems: updatedItems });
    setEditingItem(null);
    setEditText("");
  };

  // Start editing an item
  const startEditing = (itemId: string, currentText: string) => {
    setEditingItem(itemId);
    setEditText(currentText);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
    setEditText("");
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const copyChecklistToClipboard = async () => {
    const textContent = tasksWithChecklists.map((task) => {
      const progress = getChecklistProgress(task.checklistItems!);
      let taskText = `${task.title}\n`;
      taskText += `Category: ${task.category} | Priority: ${task.priority}${task.timer ? ` | Timer: ${task.timer}m` : ''}\n`;
      taskText += `Progress: ${progress.completed}/${progress.total} items (${progress.percentage}%)\n\n`;
      
      task.checklistItems!.forEach((item: ChecklistItem) => {
        taskText += `${item.completed ? '✓' : '☐'} ${item.text}\n`;
      });
      
      return taskText + '\n';
    }).join('');

    const fullText = `AIChecklist - Task Checklists\nGenerated on ${new Date().toLocaleDateString()}\n\n${textContent}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      toast({ title: "Copied!", description: "Checklist items copied to clipboard" });
    } catch (error) {
      toast({ title: "Copy failed", description: "Unable to copy to clipboard", variant: "destructive" });
    }
    setShowPrintModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading checklists...</div>
      </div>
    );
  }

  if (tasksWithChecklists.length === 0) {
    return (
      <div className="bg-card p-6 rounded-lg border">
        <div className="text-center space-y-4">
          <ListChecks className="h-16 w-16 text-green-500 mx-auto" />
          <h3 className="text-lg font-semibold text-foreground">No Checklists Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create checklists by adding them to your tasks using the green checklist button (📋) in the Tasks tab.
          </p>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Tip:</strong> Look for the green checklist button on the right side of your tasks to add sub-task checkboxes!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Aviation Mode wrapper - mobile-responsive
  const AviationModeWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!aviationMode) return <div className="space-y-4">{children}</div>;
    
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <div className="min-h-screen p-2 sm:p-4 md:p-6">
          {children}
        </div>
      </div>
    );
  };

  return (
    <AviationModeWrapper>
      {/* Template Banner - Auto-collapses after 5 seconds */}
      {!templateBannerHidden && (
        <div 
          className={cn(
            "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-6 overflow-hidden transition-all duration-500 ease-in-out relative",
            templateBannerExpanded ? "p-4" : "p-2"
          )}
        >
          <button
            onClick={() => setTemplateBannerHidden(true)}
            className="absolute top-2 right-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50"
            aria-label="Hide banner"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 pr-6">
            <ListChecks className={cn(
              "text-blue-600 dark:text-blue-400 flex-shrink-0 transition-all duration-500",
              templateBannerExpanded ? "h-6 w-6" : "h-5 w-5"
            )} />
            <div className="flex-1 min-w-0">
              {templateBannerExpanded ? (
                <div className="animate-in fade-in duration-300">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base mb-1">
                    Hundreds of Diverse Templates Available
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    For personal, professional and academics — create a checklist at any time using the green button below
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium truncate">
                    Templates available - Click to explore
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setTemplateBannerExpanded(!templateBannerExpanded)}
              className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50"
              aria-label={templateBannerExpanded ? "Collapse banner" : "Expand banner"}
            >
              {templateBannerExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Header with Print Button and Aviation Mode - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <ListChecks className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Task Checklists</h2>
          <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
            {tasksWithChecklists.length} tasks
          </span>
          {aviationMode && (
            <span 
              className="hidden sm:flex items-center gap-2 bg-blue-500/20 border border-blue-500/50 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium"
            >
              <Plane className="h-4 w-4" />
              Aviation Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <TemplateSelector defaultMode="checklist" />
          <Button
            onClick={() => setAviationMode(!aviationMode)}
            variant={aviationMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex items-center gap-2 flex-1 sm:flex-initial text-xs sm:text-sm",
              aviationMode 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "hover:bg-blue-50 dark:hover:bg-blue-950"
            )}
            data-testid="button-aviation-mode"
          >
            <Plane className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{aviationMode ? "Exit Aviation Mode" : "Aviation Mode"}</span>
            <span className="sm:hidden">{aviationMode ? "Exit" : "Aviation"}</span>
          </Button>
          {!aviationMode && (
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 flex-1 sm:flex-initial hover:bg-primary/10 text-xs sm:text-sm"
            >
              <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Print Checklists</span>
              <span className="sm:hidden">Print</span>
            </Button>
          )}
        </div>
      </div>
      {tasksWithChecklists.map((task, index) => {
        const progress = getChecklistProgress(task.checklistItems!);
        
        return (
          <div
            key={task.id}
            className={cn(
              "border border-green-500/20 rounded-lg p-3 sm:p-4 bg-green-500/5 shadow-sm mb-3 sm:mb-4",
              task.completed && "opacity-70"
            )}
          >
              {/* Task Header - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3">
                <div className="flex-1">
                  <div className="flex items-start sm:items-center gap-2 mb-2">
                    <h3 className={cn(
                      "font-medium text-sm sm:text-base text-foreground flex-1",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </h3>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <ChecklistDialog task={task}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-orange-500/20 border border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-200"
                          aria-label="Add/Remove checklist items"
                          title="Add or remove checklist items"
                        >
                          <ListChecks className="h-3 w-3" />
                        </Button>
                      </ChecklistDialog>
                      
                      <EditTaskDialog task={{...task}} />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-red-100 dark:hover:bg-red-950"
                        aria-label="Delete task"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-wrap">
                    <span className={cn("px-1.5 sm:px-2 py-0.5 rounded-full text-xs", getCategoryColor(task.completed))}>
                      {task.category}
                    </span>
                    <span className={cn("px-1.5 sm:px-2 py-0.5 rounded-full text-xs", getPriorityColor(task.priority))}>
                      {task.priority}
                    </span>
                    {task.timer && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{task.timer}m</span>
                      </span>
                    )}
                    {task.scheduledDate && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{new Date(task.scheduledDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-left sm:text-right flex sm:flex-col gap-2 sm:gap-0 items-center sm:items-end">
                  <div className="text-sm sm:text-base font-medium text-foreground">
                    {progress.completed}/{progress.total}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {progress.percentage}% complete
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 mb-3">
                <div
                  className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              {/* Checklist Items - Mobile Responsive */}
              <div className="space-y-1.5 sm:space-y-2">
                {task.checklistItems!.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-2 text-xs sm:text-sm hover:bg-background/50 p-1.5 sm:p-2 rounded transition-all duration-200"
                  >
                    {/* Interactive Checkbox */}
                    <button
                      onClick={() => toggleChecklistItem(task, item.id)}
                      className={cn(
                        "flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-200 hover:scale-110",
                        item.completed 
                          ? "bg-green-500 border-green-500 hover:bg-green-600" 
                          : "border-muted-foreground hover:border-green-500 hover:bg-green-500/10"
                      )}
                      disabled={updateChecklistMutation.isPending}
                    >
                      {item.completed && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </button>
                    
                    {/* Editable Text */}
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateChecklistItemText(task, item.id, editText);
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          className="flex-1 h-7 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => updateChecklistItemText(task, item.id, editText)}
                        >
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={cancelEditing}
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <span 
                          className={cn(
                            "flex-1 cursor-text",
                            item.completed && "line-through text-muted-foreground"
                          )}
                          onClick={() => startEditing(item.id, item.text)}
                        >
                          {item.text}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => startEditing(item.id, item.text)}
                        >
                          <Edit2 className="h-3 w-3 text-muted-foreground hover:text-primary" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Print Preview - Checklist Items</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrintModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                <h1 className="text-2xl font-bold">AIChecklist - Task Checklists</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
              </div>
              
              {tasksWithChecklists.map((task) => {
                const progress = getChecklistProgress(task.checklistItems!);
                return (
                  <div key={task.id} className={cn(
                    "mb-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4",
                    task.completed && "opacity-70"
                  )}>
                    <h3 className={cn(
                      "text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100",
                      task.completed && "line-through text-gray-500"
                    )}>
                      {task.title}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Category: {task.category} | Priority: {task.priority}
                      {task.timer && ` | Timer: ${task.timer}m`}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-3">
                      Progress: {progress.completed}/{progress.total} items ({progress.percentage}%)
                    </div>
                    <div className="space-y-2">
                      {task.checklistItems!.map((item: ChecklistItem) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 border-2 border-gray-400 dark:border-gray-500 rounded-sm flex items-center justify-center mt-0.5 flex-shrink-0",
                            item.completed && "bg-green-500 border-green-500"
                          )}>
                            {item.completed && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm",
                            item.completed && "line-through text-gray-500 dark:text-gray-400"
                          )}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-muted-foreground">
                Use Ctrl+P (Windows) or Cmd+P (Mac) to print this view
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyChecklistToClipboard}
                  className="flex items-center gap-2"
                >
                  📋 Copy Text
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPrintModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AviationModeWrapper>
  );
}