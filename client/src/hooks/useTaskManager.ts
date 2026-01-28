import { v4 as uuidv4 } from "uuid";
import { Task, InsertTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";

export function useTaskManager() {
  const { toast } = useToast();

  // Use React Query for tasks
  const { data: tasks = [], isLoading: loading } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/tasks");
        return await response.json() as Task[];
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Failed to fetch tasks:", error);
        
        // Check if it's a rate limit error - preserve existing cache
        if (errorMessage.includes('429')) {
          toast({
            title: "Slow down!",
            description: "You're clicking too fast. Please wait a moment.",
            variant: "default",
          });
          // Return previous data from cache if available
          const cachedTasks = queryClient.getQueryData<Task[]>(['/api/tasks']);
          if (cachedTasks && cachedTasks.length > 0) {
            return cachedTasks;
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to load your tasks. Please try again.",
            variant: "destructive",
          });
        }
        return [];
      }
    },
    retry: 1, // Retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (newTask: InsertTask) => {
      const taskWithId = {
        ...newTask,
        id: uuidv4(),
      };
      return await apiRequest("POST", "/api/tasks", taskWithId);
    },
    onSuccess: () => {
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task added",
        description: "Your task has been added successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to add task:', error);
      toast({
        title: "Error",
        description: "Failed to add the task. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addTask = (newTask: InsertTask) => {
    addTaskMutation.mutate(newTask);
  };

  const createTask = (newTask: InsertTask) => {
    addTaskMutation.mutate(newTask);
  };

  // Archive task mutation
  const archiveTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return await apiRequest("PATCH", `/api/tasks/${taskId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      console.error('Failed to archive task:', error);
      throw error;
    }
  });

  const archiveTask = (taskId: string) => {
    return archiveTaskMutation.mutateAsync(taskId);
  };

  // Toggle task completion mutation with optimistic updates for instant UI feedback
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string, completed: boolean }) => {
      console.log(`Attempting to toggle task completion: ${taskId}, completed: ${completed}`);
      try {
        const response = await apiRequest("PATCH", `/api/tasks/${taskId}`, { completed });
        console.log('Toggle completion response:', response.status, response.statusText);
        
        // Check response status code to handle specific errors
        if (!response.ok) {
          console.error(`Bad response: ${response.status} ${response.statusText}`);
          const errorData = await response.text();
          console.error('Error data:', errorData);
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        console.error('Toggle task completion error:', error);
        throw error;
      }
    },
    // Optimistic update: immediately update the UI before the API call completes
    onMutate: async ({ taskId, completed }) => {
      // Cancel any outgoing refetches to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ['/api/tasks'] });
      
      // Snapshot the previous value for rollback
      const previousTasks = queryClient.getQueryData<Task[]>(['/api/tasks']);
      
      // Optimistically update the cache
      queryClient.setQueryData<Task[]>(['/api/tasks'], (old) => {
        if (!old) return old;
        return old.map(task => 
          task.id === taskId 
            ? { ...task, completed } 
            : task
        );
      });
      
      console.log(`Optimistically updated task ${taskId} to completed: ${completed}`);
      
      // Return context with snapshot for potential rollback
      return { previousTasks };
    },
    onSuccess: () => {
      // Invalidate tasks query to refetch and ensure consistency with server
      console.log('Task completion status toggled successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error, variables, context) => {
      // Roll back the optimistic update on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['/api/tasks'], context.previousTasks);
        console.log('Rolled back optimistic update due to error');
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to update task completion status:', error);
      
      // Check if it's a rate limit error
      if (errorMessage.includes('429')) {
        toast({
          title: "Slow down!",
          description: "You're clicking too fast. Your tasks are safe - just wait a moment.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update the task. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const toggleTaskComplete = (taskId: string) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;
    
    toggleTaskMutation.mutate({ 
      taskId, 
      completed: !taskToUpdate.completed 
    });
  };

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      console.log('Attempting to delete task with ID:', taskId);
      try {
        const response = await apiRequest("DELETE", `/api/tasks/${taskId}`, null);
        console.log('Delete task response:', response.status, response.statusText);
        
        // Check response status code to handle specific errors
        if (!response.ok) {
          console.error(`Bad delete response: ${response.status} ${response.statusText}`);
          
          // Try to get error details if available
          let errorText = '';
          try {
            errorText = await response.text();
            console.error('Error data:', errorText);
          } catch (e) {
            console.error('Could not read error response body');
          }
          
          throw new Error(`Delete request failed: ${response.status} ${response.statusText} ${errorText}`);
        }
        
        return response;
      } catch (error) {
        console.error('Error in delete task mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Task deleted successfully');
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      console.error('Failed to delete task:', error);
      toast({
        title: "Error",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string, updates: Partial<Task> }) => {
      return await apiRequest("PATCH", `/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
      toast({
        title: "Error",
        description: "Failed to update the task. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ taskId, updates });
  };

  // Reorder tasks mutation
  const reorderTasksMutation = useMutation({
    mutationFn: async (reorderedTasks: Task[]) => {
      // Create array of task orders for bulk update
      const taskOrders = reorderedTasks.map((task, index) => ({
        id: task.id,
        displayOrder: index
      }));
      
      console.log('Sending reorder request:', taskOrders);
      
      const response = await apiRequest("PATCH", "/api/tasks/reorder", { taskOrders });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Reorder failed: ${response.status} ${errorData}`);
      }
      
      return reorderedTasks;
    },
    onSuccess: () => {
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      console.log('Tasks reordered successfully');
    },
    onError: (error) => {
      console.error('Failed to reorder tasks:', error);
      toast({
        title: "Error",
        description: "Failed to reorder tasks. Please try again.",
        variant: "destructive",
      });
      // Refetch to restore correct order
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  const reorderTasks = (reorderedTasks: Task[]) => {
    reorderTasksMutation.mutate(reorderedTasks);
  };

  return {
    tasks,
    loading,
    addTask,
    createTask,
    toggleTaskComplete,
    updateTask,
    deleteTask,
    reorderTasks,
    archiveTask,
  };
}