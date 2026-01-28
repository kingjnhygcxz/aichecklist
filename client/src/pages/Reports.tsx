import { useState, useEffect } from 'react';
import { FileText, Download, Sparkles, Loader2, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ConnectionIndicator } from '@/components/ConnectionIndicator';
import { OfflineModelDownload } from '@/components/OfflineModelDownload';
import { connectionMonitor } from '@/lib/connectionMonitor';
import { offlineAI } from '@/lib/offlineAI';
import { offlineDataSync } from '@/lib/offlineDataSync';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ReportMetadata {
  reportType: string;
  timeframe: string;
  generatedAt: string;
  totalTasks: number;
  completedTasks: number;
}

interface ReportResponse {
  success: boolean;
  report: string;
  provider: 'openai' | 'gemini' | 'offline';
  metadata: ReportMetadata;
}

export default function Reports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('productivity');
  const [timeframe, setTimeframe] = useState('week');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportResponse | null>(null);
  const [showOfflineDownload, setShowOfflineDownload] = useState(false);
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [isOnline, setIsOnline] = useState(connectionMonitor.isOnline());

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = connectionMonitor.subscribe(status => {
      setIsOnline(status === 'online');
    });
    return unsubscribe;
  }, []);

  // Fetch tasks for offline sync - enabled when online
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: isOnline,
  });

  // Sync tasks to offline storage when online
  useEffect(() => {
    if (tasks && isOnline) {
      offlineDataSync.syncTasks(tasks)
        .then(() => {
          setHasCachedData(true);
          console.log('Tasks synced to offline storage');
        })
        .catch(err => {
          console.error('Failed to sync tasks to offline storage:', err);
        });
    }
  }, [tasks, isOnline]);

  // Check if we have cached data on mount
  useEffect(() => {
    offlineDataSync.hasCachedData().then(setHasCachedData);
  }, []);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const isOnline = connectionMonitor.isOnline();

      // If offline or user requested offline mode, use WebLLM
      if (!isOnline || useOfflineMode) {
        if (!offlineAI.isReady()) {
          setShowOfflineDownload(true);
          throw new Error('Offline AI model not downloaded. Please download it first.');
        }

        // Get cached task data
        const cachedData = await offlineDataSync.getCachedTasks();
        if (!cachedData) {
          throw new Error('No cached task data available. Please sync data while online first.');
        }

        // Filter tasks by timeframe
        let filteredTasks = cachedData.tasks;
        if (timeframe !== 'all') {
          const now = new Date();
          const cutoffDate = new Date();
          
          switch (timeframe) {
            case 'today':
              cutoffDate.setHours(0, 0, 0, 0);
              break;
            case 'week':
              cutoffDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              cutoffDate.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              cutoffDate.setFullYear(now.getFullYear() - 1);
              break;
          }

          filteredTasks = cachedData.tasks.filter(t => {
            const taskDate = new Date(t.completedAt || t.createdAt);
            return taskDate >= cutoffDate;
          });
        }

        // Prepare report data from cached tasks
        const reportData = {
          reportType,
          timeframe,
          totalTasks: filteredTasks.length,
          completedTasks: filteredTasks.filter(t => t.completed).length,
          activeTasks: filteredTasks.filter(t => !t.completed && !t.archived).length,
          archivedTasks: includeArchived ? filteredTasks.filter(t => t.archived).length : 0,
          categories: [...new Set(filteredTasks.map(t => t.category))],
          priorities: {
            high: filteredTasks.filter(t => t.priority === 'High').length,
            medium: filteredTasks.filter(t => t.priority === 'Medium').length,
            low: filteredTasks.filter(t => t.priority === 'Low').length,
          },
          lastSync: cachedData.lastSync,
        };

        // Generate report using offline AI
        const systemPrompt = `You are an AI assistant that generates detailed, professional reports for task management.
Generate a comprehensive ${reportType} report based on the provided data.
Format the report in markdown with clear sections, insights, and actionable recommendations.`;

        const userMessage = `Generate a ${reportType} report for the ${timeframe} timeframe using this data:\n\n${JSON.stringify(reportData, null, 2)}`;

        const reportContent = await offlineAI.generateCompletion(systemPrompt, userMessage);

        return {
          success: true,
          report: reportContent,
          provider: 'offline' as const,
          metadata: {
            reportType,
            timeframe,
            generatedAt: new Date().toISOString(),
            totalTasks: reportData.totalTasks,
            completedTasks: reportData.completedTasks,
          }
        };
      }

      // Use cloud AI (online mode)
      const response = await apiRequest<ReportResponse>('/api/reports/generate', {
        method: 'POST',
        body: JSON.stringify({
          reportType,
          timeframe,
          includeArchived,
        }),
      });

      return response;
    },
    onSuccess: (data) => {
      setGeneratedReport(data);
      toast({
        title: 'Report Generated',
        description: `Your ${reportType} report has been created using ${data.provider === 'openai' ? 'OpenAI' : data.provider === 'gemini' ? 'Google Gemini' : 'Offline AI'}.`,
      });
    },
    onError: (error: any) => {
      console.error('Report generation failed:', error);

      // Check if server suggests offline mode
      if (error.useOfflineMode || !connectionMonitor.isOnline()) {
        setShowOfflineDownload(true);
        toast({
          title: 'Offline Mode Available',
          description: 'Cloud AI is unavailable. Download the offline model to continue.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: error.message || 'Failed to generate report',
          variant: 'destructive',
        });
      }
    },
  });

  const downloadReport = () => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Report Downloaded',
      description: 'Your report has been saved as a markdown file.',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            AI Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate insightful reports from your tasks using AI
          </p>
        </div>
        <ConnectionIndicator />
      </div>

      {hasCachedData && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Task data synced for offline use. You can generate reports even without internet.
          </AlertDescription>
        </Alert>
      )}

      {showOfflineDownload && (
        <OfflineModelDownload
          onComplete={() => {
            setShowOfflineDownload(false);
            toast({
              title: 'Model Ready',
              description: 'You can now generate reports offline!',
            });
          }}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
            <CardDescription>
              Configure your AI-generated report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type" data-testid="select-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productivity">Productivity Summary</SelectItem>
                  <SelectItem value="completion">Completion Analysis</SelectItem>
                  <SelectItem value="category">Category Breakdown</SelectItem>
                  <SelectItem value="priority">Priority Distribution</SelectItem>
                  <SelectItem value="time">Time Management</SelectItem>
                  <SelectItem value="insights">AI Insights & Recommendations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger id="timeframe" data-testid="select-timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-archived"
                checked={includeArchived}
                onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
                data-testid="checkbox-include-archived"
              />
              <Label htmlFor="include-archived" className="cursor-pointer">
                Include archived tasks
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="offline-mode"
                checked={useOfflineMode}
                onCheckedChange={(checked) => setUseOfflineMode(checked as boolean)}
                data-testid="checkbox-offline-mode"
              />
              <Label htmlFor="offline-mode" className="cursor-pointer">
                Force offline mode (use local AI)
              </Label>
            </div>

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full"
              data-testid="button-generate-report"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedReport && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Report</CardTitle>
                <Badge variant="outline">
                  {generatedReport.provider === 'openai' && 'OpenAI GPT-4o'}
                  {generatedReport.provider === 'gemini' && 'Google Gemini'}
                  {generatedReport.provider === 'offline' && 'Offline AI (Llama 3.2)'}
                </Badge>
              </div>
              <CardDescription>
                {generatedReport.metadata.reportType} • {generatedReport.metadata.timeframe}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Generated: {new Date(generatedReport.metadata.generatedAt).toLocaleString()}</p>
                <p>Total Tasks: {generatedReport.metadata.totalTasks}</p>
                <p>Completed: {generatedReport.metadata.completedTasks}</p>
              </div>

              <div className="prose dark:prose-invert max-w-none max-h-[400px] overflow-y-auto border rounded-lg p-4 bg-muted/30">
                <div className="whitespace-pre-wrap text-sm">
                  {generatedReport.report}
                </div>
              </div>

              <Button onClick={downloadReport} variant="outline" className="w-full" data-testid="button-download-report">
                <Download className="h-4 w-4 mr-2" />
                Download as Markdown
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>Hybrid AI System:</strong> When online, reports use cloud AI (OpenAI or Gemini) for best quality. 
          When offline, the system automatically switches to a local AI model running in your browser. 
          Download the offline model once to enable full offline functionality.
        </AlertDescription>
      </Alert>
    </div>
  );
}
