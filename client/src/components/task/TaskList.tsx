import { useState, useEffect } from "react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecks, Search } from "lucide-react";
import TaskItem from "./TaskItem";
import { VoiceCommandButton } from "./VoiceCommandButton";
import { VoiceCommandHelpModal } from "./VoiceCommandHelpModal";
import { VoiceCommandListener } from "./VoiceCommandListener";
import { Task } from "@/types";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface TaskListProps {
  onStartTimer?: (task: any) => void;
  onPauseTimer?: (task: any, currentTimeRemaining?: number) => void;
  onResumeTimer?: (task: any, currentTimeRemaining?: number) => void;
  onStopTimer?: (task: any) => void;
}

export function TaskList({ onStartTimer, onPauseTimer, onResumeTimer, onStopTimer }: TaskListProps = {}) {
  const { tasks, reorderTasks } = useTaskManager();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  
  // Local state for real-time drag reordering
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Update local tasks when server tasks change
  useEffect(() => {
    setLocalTasks(tasks as any);
  }, [tasks]);
  
  // Drag and drop sensors - clean like the example
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTasks = localTasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || task.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // First sort by completion status (incomplete tasks first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then sort by display order within each group
      const aOrder = typeof a.displayOrder === 'number' ? a.displayOrder : 0;
      const bOrder = typeof b.displayOrder === 'number' ? b.displayOrder : 0;
      return aOrder - bOrder;
    });

  // Handle drag start
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  // Handle drag end - clean implementation like the example
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (over && active.id !== over.id) {
      setLocalTasks((items) => {
        const oldIndex = items.findIndex(t => t.id === active.id);
        const newIndex = items.findIndex(t => t.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          // Use arrayMove to reorder
          const reordered = arrayMove(items, oldIndex, newIndex);
          
          // Update display order for each task
          const withUpdatedOrder = reordered.map((task, index) => ({
            ...task,
            displayOrder: index, // Update position for DB sync
          }));
          
          // Persist to server
          reorderTasks(withUpdatedOrder as any);
          
          return withUpdatedOrder;
        }
        
        return items;
      });
    }
  };

  return (
    <>
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium flex items-center">
              <ListChecks className="text-primary text-xl mr-2" />
              <span>My Tasks</span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-background border border-border py-1.5 px-3 text-sm w-40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
              
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="bg-background border border-border py-1.5 px-3 text-sm h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center">
                <VoiceCommandButton className="mr-1" />
                <VoiceCommandHelpModal />
              </div>
            </div>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <div className="space-y-2">
              {filteredTasks.length > 0 ? (
                <SortableContext 
                  items={filteredTasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredTasks.map((task, index) => (
                    <TaskItem 
                      key={task.id}
                      task={task} 
                      isDropTarget={false}
                      onStartTimer={onStartTimer}
                      onPauseTimer={onPauseTimer}
                      onResumeTimer={onResumeTimer}
                      onStopTimer={onStopTimer}
                    />
                  ))}
                </SortableContext>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-muted-foreground">
                  <ListChecks className="h-12 w-12 mb-2" />
                  <p className="text-center">No tasks yet. Add your first task above!</p>
                </div>
              )}
            </div>
          </DndContext>
        </CardContent>
      </Card>
      
      {/* Voice command listener overlay */}
      <VoiceCommandListener isOpen={false} onClose={() => {}} />
    </>
  );
}

export default TaskList;
