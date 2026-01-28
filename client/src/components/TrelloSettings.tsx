import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, RefreshCw, FileText, ArrowDownToLine, Eye, EyeOff, List } from 'lucide-react';
import { SiTrello } from '@/components/icons/BrandIcons';

interface TrelloBoard {
  id: string;
  name: string;
}

interface TrelloList {
  id: string;
  name: string;
}

interface TrelloCard {
  id: string;
  name: string;
  due?: string;
}

export function TrelloSettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [token, setToken] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedList, setSelectedList] = useState<string>('');

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/trello/status'],
  });

  const { data: boards, isLoading: boardsLoading, refetch: refetchBoards } = useQuery({
    queryKey: ['/api/trello/boards'],
    enabled: status?.connected === true,
  });

  const { data: lists, isLoading: listsLoading, refetch: refetchLists } = useQuery({
    queryKey: ['/api/trello/lists', selectedBoard],
    enabled: status?.connected === true && !!selectedBoard,
  });

  const { data: importableCards, isLoading: cardsLoading, refetch: refetchCards } = useQuery({
    queryKey: ['/api/trello/import-cards', selectedList],
    enabled: status?.connected === true && !!selectedList,
  });

  useEffect(() => {
    if (status?.defaultBoardId) {
      setSelectedBoard(status.defaultBoardId);
    }
    if (status?.defaultListId) {
      setSelectedList(status.defaultListId);
    }
  }, [status?.defaultBoardId, status?.defaultListId]);

  const connectMutation = useMutation({
    mutationFn: async ({ apiKey, token }: { apiKey: string; token: string }) => {
      return apiRequest('/api/trello/connect', {
        method: 'POST',
        body: JSON.stringify({ apiKey, token }),
      });
    },
    onSuccess: () => {
      toast({ title: 'Connected to Trello', description: 'Your Trello account is now linked.' });
      setApiKey('');
      setToken('');
      queryClient.invalidateQueries({ queryKey: ['/api/trello/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trello/boards'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Connection failed', 
        description: error.message || 'Please check your API Key and Token and try again.',
        variant: 'destructive' 
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/trello/disconnect', { method: 'POST' });
    },
    onSuccess: () => {
      toast({ title: 'Disconnected from Trello' });
      setSelectedBoard('');
      setSelectedList('');
      queryClient.invalidateQueries({ queryKey: ['/api/trello/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trello/boards'] });
    },
    onError: () => {
      toast({ title: 'Failed to disconnect', variant: 'destructive' });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async ({ boardId, listId }: { boardId: string; listId: string }) => {
      return apiRequest('/api/trello/set-default', {
        method: 'POST',
        body: JSON.stringify({ boardId, listId }),
      });
    },
    onSuccess: () => {
      toast({ title: 'Default board and list saved' });
      queryClient.invalidateQueries({ queryKey: ['/api/trello/status'] });
    },
    onError: () => {
      toast({ title: 'Failed to save defaults', variant: 'destructive' });
    },
  });

  const importCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      return apiRequest('/api/trello/import-card', {
        method: 'POST',
        body: JSON.stringify({ cardId, listId: selectedList }),
      });
    },
    onSuccess: () => {
      toast({ title: 'Card imported successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      refetchCards();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Import failed', 
        description: error.message || 'Failed to import card',
        variant: 'destructive' 
      });
    },
  });

  const handleConnect = () => {
    if (!apiKey.trim()) {
      toast({ title: 'Please enter your Trello API Key', variant: 'destructive' });
      return;
    }
    if (!token.trim()) {
      toast({ title: 'Please enter your Trello Token', variant: 'destructive' });
      return;
    }
    connectMutation.mutate({ apiKey: apiKey.trim(), token: token.trim() });
  };

  const handleBoardChange = (value: string) => {
    setSelectedBoard(value);
    setSelectedList('');
  };

  const handleListChange = (value: string) => {
    setSelectedList(value);
  };

  const handleSaveDefaults = () => {
    if (selectedBoard && selectedList) {
      setDefaultMutation.mutate({ boardId: selectedBoard, listId: selectedList });
    }
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
            <div className="p-2 bg-[#0079BF] rounded-lg">
              <SiTrello className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>Trello Integration</CardTitle>
              <CardDescription>
                Connect your Trello account to sync tasks between AIChecklist and Trello
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
                    <p className="font-medium text-green-800 dark:text-green-200">Connected to Trello</p>
                    {status.username && (
                      <p className="text-sm text-green-600 dark:text-green-400">@{status.username}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  data-testid="button-disconnect-trello"
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
                <Label>Default Board</Label>
                <p className="text-sm text-muted-foreground">
                  Select the Trello board where tasks will be sent by default
                </p>
                <div className="flex gap-2">
                  <Select 
                    value={selectedBoard} 
                    onValueChange={handleBoardChange}
                    disabled={boardsLoading}
                  >
                    <SelectTrigger className="flex-1" data-testid="select-trello-board">
                      <SelectValue placeholder="Select a board..." />
                    </SelectTrigger>
                    <SelectContent>
                      {boards?.boards?.map((board: TrelloBoard) => (
                        <SelectItem key={board.id} value={board.id}>
                          <div className="flex items-center gap-2">
                            <SiTrello className="h-4 w-4 text-[#0079BF]" />
                            <span>{board.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => refetchBoards()}
                    disabled={boardsLoading}
                    data-testid="button-refresh-boards"
                  >
                    <RefreshCw className={`h-4 w-4 ${boardsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {selectedBoard && (
                <div className="space-y-3">
                  <Label>Default List</Label>
                  <p className="text-sm text-muted-foreground">
                    Select the list within the board where cards will be added
                  </p>
                  <div className="flex gap-2">
                    <Select 
                      value={selectedList} 
                      onValueChange={handleListChange}
                      disabled={listsLoading}
                    >
                      <SelectTrigger className="flex-1" data-testid="select-trello-list">
                        <SelectValue placeholder="Select a list..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lists?.lists?.map((list: TrelloList) => (
                          <SelectItem key={list.id} value={list.id}>
                            <div className="flex items-center gap-2">
                              <List className="h-4 w-4 text-muted-foreground" />
                              <span>{list.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => refetchLists()}
                      disabled={listsLoading}
                      data-testid="button-refresh-lists"
                    >
                      <RefreshCw className={`h-4 w-4 ${listsLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              )}

              {selectedBoard && selectedList && (
                <Button
                  onClick={handleSaveDefaults}
                  disabled={setDefaultMutation.isPending}
                  className="w-full"
                  data-testid="button-save-trello-defaults"
                >
                  {setDefaultMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Default Board & List'
                  )}
                </Button>
              )}

              {selectedList && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Import Cards from Trello</Label>
                      <p className="text-sm text-muted-foreground">
                        Preview and import cards from your selected list
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => refetchCards()}
                      disabled={cardsLoading}
                      data-testid="button-refresh-cards"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${cardsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  {cardsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : importableCards?.cards?.length > 0 ? (
                    <div className="border rounded-lg divide-y dark:divide-gray-700 max-h-64 overflow-y-auto">
                      {importableCards.cards.slice(0, 10).map((card: TrelloCard) => (
                        <div 
                          key={card.id} 
                          className="flex items-center justify-between p-3 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{card.name}</p>
                              {card.due && (
                                <p className="text-xs text-muted-foreground">
                                  Due: {new Date(card.due).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => importCardMutation.mutate(card.id)}
                            disabled={importCardMutation.isPending}
                            data-testid={`button-import-card-${card.id}`}
                          >
                            <ArrowDownToLine className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center p-4">
                      No cards found in this list
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">How to get your Trello API Key and Token:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://trello.com/power-ups/admin" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">trello.com/power-ups/admin</a></li>
                  <li>Create a new Power-Up or use an existing one</li>
                  <li>Copy the API Key from the Power-Up page</li>
                  <li>Click "Generate a Token" link on the same page</li>
                  <li>Authorize the application and copy the generated Token</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trello-api-key">Trello API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="trello-api-key"
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Enter your API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                    data-testid="input-trello-api-key"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                    data-testid="button-toggle-trello-api-key"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trello-token">Trello Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="trello-token"
                    type={showToken ? 'text' : 'password'}
                    placeholder="Enter your Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="flex-1"
                    data-testid="input-trello-token"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowToken(!showToken)}
                    data-testid="button-toggle-trello-token"
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleConnect}
                disabled={connectMutation.isPending || !apiKey.trim() || !token.trim()}
                className="w-full"
                data-testid="button-connect-trello"
              >
                {connectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <SiTrello className="h-4 w-4 mr-2" />
                    Connect to Trello
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What you can do with Trello integration</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Send tasks from AIChecklist to any Trello board
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Import cards from Trello into AIChecklist
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Auto-map task properties (name, due date, description)
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Organize tasks by boards and lists
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
