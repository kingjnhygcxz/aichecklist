import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Mail, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function LogViewer() {
  const [refreshKey, setRefreshKey] = useState(0);
  const queryClient = useQueryClient();

  // Fetch error logs to check system status - only auto-refresh when tab is active
  const { data: errorLogs, isLoading: errorLogsLoading, error: errorLogsError } = useQuery({
    queryKey: ["/api/logs/errors", refreshKey],
    refetchInterval: document.hasFocus() ? 30000 : false, // Only refresh when page is active
    refetchIntervalInBackground: false,
  });

  // Fetch all logs to get general system health
  const { data: allLogs, isLoading: allLogsLoading } = useQuery({
    queryKey: ["/api/logs", refreshKey],
    refetchInterval: document.hasFocus() ? 30000 : false,
    refetchIntervalInBackground: false,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Status Refreshed",
      description: "Latest system status has been loaded.",
    });
  };

  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/logs/flush-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs/errors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      setRefreshKey(prev => prev + 1);
      toast({
        title: "Logs Cleared",
        description: "All system logs have been cleared. Status reset to clean.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Clear Failed",
        description: "Failed to clear logs. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const getSystemStatus = () => {
    // Check if there are any RECENT errors (last hour only)
    const hasRecentErrors = errorLogs?.logs && (() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const errorLines = (errorLogs as any).logs.split('\n').filter((line: string) => {
        if (!line.trim()) return false;
        const match = line.match(/\[(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})\]/);
        if (match) {
          const logTime = new Date(`${match[1]}T${match[2]}`);
          return logTime > oneHourAgo;
        }
        return false;
      });
      return errorLines.length > 0;
    })();
    
    if (hasRecentErrors) {
      return {
        status: 'error',
        color: 'text-red-500',
        bgColor: 'bg-red-50 border-red-200',
        icon: <XCircle className="w-6 h-6 text-red-500" />,
        title: 'System Issues Detected',
        message: 'Recent errors found - technical support needed'
      };
    }

    return {
      status: 'healthy',
      color: 'text-green-500', 
      bgColor: 'bg-green-50 border-green-200',
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      title: '100% System Working - All Green',
      message: 'All systems operational and clean'
    };
  };

  const getRecentActivity = () => {
    if (!(allLogs as any)?.logs) return 0;
    
    // Count recent activity in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentLines = (allLogs as any).logs.split('\n').filter((line: string) => {
      const match = line.match(/\[(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})\]/);
      if (match) {
        const logTime = new Date(`${match[1]}T${match[2]}`);
        return logTime > tenMinutesAgo;
      }
      return false;
    });
    
    return recentLines.length;
  };

  if (allLogsLoading || errorLogsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Checking System Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (errorLogsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Status Check Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Unable to check system status at this time.
            </p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const systemStatus = getSystemStatus();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">System Status</h2>
          <p className="text-muted-foreground">
            Monitor system health and activity
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Main Status Card */}
      <Card className={`border-2 ${systemStatus.bgColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {systemStatus.icon}
              <div>
                <CardTitle className={systemStatus.color}>
                  {systemStatus.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {systemStatus.message}
                </CardDescription>
              </div>
            </div>
            <Badge variant={systemStatus.status === 'error' ? 'destructive' : 'default'}>
              {systemStatus.status === 'error' ? 'Issues Found' : 'All Good'}
            </Badge>
          </div>
        </CardHeader>
        
        {systemStatus.status === 'error' && (
          <CardContent>
            <div className="flex items-center space-x-2 p-4 bg-red-100 rounded-lg border border-red-200">
              <Mail className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Support Contact Required</p>
                <p className="text-sm text-red-600">
                  Technical issues detected. Please contact support with log access request.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {systemStatus.status === 'healthy' ? 'OK' : '--'}
                </p>
                <p className="text-sm text-muted-foreground">System Health</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {systemStatus.status === 'error' ? 'YES' : 'NO'}
                </p>
                <p className="text-sm text-muted-foreground">Issues Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{recentActivity}</p>
                <p className="text-sm text-muted-foreground">Recent Activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            System monitoring and maintenance options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button 
              onClick={handleRefresh} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check Status</span>
            </Button>
            
            <Button 
              onClick={() => clearLogsMutation.mutate()}
              variant="outline"
              disabled={clearLogsMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{clearLogsMutation.isPending ? "Clearing..." : "Clear Logs"}</span>
            </Button>
            
            {systemStatus.status === 'error' && (
              <Button 
                variant="default"
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                onClick={() => {
                  toast({
                    title: "Support Request", 
                    description: "Please contact aichecklist.io support for log analysis.",
                    duration: 5000,
                  });
                }}
              >
                <Mail className="w-4 h-4" />
                <span>Request Support</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LogViewer;