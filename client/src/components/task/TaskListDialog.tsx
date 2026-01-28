import { useState } from "react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, Flag, Plus } from "lucide-react";
import { Task } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface TaskListDialogProps {
  children: React.ReactNode;
}

export function TaskListDialog({ children }: TaskListDialogProps) {
  const { tasks, deleteTask } = useTaskManager();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Work": "bg-blue-100 text-blue-800 border-blue-200",
      "Personal": "bg-purple-100 text-purple-800 border-purple-200",
      "Shopping": "bg-pink-100 text-pink-800 border-pink-200",
      "Health": "bg-green-100 text-green-800 border-green-200",
      "Business": "bg-orange-100 text-orange-800 border-orange-200",
      "Other": "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category as keyof typeof colors] || "bg-indigo-100 text-indigo-800 border-indigo-200";
  };

  const formatTimer = (minutes: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Task Manager ({tasks.length} tasks)
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary">
                  Active Tasks ({activeTasks.length})
                </h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {activeTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="border border-border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-2">
                              {task.title}
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge 
                                variant="outline"
                                className={getCategoryColor(task.category)}
                              >
                                {task.category}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className={getPriorityColor(task.priority)}
                              >
                                <Flag className="h-3 w-3 mr-1" />
                                {task.priority}
                              </Badge>
                              {task.timer && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTimer(task.timer)}
                                </Badge>
                              )}
                            </div>
                            {task.youtubeUrl && (
                              <div className="text-sm text-muted-foreground">
                                📺 Video attached
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-muted-foreground">
                  Completed Tasks ({completedTasks.length})
                </h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {completedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="border border-border rounded-lg p-4 bg-card/50 opacity-75"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-muted-foreground line-through mb-2">
                              {task.title}
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge 
                                variant="outline"
                                className="bg-gray-100 text-gray-600 border-gray-200"
                              >
                                {task.category}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className="bg-gray-100 text-gray-600 border-gray-200"
                              >
                                <Flag className="h-3 w-3 mr-1" />
                                {task.priority}
                              </Badge>
                              {task.timer && (
                                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTimer(task.timer)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
                <p className="text-muted-foreground">
                  Create your first task to get started!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {activeTasks.length} active • {completedTasks.length} completed
            </span>
            <span>
              Click the trash icon to delete any task
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}