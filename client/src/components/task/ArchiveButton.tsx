import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Archive, Loader2 } from "lucide-react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { HoverScale, ButtonPress } from "@/components/animations/MicroAnimations";

// Simple fallback div for MotionDiv
const MotionDiv: React.FC<any> = ({ children, className, ...props }) => (
  <div className={`transition-all duration-200 ${className || ""}`} {...props}>
    {children}
  </div>
);

interface ArchiveButtonProps {
  task: Task;
}

export function ArchiveButton({ task }: ArchiveButtonProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const { archiveTask } = useTaskManager();
  const { toast } = useToast();

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      await archiveTask(task.id);
      
      toast({
        title: "Task Archived",
        description: `"${task.title}" has been archived successfully.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Archive Failed",
        description: "There was an error archiving the task. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsArchiving(false);
    }
  };

  // Only show archive button for completed tasks
  if (!task.completed) {
    return null;
  }

  return (
    <HoverScale>
      <ButtonPress>
        <MotionDiv
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchive}
            disabled={isArchiving}
            className="h-8 px-2 text-xs hover:bg-muted/80 transition-colors"
            title="Archive completed task"
          >
            {isArchiving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Archive className="h-3 w-3" />
            )}
            <span className="ml-1">Archive</span>
          </Button>
        </MotionDiv>
      </ButtonPress>
    </HoverScale>
  );
}