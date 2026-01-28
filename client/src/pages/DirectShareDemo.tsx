import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTaskManager } from "@/hooks/useTaskManager";
import { DirectTaskShare } from "@/components/DirectTaskShare";
import { SharedTasksInbox } from "@/components/SharedTasksInbox";
import { Users, Share2, Plus, Settings } from "lucide-react";

export function DirectShareDemo() {
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const { tasks } = useTaskManager();

  // Create a demo user for testing
  const createDemoUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter both username and email",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingUser(true);
    
    try {
      // Create demo user via registration endpoint
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUserName.trim(),
          email: newUserEmail.trim(),
          password: 'demo123', // Demo password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      toast({
        title: "Demo User Created",
        description: `User ${newUserName} has been created for testing direct task sharing`,
      });
      
      setNewUserName("");
      setNewUserEmail("");
      
    } catch (error) {
      toast({
        title: "Failed to Create User",
        description: error instanceof Error ? error.message : "Failed to create demo user",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const availableTasks = tasks.filter(task => !task.completed).slice(0, 5);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Direct Task Sharing Demo</h1>
          <p className="text-gray-600">Test the direct task sharing feature between aichecklist.io customers</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demo User Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Demo Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter demo username"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter demo email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={createDemoUser}
                  disabled={isCreatingUser}
                  className="w-full"
                >
                  {isCreatingUser ? "Creating..." : "Create Demo User"}
                </Button>
                
                <Alert>
                  <AlertDescription>
                    Create demo users to test task sharing between different aichecklist.io customers.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Task Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select Task to Share</Label>
                  <div className="space-y-2 mt-2">
                    {availableTasks.length > 0 ? (
                      availableTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTaskId === task.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{task.category}</Badge>
                                <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Alert>
                        <AlertDescription>
                          No tasks available to share. Create some tasks first.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                
                {selectedTaskId && (
                  <div className="pt-4 border-t">
                    <DirectTaskShare
                      taskId={selectedTaskId}
                      taskTitle={availableTasks.find(t => t.id === selectedTaskId)?.title || ""}
                      onClose={() => setSelectedTaskId(null)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Shared Tasks Inbox */}
        <div className="mt-8">
          <SharedTasksInbox />
        </div>
        
        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Test Direct Task Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Create one or more demo users using the form above</li>
              <li>Select a task from your task list to share</li>
              <li>Enter the username or email of the demo user you created</li>
              <li>Add an optional message and click "Share Task"</li>
              <li>The shared task will appear in the recipient's inbox</li>
              <li>Recipients can accept and import shared tasks to their own task list</li>
            </ol>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <h4 className="font-medium">Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Direct user-to-user task sharing</li>
                <li>Optional messages with shared tasks</li>
                <li>Accept/reject shared tasks</li>
                <li>Import shared tasks to your own list</li>
                <li>Real-time notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}