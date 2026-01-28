import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyProtectionProps {
  onPasswordCorrect: () => void;
}

export function ApiKeyProtection({ onPasswordCorrect }: ApiKeyProtectionProps) {
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      // Verify admin access with backend
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('/api/admin/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionId ? `Bearer ${sessionId}` : '',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        toast({
          title: "Access Granted",
          description: "API keys management is now available.",
          duration: 3000,
        });
        onPasswordCorrect();
      } else {
        setAttempts(prev => prev + 1);
        toast({
          title: "Access Denied",
          description: "Incorrect password or insufficient privileges.",
          variant: "destructive",
          duration: 3000,
        });
        setPassword("");
        
        if (attempts >= 2) {
          toast({
            title: "Security Notice",
            description: "Multiple failed attempts detected. Please contact administrator.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to verify access. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys Management
        </CardTitle>
        <CardDescription>
          This area requires administrative access. Please enter the access password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            API keys are sensitive information. Only authorized administrators should access this area.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiPassword">Access Password</Label>
            <Input
              id="apiPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter 14-character access password"
              maxLength={14}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Access API Management"}
          </Button>
        </form>
        
        {attempts > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Failed attempts: {attempts}/3
          </p>
        )}
      </CardContent>
    </Card>
  );
}