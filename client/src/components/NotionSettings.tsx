import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, ExternalLink, Database, RefreshCw, FileText, ArrowDownToLine } from 'lucide-react';
import { SiNotion } from '@/components/icons/BrandIcons';

interface NotionDatabase {
  id: string;
  title: string;
  icon?: string;
}

interface NotionTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export function NotionSettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/notion/status'],
  });

  const { data: databases, isLoading: databasesLoading, refetch: refetchDatabases } = useQuery({
    queryKey: ['/api/notion/databases'],
    enabled: status?.connected === true,
  });

  const { data: importableTasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['/api/notion/import-tasks', selectedDatabase],
    enabled: status?.connected === true && !!selectedDatabase,
  });

  useEffect(() => {
    if (status?.defaultDatabaseId) {
      setSelectedDatabase(status.defaultDatabaseId);
    }
  }, [status?.defaultDatabaseId]);

  const connectMutation = useMutation({
    mutationFn: async (key: string) => {
      return apiRequest('/api/notion/connect', {
        method: 'POST',
        body: JSON.stringify({ apiKey: key }),
      });
    },
    onSuccess: () => {
      toast({ title: 'Connected to Notion', description: 'Your Notion workspace is now linked.' });
      setApiKey('');
      queryClient.invalidateQueries({ queryKey: ['/api/notion/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notion/databases'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Connection failed', 
        description: error.message || 'Please check your API key and try again.',
        variant: 'destructive' 
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/notion/disconnect', { method: 'POST' });
    },
    onSuccess: () => {
      toast({ title: 'Disconnected from Notion' });
      setSelectedDatabase('');
      queryClient.invalidateQueries({ queryKey: ['/api/notion/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notion/databases'] });
    },
    onError: () => {
      toast({ title: 'Failed to disconnect', variant: 'destructive' });
    },
  });

  const setDefaultDatabaseMutation = useMutation({
    mutationFn: async (databaseId: string) => {
      return apiRequest('/api/notion/set-default-database', {
        method: 'POST',
        body: JSON.stringify({ databaseId }),
      });
    },
    onSuccess: () => {
      toast({ title: 'Default database updated' });
      queryClient.invalidateQueries({ queryKey: ['/api/notion/status'] });
    },
    onError: () => {
      toast({ title: 'Failed to update default database', variant: 'destructive' });
    },
  });

  const importTaskMutation = useMutation({
    mutationFn: async (notionPageId: string) => {
      return apiRequest('/api/notion/import-task', {
        method: 'POST',
        body: JSON.stringify({ notionPageId, databaseId: selectedDatabase }),
      });
    },
    onSuccess: () => {
      toast({ title: 'Task imported successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      refetchTasks();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Import failed', 
        description: error.message || 'Failed to import task',
        variant: 'destructive' 
      });
    },
  });

  const handleConnect = () => {
    if (!apiKey.trim()) {
      toast({ title: 'Please enter your Notion API key', variant: 'destructive' });
      return;
    }
    connectMutation.mutate(apiKey.trim());
  };

  const handleDatabaseChange = (value: string) => {
    setSelectedDatabase(value);
    setDefaultDatabaseMutation.mutate(value);
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black dark:bg-white rounded-lg">
              <SiNotion className="h-6 w-6 text-white dark:text-black" />
            </div>
            <div>
              <CardTitle>Notion Integration</CardTitle>
              <CardDescription>
                Connect your Notion workspace to sync tasks between AIChecklist and Notion
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status?.connected ? (
            <>
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Connected to Notion</p>
                    {status.workspaceName && (
                      <p className="text-sm text-green-600 dark:text-green-400">{status.workspaceName}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  data-testid="button-disconnect-notion"
                >
                  {disconnectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Disconnect
                </Button>
              </div>

              <div className="space-y-3">
                <Label>Default Database</Label>
                <p className="text-sm text-muted-foreground">
                  Select the Notion database where tasks will be sent by default
                </p>
                <div className="flex gap-2">
                  <Select 
                    value={selectedDatabase} 
                    onValueChange={handleDatabaseChange}
                    disabled={databasesLoading}
                  >
                    <SelectTrigger className="flex-1" data-testid="select-notion-database">
                      <SelectValue placeholder="Select a database..." />
                    </SelectTrigger>
                    <SelectContent>
                      {databases?.databases?.map((db: NotionDatabase) => (
                        <SelectItem key={db.id} value={db.id}>
                          <div className="flex items-center gap-2">
                            {db.icon && <span>{db.icon}</span>}
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span>{db.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => refetchDatabases()}
                    disabled={databasesLoading}
                    data-testid="button-refresh-databases"
                  >
                    <RefreshCw className={`h-4 w-4 ${databasesLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {selectedDatabase && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Import Tasks from Notion</Label>
                      <p className="text-sm text-muted-foreground">
                        Preview and import tasks from your selected database
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => refetchTasks()}
                      disabled={tasksLoading}
                      data-testid="button-refresh-tasks"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${tasksLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  {tasksLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : importableTasks?.tasks?.length > 0 ? (
                    <div className="border rounded-lg divide-y dark:divide-gray-700 max-h-64 overflow-y-auto">
                      {importableTasks.tasks.slice(0, 10).map((task: NotionTask) => (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between p-3 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{task.title}</p>
                              {task.dueDate && (
                                <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                              )}
                            </div>
                            {task.completed && (
                              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                                Done
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => importTaskMutation.mutate(task.id)}
                            disabled={importTaskMutation.isPending}
                            data-testid={`button-import-task-${task.id}`}
                          >
                            <ArrowDownToLine className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">
                      No tasks found in this database
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">How to get your Notion API key:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">notion.so/my-integrations</a></li>
                  <li>Click "New integration" and give it a name (e.g., "AIChecklist")</li>
                  <li>Copy the "Internal Integration Secret"</li>
                  <li>In Notion, open the database you want to sync</li>
                  <li>Click "..." → "Add connections" → Select your integration</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notion-api-key">Notion Integration Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="notion-api-key"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="secret_xxxxxxxxxxxxxxxxxx"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                    data-testid="input-notion-api-key"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                    data-testid="button-toggle-api-key"
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleConnect}
                disabled={connectMutation.isPending || !apiKey.trim()}
                className="w-full"
                data-testid="button-connect-notion"
              >
                {connectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <SiNotion className="h-4 w-4 mr-2" />
                    Connect to Notion
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What you can do with Notion integration</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Send tasks from AIChecklist to any Notion database
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Import tasks from Notion into AIChecklist
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Auto-map task properties (title, status, due date, priority)
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Include task notes and metadata in Notion pages
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
