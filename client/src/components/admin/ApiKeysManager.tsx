import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Save, RefreshCw } from "lucide-react";

interface ApiKey {
  name: string;
  value: string;
  isSecret: boolean;
}

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch keys from server
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/admin/keys');
        const data = await response.json();
        setKeys(data.keys);
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
        toast({
          title: 'Error',
          description: 'Failed to load API keys. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeys();
  }, []); // Empty dependency array - only run once on mount

  const handleSaveKey = async (name: string, value: string) => {
    try {
      setIsLoading(true);
      console.log('Saving API key:', { name, valueLength: value?.length || 0 });
      
      const response = await apiRequest('POST', '/api/admin/keys', { 
        name, value  // Send as name/value object as backend expects
      });
      
      console.log('Save response:', response);
      
      toast({
        title: 'Success',
        description: `${name} has been saved successfully.`,
      });
      
      // Update the key in the local state
      setKeys(keys.map(key => 
        key.name === name ? { ...key, value } : key
      ));
      
      // No need to refetch from server immediately - local state is updated
      
    } catch (error) {
      console.error('Failed to save API key:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save API key. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleKeyVisibility = (name: string) => {
    setVisibleKeys({
      ...visibleKeys,
      [name]: !visibleKeys[name]
    });
  };

  // Mock data for UI development until the backend is implemented
  useEffect(() => {
    if (keys.length === 0 && !isLoading) {
      setKeys([
        { name: 'STRIPE_SECRET_KEY', value: '', isSecret: true },
        { name: 'VITE_STRIPE_PUBLIC_KEY', value: '', isSecret: false },
      ]);
    }
  }, [keys, isLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys Management</CardTitle>
        <CardDescription>
          Manage API keys for various integrations. Secret keys are stored securely and never exposed in client code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stripe" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stripe">
            <div className="space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="stripe-secret-key">Secret Key (Server-only)</Label>
                <div className="flex gap-2">
                  <Input
                    id="stripe-secret-key"
                    type={visibleKeys['STRIPE_SECRET_KEY'] ? 'text' : 'password'}
                    placeholder="sk_test_..."
                    value={keys.find(k => k.name === 'STRIPE_SECRET_KEY')?.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setKeys(keys.map(key => 
                        key.name === 'STRIPE_SECRET_KEY' ? { ...key, value } : key
                      ));
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => toggleKeyVisibility('STRIPE_SECRET_KEY')}
                  >
                    {visibleKeys['STRIPE_SECRET_KEY'] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => handleSaveKey('STRIPE_SECRET_KEY', keys.find(k => k.name === 'STRIPE_SECRET_KEY')?.value || '')}
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This key is stored securely on the server and used for backend operations.
                </p>
              </div>
              
              <div className="grid w-full gap-1.5">
                <Label htmlFor="stripe-public-key">Public Key (Client-side)</Label>
                <div className="flex gap-2">
                  <Input
                    id="stripe-public-key"
                    type={visibleKeys['VITE_STRIPE_PUBLIC_KEY'] ? 'text' : 'password'}
                    placeholder="pk_test_..."
                    value={keys.find(k => k.name === 'VITE_STRIPE_PUBLIC_KEY')?.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setKeys(keys.map(key => 
                        key.name === 'VITE_STRIPE_PUBLIC_KEY' ? { ...key, value } : key
                      ));
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => toggleKeyVisibility('VITE_STRIPE_PUBLIC_KEY')}
                  >
                    {visibleKeys['VITE_STRIPE_PUBLIC_KEY'] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => handleSaveKey('VITE_STRIPE_PUBLIC_KEY', keys.find(k => k.name === 'VITE_STRIPE_PUBLIC_KEY')?.value || '')}
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This key is used in the browser for Stripe Elements and checkout processes.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="other">
            <div className="py-4 text-center text-muted-foreground">
              No other API integrations configured yet.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          API keys last updated: {new Date().toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
}