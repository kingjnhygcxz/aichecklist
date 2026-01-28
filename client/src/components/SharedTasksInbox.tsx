import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Inbox, User, MessageCircle, CheckCircle, Download, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { DirectTaskShare } from '@shared/schema';

interface SharedTasksInboxProps {
  onTaskImported?: () => void;
}

export function SharedTasksInbox({ onTaskImported }: SharedTasksInboxProps) {
  const [processingShareId, setProcessingShareId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch shared tasks for current user
  const { data: sharedTasks, isLoading, error } = useQuery<DirectTaskShare[]>({
    queryKey: ['/api/direct-shares'],
    refetchInterval: document.hasFocus() && document.visibilityState === 'visible' ? 30000 : false, // Only refresh when app is actively being used
    refetchIntervalInBackground: false,
  });

  const handleAcceptShare = async (shareId: number) => {
    setProcessingShareId(shareId);
    
    try {
      const response = await fetch(`/api/direct-shares/${shareId}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept share');
      }

      toast({
        title: "Share Accepted",
        description: "Task share has been accepted. You can now import it to your task list.",
      });
      
      // Refresh the shared tasks list
      queryClient.invalidateQueries({ queryKey: ['/api/direct-shares'] });
      
    } catch (error) {
      toast({
        title: "Failed to Accept Share",
        description: error instanceof Error ? error.message : "Failed to accept share",
        variant: "destructive",
      });
    } finally {
      setProcessingShareId(null);
    }
  };

  const handleImportTask = async (shareId: number) => {
    setProcessingShareId(shareId);
    
    try {
      const response = await fetch(`/api/direct-shares/${shareId}/import`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import task');
      }

      const importedTask = await response.json();
      
      toast({
        title: "Task Imported",
        description: `Task "${importedTask.title}" has been added to your task list.`,
      });
      
      // Refresh the shared tasks list and main tasks
      queryClient.invalidateQueries({ queryKey: ['/api/direct-shares'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      if (onTaskImported) {
        onTaskImported();
      }
      
    } catch (error) {
      toast({
        title: "Failed to Import Task",
        description: error instanceof Error ? error.message : "Failed to import task",
        variant: "destructive",
      });
    } finally {
      setProcessingShareId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Shared Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading shared tasks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Shared Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load shared tasks. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!sharedTasks || sharedTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Shared Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No shared tasks yet</p>
            <p className="text-sm text-gray-500 mt-1">
              When other users share tasks with you, they'll appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="w-5 h-5" />
          Shared Tasks
          <Badge variant="secondary">{sharedTasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 overflow-y-auto pr-2 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
          <div className="space-y-4">
            {sharedTasks.map((share) => (
            <div key={share.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{share.taskData.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>From: {share.sharedWithUsername}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{share.taskData.category}</Badge>
                  <Badge 
                    variant={share.taskData.priority === 'High' ? 'destructive' : 
                            share.taskData.priority === 'Medium' ? 'default' : 'secondary'}
                  >
                    {share.taskData.priority}
                  </Badge>
                </div>
              </div>
              
              {share.message && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <MessageCircle className="w-4 h-4" />
                    Message:
                  </div>
                  <p className="text-sm bg-gray-50 p-2 rounded">{share.message}</p>
                </div>
              )}
              
              <Separator className="my-3" />
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Shared: {new Date(share.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  {!share.isAccepted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcceptShare(share.id)}
                      disabled={processingShareId === share.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {processingShareId === share.id ? "Accepting..." : "Accept"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleImportTask(share.id)}
                      disabled={processingShareId === share.id}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {processingShareId === share.id ? "Importing..." : "Import"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}