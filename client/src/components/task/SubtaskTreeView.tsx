import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Check,
  Circle,
  Minus,
  Trash2
} from 'lucide-react';
import type { Task } from '@shared/schema';

interface SubtaskTreeViewProps {
  parentTask: Task;
  subtasks: Task[];
  onAddSubtask: (parentId: string, title: string, nestingLevel: number) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onToggleExpanded: (taskId: string, expanded: boolean) => void;
  className?: string;
}

interface SubtaskNodeProps {
  task: Task;
  subtasks: Task[];
  nestingLevel: number;
  onAddSubtask: (parentId: string, title: string, nestingLevel: number) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onToggleExpanded: (taskId: string, expanded: boolean) => void;
}

function SubtaskNode({ 
  task, 
  subtasks, 
  nestingLevel,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onToggleExpanded
}: SubtaskNodeProps) {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const childSubtasks = subtasks.filter(st => st.parentId === task.id);
  const hasChildren = childSubtasks.length > 0;
  const isExpanded = task.isExpanded ?? true;
  const indentLevel = nestingLevel * 24; // 24px per level

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim(), nestingLevel + 1);
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask();
    } else if (e.key === 'Escape') {
      setIsAddingSubtask(false);
      setNewSubtaskTitle('');
    }
  };

  return (
    <div className="relative">
      {/* Task Row */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "group flex items-center py-1 pr-4 rounded-md hover:bg-accent/50 transition-colors",
          "min-h-[36px]", // Consistent height for touch targets
          task.completed && "opacity-60"
        )}
        style={{ paddingLeft: `${12 + indentLevel}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent/70"
            onClick={() => onToggleExpanded(task.id, !isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        
        {/* Spacer for tasks without children */}
        {!hasChildren && <div className="w-6" />}

        {/* Completion Checkbox */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-1 hover:bg-accent/70"
          onClick={() => onToggleSubtask(task.id, !task.completed)}
        >
          {task.completed ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

        {/* Task Title */}
        <span 
          className={cn(
            "flex-1 ml-3 text-sm",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </span>

        {/* Action Buttons (shown on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent/70"
            onClick={() => setIsAddingSubtask(true)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          
          {nestingLevel > 0 && ( // Don't allow deleting top-level tasks
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-destructive/70 hover:text-destructive-foreground"
              onClick={() => onDeleteSubtask(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Add Subtask Input */}
      <AnimatePresence>
        {isAddingSubtask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            style={{ paddingLeft: `${36 + indentLevel}px` }}
          >
            <div className="flex items-center gap-2 py-2 pr-4">
              <Input
                autoFocus
                placeholder="Add a subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-sm h-8"
              />
              <Button
                size="sm"
                onClick={handleAddSubtask}
                className="h-8 px-3"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingSubtask(false);
                  setNewSubtaskTitle('');
                }}
                className="h-8 px-3"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Child Subtasks */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {childSubtasks
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((subtask) => (
                <SubtaskNode
                  key={subtask.id}
                  task={subtask}
                  subtasks={subtasks}
                  nestingLevel={nestingLevel + 1}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  onToggleExpanded={onToggleExpanded}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SubtaskTreeView({
  parentTask,
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onToggleExpanded,
  className
}: SubtaskTreeViewProps) {
  const [isAddingRootSubtask, setIsAddingRootSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddRootSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(parentTask.id, newSubtaskTitle.trim(), 1);
      setNewSubtaskTitle('');
      setIsAddingRootSubtask(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddRootSubtask();
    } else if (e.key === 'Escape') {
      setIsAddingRootSubtask(false);
      setNewSubtaskTitle('');
    }
  };

  const rootSubtasks = subtasks.filter(st => st.parentId === parentTask.id);

  return (
    <div className={cn("space-y-1", className)}>
      {/* Root Subtasks */}
      {rootSubtasks
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((subtask) => (
          <SubtaskNode
            key={subtask.id}
            task={subtask}
            subtasks={subtasks}
            nestingLevel={1}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onToggleExpanded={onToggleExpanded}
          />
        ))}

      {/* Add Root Subtask */}
      <AnimatePresence>
        {isAddingRootSubtask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pl-9"
          >
            <div className="flex items-center gap-2 py-2">
              <Input
                autoFocus
                placeholder="Add a subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-sm h-8"
              />
              <Button
                size="sm"
                onClick={handleAddRootSubtask}
                className="h-8 px-3"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingRootSubtask(false);
                  setNewSubtaskTitle('');
                }}
                className="h-8 px-3"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Subtask Button */}
      {!isAddingRootSubtask && (
        <div className="pl-9">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingRootSubtask(true)}
            className="h-8 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3 mr-2" />
            Add subtask
          </Button>
        </div>
      )}
    </div>
  );
}