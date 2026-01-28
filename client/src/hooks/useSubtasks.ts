import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Task } from '@shared/schema';

export function useSubtasks(mainTaskId: string) {
  const queryClient = useQueryClient();

  // Fetch subtasks for a main task
  const { data: subtasks = [], isLoading, error } = useQuery({
    queryKey: ['/api/tasks/subtasks', mainTaskId],
    enabled: !!mainTaskId,
  });

  // Add subtask mutation
  const addSubtaskMutation = useMutation({
    mutationFn: async (subtaskData: Partial<Task>) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subtaskData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/subtasks', mainTaskId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Update subtask mutation
  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, updates }: { subtaskId: string; updates: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/subtasks', mainTaskId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Delete subtask mutation
  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      const response = await fetch(`/api/tasks/${subtaskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/subtasks', mainTaskId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Toggle subtask completion
  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) => {
      const response = await fetch(`/api/tasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          completed, 
          completedAt: completed ? new Date().toISOString() : null 
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/subtasks', mainTaskId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  return {
    subtasks,
    isLoading,
    error,
    addSubtask: addSubtaskMutation.mutate,
    updateSubtask: updateSubtaskMutation.mutate,
    deleteSubtask: deleteSubtaskMutation.mutate,
    toggleSubtask: toggleSubtaskMutation.mutate,
    isAddingSubtask: addSubtaskMutation.isPending,
    isUpdatingSubtask: updateSubtaskMutation.isPending,
    isDeletingSubtask: deleteSubtaskMutation.isPending,
    isTogglingSubtask: toggleSubtaskMutation.isPending,
  };
}