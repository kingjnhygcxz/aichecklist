import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  CheckSquare,
  Square,
  ListChecks
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistDialogProps {
  task?: Task | null;
  children: React.ReactNode;
  isNewTask?: boolean;
  initialItems?: ChecklistItem[];
  onItemsChange?: (items: ChecklistItem[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChecklistDialog({ 
  task, 
  children, 
  isNewTask = false, 
  initialItems = [], 
  onItemsChange,
  open,
  onOpenChange 
}: ChecklistDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    initialItems.length > 0 ? initialItems : (task?.checklistItems || [])
  );

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateChecklistMutation = useMutation({
    mutationFn: async (items: ChecklistItem[]) => {
      if (!task?.id) return Promise.resolve();
      console.log(`Updating checklist for task ID: ${task.id}`, { checklistItems: items });
      const response = await apiRequest("PATCH", `/api/tasks/${task.id}/checklist`, { checklistItems: items });
      return response.json();
    },
    onSuccess: () => {
      if (task?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        toast({
          title: "✓ Checklist updated",
          description: "Your task checklist has been saved successfully.",
          className: "border-green-500/20 bg-green-950/50 text-green-200",
        });
      }
    },
    onError: (error) => {
      console.error("Checklist update error:", error, "Task ID:", task?.id);
      toast({
        title: "Failed to update checklist",
        description: `Error: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newItemText.trim(),
      completed: false,
    };
    
    const updatedItems = [...checklistItems, newItem];
    setChecklistItems(updatedItems);
    setNewItemText("");
    
    if (isNewTask) {
      onItemsChange?.(updatedItems);
    } else {
      updateChecklistMutation.mutate(updatedItems);
    }
  };

  const toggleItem = (itemId: string) => {
    const updatedItems = checklistItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedItems);
    
    if (isNewTask) {
      onItemsChange?.(updatedItems);
    } else {
      updateChecklistMutation.mutate(updatedItems);
    }
  };

  const deleteItem = (itemId: string) => {
    const updatedItems = checklistItems.filter(item => item.id !== itemId);
    setChecklistItems(updatedItems);
    
    if (isNewTask) {
      onItemsChange?.(updatedItems);
    } else {
      updateChecklistMutation.mutate(updatedItems);
    }
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900/95 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-100">
            <ListChecks className="h-5 w-5 text-green-500" />
            {isNewTask ? "New Task Checklist" : "Task Checklist"}
            {totalCount > 0 && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-2 text-xs",
                  completedCount === totalCount && totalCount > 0
                    ? "bg-green-900/50 text-green-200 border-green-500/20"
                    : "bg-gray-700 text-gray-300"
                )}
              >
                {completedCount}/{totalCount}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task title reference - only show for existing tasks */}
          {task && !isNewTask && (
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-300 truncate">{task.title}</p>
            </div>
          )}

          {/* Add new item */}
          <div className="flex gap-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add checklist item..."
              className="flex-1 bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addItem();
                }
              }}
            />
            <Button
              onClick={addItem}
              size="sm"
              disabled={!newItemText.trim() || updateChecklistMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Checklist items */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {checklistItems
                .sort((a, b) => {
                  // First sort by completion status (incomplete items first)
                  if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                  }
                  // Keep existing order within each group
                  return 0;
                })
                .map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30 border border-gray-700/50 group hover:bg-gray-800/50 transition-colors"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className={cn(
                      "data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600",
                      "border-gray-500 hover:border-orange-500"
                    )}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm transition-all",
                      item.completed
                        ? "line-through text-gray-500"
                        : "text-gray-200"
                    )}
                  >
                    {item.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-950/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {checklistItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No checklist items yet</p>
                <p className="text-xs text-gray-600">Add items to break down this task</p>
              </div>
            )}
          </div>

          {/* Progress summary */}
          {totalCount > 0 && (
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span className="text-orange-400">
                  {Math.round((completedCount / totalCount) * 100)}% complete
                </span>
              </div>
              <div className="mt-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(completedCount / totalCount) * 100}%` 
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}