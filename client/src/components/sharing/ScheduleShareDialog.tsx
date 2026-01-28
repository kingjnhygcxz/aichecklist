import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Share2, Users, Calendar, Eye, Edit, Crown, Search, X, Check } from 'lucide-react';
import type { Task, ScheduleShare } from '@shared/schema';

interface ScheduleShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledTasks: Task[];
}

interface UserSearchResult {
  id: number;
  username: string;
  email: string | null;
}

export function ScheduleShareDialog({ isOpen, onClose, scheduledTasks }: ScheduleShareDialogProps) {
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit' | 'full'>('view');
  const [shareType, setShareType] = useState<'full' | 'selective'>('full');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myShares = [], isLoading: loadingMyShares } = useQuery<ScheduleShare[]>({
    queryKey: ['/api/schedule-shares/my-shares'],
    enabled: isOpen,
  });

  const { data: sharedWithMe = [], isLoading: loadingSharedWithMe } = useQuery<any[]>({
    queryKey: ['/api/schedule-shares/shared-with-me'],
    enabled: isOpen,
  });

  const { data: searchResults = [], isLoading: searchingUsers } = useQuery<UserSearchResult[]>({
    queryKey: ['/api/schedule-shares/search-users', searchQuery],
    enabled: searchQuery.length >= 2,
  });

  const shareMutation = useMutation({
    mutationFn: async (data: {
      recipientIdentifier: string;
      permission: string;
      shareType: string;
      selectedTaskIds: string[] | null;
      message: string | null;
    }) => {
      const response = await apiRequest('POST', '/api/schedule-shares/create', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Schedule Shared!",
        description: data.message || `Your schedule has been shared successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-shares/my-shares'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-shares/shared-with-me'] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Share",
        description: error.message || "Failed to share schedule",
        variant: "destructive",
      });
    }
  });

  const handleShare = async () => {
    if (!recipientIdentifier.trim()) {
      toast({
        title: "Recipient Required",
        description: "Please enter a username or email to share with.",
        variant: "destructive",
      });
      return;
    }

    if (shareType === 'selective' && selectedTaskIds.length === 0) {
      toast({
        title: "No Appointments Selected",
        description: "Please select at least one appointment to share.",
        variant: "destructive",
      });
      return;
    }

    shareMutation.mutate({
      recipientIdentifier: recipientIdentifier.trim(),
      permission,
      shareType,
      selectedTaskIds: shareType === 'selective' ? selectedTaskIds : null,
      message: message.trim() || null,
    });
  };

  const removeMutation = useMutation({
    mutationFn: async (shareId: number) => {
      await apiRequest('DELETE', `/api/schedule-shares/${shareId}`);
    },
    onSuccess: () => {
      toast({
        title: "Share Removed",
        description: "The schedule share has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-shares/my-shares'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-shares/shared-with-me'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove share",
        variant: "destructive",
      });
    }
  });

  const handleRemoveShare = (shareId: number) => {
    removeMutation.mutate(shareId);
  };

  const acceptMutation = useMutation({
    mutationFn: async (shareId: number) => {
      const response = await apiRequest('POST', `/api/schedule-shares/accept/${shareId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Share Accepted",
        description: "You can now view this shared schedule.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-shares/shared-with-me'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept share",
        variant: "destructive",
      });
    }
  });

  const declineMutation = useMutation({
    mutationFn: async (shareId: number) => {
      const response = await apiRequest('POST', `/api/schedule-shares/decline/${shareId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Share Declined",
        description: "The share request has been declined.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-shares/shared-with-me'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to decline share",
        variant: "destructive",
      });
    }
  });

  const handleAcceptShare = (shareId: number) => {
    acceptMutation.mutate(shareId);
  };

  const handleDeclineShare = (shareId: number) => {
    declineMutation.mutate(shareId);
  };

  const resetForm = () => {
    setRecipientIdentifier('');
    setPermission('view');
    setShareType('full');
    setSelectedTaskIds([]);
    setMessage('');
    setSearchQuery('');
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getPermissionIcon = (perm: string) => {
    switch (perm) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'edit': return <Edit className="w-4 h-4" />;
      case 'full': return <Crown className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPermissionLabel = (perm: string) => {
    switch (perm) {
      case 'view': return 'View Only';
      case 'edit': return 'Can Edit';
      case 'full': return 'Full Access';
      default: return perm;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Schedule Sharing
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share" className="flex items-center gap-1" data-testid="tab-share">
              <Share2 className="w-4 h-4" />
              Share
            </TabsTrigger>
            <TabsTrigger value="my-shares" className="flex items-center gap-1" data-testid="tab-my-shares">
              <Users className="w-4 h-4" />
              My Shares
              {myShares.length > 0 && <Badge variant="secondary" className="ml-1">{myShares.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="shared-with-me" className="flex items-center gap-1" data-testid="tab-shared-with-me">
              <Calendar className="w-4 h-4" />
              Shared With Me
              {sharedWithMe.length > 0 && <Badge variant="secondary" className="ml-1">{sharedWithMe.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="mt-4">
            <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Share with (Username or Email)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="recipient"
                  placeholder="Enter AIChecklist username or email"
                  value={recipientIdentifier}
                  onChange={(e) => {
                    setRecipientIdentifier(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  className="pl-10"
                  data-testid="input-recipient"
                />
              </div>
              {searchResults.length > 0 && searchQuery.length >= 2 && (
                <div className="border rounded-md p-2 space-y-1 bg-background">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setRecipientIdentifier(user.username);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 hover:bg-accent rounded flex items-center justify-between"
                      data-testid={`user-result-${user.id}`}
                    >
                      <span className="font-medium">{user.username}</span>
                      {user.email && <span className="text-sm text-muted-foreground">{user.email}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Permission Level</Label>
              <RadioGroup value={permission} onValueChange={(v) => setPermission(v as any)} className="space-y-2">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="view" id="perm-view" data-testid="radio-view" />
                  <Label htmlFor="perm-view" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium">View Only</div>
                      <div className="text-xs text-muted-foreground">Can see your schedule but cannot make changes</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="edit" id="perm-edit" data-testid="radio-edit" />
                  <Label htmlFor="perm-edit" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Edit className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="font-medium">Can Edit</div>
                      <div className="text-xs text-muted-foreground">Can add and modify appointments on your schedule</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="full" id="perm-full" data-testid="radio-full" />
                  <Label htmlFor="perm-full" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Crown className="w-4 h-4 text-purple-500" />
                    <div>
                      <div className="font-medium">Full Access</div>
                      <div className="text-xs text-muted-foreground">Can add, edit, and delete appointments</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Share Type</Label>
              <RadioGroup value={shareType} onValueChange={(v) => setShareType(v as any)} className="space-y-2">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="full" id="type-full" data-testid="radio-type-full" />
                  <Label htmlFor="type-full" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-medium">Full Schedule</div>
                      <div className="text-xs text-muted-foreground">Share your entire calendar with all appointments</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="selective" id="type-selective" data-testid="radio-type-selective" />
                  <Label htmlFor="type-selective" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Check className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Selective Sharing</div>
                      <div className="text-xs text-muted-foreground">Choose specific appointments to share</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {shareType === 'selective' && (
              <div className="space-y-2">
                <Label>Select Appointments to Share ({selectedTaskIds.length} selected)</Label>
                <ScrollArea className="h-48 border rounded-md p-2">
                  {scheduledTasks.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No scheduled appointments found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scheduledTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center space-x-3 p-2 border rounded hover:bg-accent/50 cursor-pointer ${
                            selectedTaskIds.includes(task.id) ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => toggleTaskSelection(task.id)}
                          data-testid={`task-select-${task.id}`}
                        >
                          <Checkbox
                            checked={selectedTaskIds.includes(task.id)}
                            onCheckedChange={() => toggleTaskSelection(task.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{task.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {task.scheduledDate && new Date(task.scheduledDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">{task.category}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a message to the recipient..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                data-testid="input-message"
              />
            </div>

            <Button
              onClick={handleShare}
              disabled={shareMutation.isPending || !recipientIdentifier.trim()}
              className="w-full"
              data-testid="button-share"
            >
              {shareMutation.isPending ? 'Sharing...' : 'Share Schedule'}
            </Button>
            </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="my-shares" className="mt-4">
            <ScrollArea className="h-[320px]">
              {loadingMyShares ? (
                <div className="text-center py-8">Loading your shares...</div>
              ) : myShares.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>You haven't shared your schedule with anyone yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myShares.map((share: any) => {
                    const isDeclined = share.declinedAt !== null && share.declinedAt !== undefined;
                    const isAccepted = share.acceptedAt !== null && share.acceptedAt !== undefined;
                    const borderClass = isDeclined 
                      ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' 
                      : isAccepted 
                        ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' 
                        : 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20';
                    
                    return (
                    <div key={share.id} className={`p-4 border rounded-lg space-y-2 ${borderClass}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-violet-600" />
                          <span className="font-medium">{share.sharedWithUsername}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getPermissionIcon(share.permission)}
                          {getPermissionLabel(share.permission)}
                        </Badge>
                        <Badge variant="secondary">
                          {share.shareType === 'full' ? 'Full Schedule' : 'Selective'}
                        </Badge>
                        {isDeclined ? (
                          <Badge className="bg-red-500 text-white">
                            <X className="w-3 h-3 mr-1" />
                            Declined
                          </Badge>
                        ) : isAccepted ? (
                          <Badge className="bg-green-500 text-white">
                            <Check className="w-3 h-3 mr-1" />
                            Accepted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600">
                            Pending Response
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Shared on {new Date(share.createdAt).toLocaleDateString()}
                        {isAccepted && ` • Accepted on ${new Date(share.acceptedAt).toLocaleDateString()}`}
                        {isDeclined && ` • Declined on ${new Date(share.declinedAt).toLocaleDateString()}`}
                      </div>
                      
                      {/* Action buttons for sender */}
                      <div className="flex gap-2 pt-2 border-t">
                        {isDeclined ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleRemoveShare(share.id)}
                            disabled={removeMutation.isPending}
                            data-testid={`dismiss-declined-${share.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Dismiss
                          </Button>
                        ) : isAccepted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveShare(share.id)}
                            disabled={removeMutation.isPending}
                            data-testid={`revoke-share-${share.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Revoke Access
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleRemoveShare(share.id)}
                            disabled={removeMutation.isPending}
                            data-testid={`cancel-share-${share.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="shared-with-me" className="mt-4">
            <ScrollArea className="h-[320px]">
              {loadingSharedWithMe ? (
                <div className="text-center py-8">Loading shared schedules...</div>
              ) : sharedWithMe.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No one has shared their schedule with you yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sharedWithMe.map((share: any) => {
                    const isPending = share.acceptedAt === null || share.acceptedAt === undefined;
                    return (
                    <div key={share.id} className={`p-4 border rounded-lg space-y-3 ${isPending ? 'border-violet-300 bg-violet-50/50 dark:bg-violet-950/20' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-violet-600" />
                          <span className="font-medium">{share.ownerUsername}'s Schedule</span>
                        </div>
                        {isPending && (
                          <Badge variant="outline" className="border-amber-500 text-amber-600">
                            Pending
                          </Badge>
                        )}
                      </div>
                      
                      {share.message && (
                        <div className="text-sm bg-muted p-3 rounded-lg border-l-4 border-violet-400">
                          <p className="text-muted-foreground text-xs mb-1">Message from {share.ownerUsername}:</p>
                          "{share.message}"
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getPermissionIcon(share.permission)}
                          {getPermissionLabel(share.permission)}
                        </Badge>
                        <Badge variant="secondary">
                          {share.shareType === 'full' ? 'Full Schedule' : 'Selective'}
                        </Badge>
                        {!isPending && (
                          <Badge className="bg-green-500 text-white">
                            <Check className="w-3 h-3 mr-1" />
                            Accepted
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Shared on {new Date(share.createdAt).toLocaleDateString()}
                      </div>
                      
                      {isPending ? (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                            onClick={() => handleAcceptShare(share.id)}
                            disabled={acceptMutation.isPending || declineMutation.isPending}
                            data-testid={`accept-share-${share.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDeclineShare(share.id)}
                            disabled={acceptMutation.isPending || declineMutation.isPending}
                            data-testid={`decline-share-${share.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                            onClick={() => window.location.href = `/calendar?shared=${share.id}`}
                            data-testid={`view-shared-${share.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveShare(share.id)}
                            data-testid={`leave-share-${share.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
