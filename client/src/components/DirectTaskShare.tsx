import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Share2, User, MessageCircle, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface DirectTaskShareProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

export function DirectTaskShare({ taskId, taskTitle, onClose }: DirectTaskShareProps) {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [sharedWith, setSharedWith] = useState('');
  const { toast } = useToast();

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to share with",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/share-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          message: message.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to share task');
      }

      const result = await response.json();
      
      setShareSuccess(true);
      setSharedWith(result.sharedWith);
      
      toast({
        title: "Task Shared Successfully",
        description: `Task "${taskTitle}" has been shared with ${result.sharedWith}`,
      });
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Sharing Failed",
        description: error instanceof Error ? error.message : "Failed to share task",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (shareSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Task Shared Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Task "{taskTitle}" has been shared with {sharedWith}. 
              They will receive a notification and can import the task to their list.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={onClose} 
            className="w-full mt-4"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share Task with User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <Label htmlFor="task-title">Task to Share</Label>
            <Input
              id="task-title"
              value={taskTitle}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Username or Email
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isSharing}
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a message for the recipient..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSharing}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSharing}
              className="flex-1"
            >
              {isSharing ? "Sharing..." : "Share Task"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSharing}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}