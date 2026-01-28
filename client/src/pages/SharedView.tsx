import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Network, Trophy, BarChart3, Lock, Eye, Share2, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface SharedData {
  id: string;
  type: 'gantt' | 'pert' | 'combined' | 'achievements';
  data: any;
  description?: string;
  createdAt: string;
  viewCount: number;
}

export default function SharedView() {
  const { shareId } = useParams<{ shareId: string }>();
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSharedData();
  }, [shareId]);

  const loadSharedData = async (passwordAttempt?: string) => {
    if (!shareId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const url = `/api/shares/${shareId}${passwordAttempt ? `?password=${passwordAttempt}` : ''}`;
      const response = await fetch(url);
      
      if (response.status === 401) {
        const data = await response.json();
        if (data.requiresPassword) {
          setRequiresPassword(true);
          setLoading(false);
          return;
        }
      }
      
      if (!response.ok) {
        throw new Error('Share not found or expired');
      }
      
      const data = await response.json();
      setSharedData(data);
      setRequiresPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shared content');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    loadSharedData(password);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gantt': return Calendar;
      case 'pert': return Network;
      case 'achievements': return Trophy;
      default: return BarChart3;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'gantt': return 'Gantt Chart';
      case 'pert': return 'PERT Chart';
      case 'combined': return 'Project Charts';
      case 'achievements': return 'Achievements Dashboard';
      default: return 'Shared Content';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Required
            </CardTitle>
            <CardDescription>
              This shared content is password protected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Enter Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Password"
              />
            </div>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Access Content
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Content Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The shared content you're looking for doesn't exist or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = getTypeIcon(sharedData.type);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">
                      {getTypeLabel(sharedData.type)}
                    </CardTitle>
                    <CardDescription>
                      Shared from AIChecklist
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {sharedData.viewCount} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(sharedData.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              
              {sharedData.description && (
                <div className="mt-4">
                  <p className="text-muted-foreground">{sharedData.description}</p>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Content */}
          <div data-chart-container>
            {sharedData.type === 'achievements' ? (
              <AchievementsDisplay data={sharedData.data} />
            ) : (
              <ChartDisplay type={sharedData.type} data={sharedData.data} />
            )}
          </div>

          {/* Footer */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                  <span>Powered by AIChecklist</span>
                </div>
                <Badge variant="outline">
                  View #{sharedData.viewCount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Component to display different chart types
function ChartDisplay({ type, data }: { type: string; data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared {type.charAt(0).toUpperCase() + type.slice(1)} Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Chart visualization would be rendered here with the shared data</p>
          <p className="text-sm mt-2">Data includes {Object.keys(data).length} properties</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Component to display achievements
function AchievementsDisplay({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50 text-yellow-500" />
          <p>Achievement dashboard would be rendered here with the shared data</p>
          <p className="text-sm mt-2">Progress and milestones visualization</p>
        </div>
      </CardContent>
    </Card>
  );
}