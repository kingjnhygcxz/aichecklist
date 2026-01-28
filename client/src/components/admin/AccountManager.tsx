import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UserX, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export function AccountManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVerification, setPasswordVerification] = useState('');
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search for users
  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a username or email to search.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      const data = await response.json();
      setUsers(data.users || []);
      
      if (data.users?.length === 0) {
        toast({
          title: "No Users Found",
          description: "No users match your search criteria.",
        });
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search for users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Close account mutation
  const closeAccountMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: number; password: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/close-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to close account');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Account Closed",
        description: `User account has been successfully closed. ${data.deletedRecords} records removed.`,
      });
      setUsers(users.filter(user => user.id !== selectedUser?.id));
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      console.error('Error closing account:', error);
      toast({
        title: "Failed to Close Account",
        description: "An error occurred while closing the account. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCloseAccount = () => {
    if (!passwordVerification.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the user's password to confirm account closure.",
        variant: "destructive"
      });
      return;
    }
    
    if (!emailConfirmation.trim()) {
      toast({
        title: "Email Confirmation Required",
        description: "Please enter the user's email address to confirm account closure.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedUser && emailConfirmation.toLowerCase() !== selectedUser.email.toLowerCase()) {
      toast({
        title: "Email Mismatch",
        description: "The entered email does not match the user's email address.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedUser) {
      closeAccountMutation.mutate({ 
        userId: selectedUser.id, 
        password: passwordVerification 
      });
      setPasswordVerification(''); // Clear password after attempt
      setEmailConfirmation(''); // Clear email after attempt
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Account Management
          </CardTitle>
          <CardDescription>
            Search for user accounts and manage account closures. Use with extreme caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Search by Username or Email</Label>
              <Input
                id="search"
                type="text"
                placeholder="Enter username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchUsers} disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {users.length > 0 && (
            <div className="space-y-2">
              <Label>Search Results</Label>
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 ${
                      selectedUser?.id === user.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                      {user.lastLoginAt && (
                        <span className="ml-3">
                          Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedUser && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Selected Account</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <div><strong>Username:</strong> {selectedUser.username}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    {selectedUser.firstName && (
                      <div><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</div>
                    )}
                    <div><strong>Account ID:</strong> {selectedUser.id}</div>
                    <div><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
                    {selectedUser.lastLoginAt && (
                      <div><strong>Last Login:</strong> {new Date(selectedUser.lastLoginAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                <div className="border border-destructive/20 bg-destructive/5 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Closing an account will permanently delete all user data including tasks, achievements, 
                    statistics, and personal information. This action cannot be undone.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Close Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Close User Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you absolutely sure you want to close the account for <strong>{selectedUser.username}</strong> ({selectedUser.email})?
                          
                          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded">
                            <p className="text-sm font-medium text-destructive mb-2">This will permanently delete:</p>
                            <ul className="text-sm text-destructive space-y-1">
                              <li>• All user tasks and categories</li>
                              <li>• Achievement progress and history</li>
                              <li>• User statistics and analytics</li>
                              <li>• Personal information and preferences</li>
                              <li>• Shared tasks and collaborations</li>
                              <li>• Account login credentials</li>
                            </ul>
                          </div>
                          
                          <p className="mt-3 text-sm">
                            <strong>This action cannot be undone.</strong> The user will be immediately logged out 
                            and will not be able to access their account or data.
                          </p>
                          
                          <div className="mt-4 space-y-3">
                            <div>
                              <Label htmlFor="password-verification" className="text-sm font-medium">
                                Enter User's Current Password
                              </Label>
                              <Input
                                id="password-verification"
                                type="password"
                                placeholder="User's password..."
                                value={passwordVerification}
                                onChange={(e) => setPasswordVerification(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="email-confirmation" className="text-sm font-medium">
                                Confirm User's Email Address
                              </Label>
                              <Input
                                id="email-confirmation"
                                type="email"
                                placeholder={`Type: ${selectedUser.email}`}
                                value={emailConfirmation}
                                onChange={(e) => setEmailConfirmation(e.target.value)}
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Type the exact email address to confirm
                              </p>
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setPasswordVerification('');
                          setEmailConfirmation('');
                        }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCloseAccount}
                          disabled={closeAccountMutation.isPending || !passwordVerification.trim() || !emailConfirmation.trim()}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {closeAccountMutation.isPending ? 'Closing Account...' : 'Yes, Close Account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}