import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Share2, Link, Mail, Copy, Download, Users, Lock, Globe, QrCode, Calendar, BarChart3, Trophy } from "lucide-react";
// Lightweight animation alternative
const MotionDiv = ({ children, className, ...props }: any) => (
  <div className={`transition-all duration-300 ${className || ""}`} {...props}>
    {children}
  </div>
);
import { apiRequest } from "@/lib/queryClient";

interface ChartShareDialogProps {
  chartType: 'gantt' | 'pert' | 'combined' | 'achievements';
  chartData?: any;
  children: React.ReactNode;
}

export function ChartShareDialog({ chartType, chartData, children }: ChartShareDialogProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [shareDescription, setShareDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const chartTypeLabels = {
    gantt: 'Gantt Chart',
    pert: 'PERT Chart', 
    combined: 'Project Charts',
    achievements: 'Achievements Dashboard'
  };

  const chartTypeIcons = {
    gantt: Calendar,
    pert: BarChart3,
    combined: BarChart3,
    achievements: Trophy
  };

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      // Capture current chart data or create meaningful fallback
      let capturedData;
      
      if (chartData) {
        capturedData = chartData;
      } else {
        // Try to capture chart data from the current page context
        const chartContainer = document.querySelector('[data-chart-container]');
        if (chartContainer) {
          // Capture basic chart information from the DOM
          capturedData = {
            chartType,
            timestamp: new Date().toISOString(),
            source: 'page_capture',
            description: shareDescription || `${chartType} chart shared from AIChecklist`
          };
        } else {
          // Minimal fallback data
          capturedData = {
            chartType,
            timestamp: new Date().toISOString(),
            description: shareDescription || `${chartType} chart from AIChecklist`,
            note: "Chart data will be populated when accessed"
          };
        }
      }
      
      const shareData = {
        type: chartType,
        data: capturedData,
        settings: {
          isPublic,
          requiresPassword,
          password: requiresPassword ? password : null,
          expiryDays: parseInt(expiryDays),
          description: shareDescription
        }
      };

      const response = await apiRequest('POST', '/api/shares/create', shareData);
      const result = await response.json();
      const fullUrl = `${window.location.origin}/shared/${result.shareId}`;
      setShareUrl(fullUrl);
      
      toast({
        title: "Share link created!",
        description: "Your chart is ready to share with team members.",
      });
    } catch (error) {
      toast({
        title: "Error creating share",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = `${chartTypeLabels[chartType]} - Shared from AIChecklist`;
    const body = `Check out this ${chartTypeLabels[chartType].toLowerCase()} I wanted to share with you:\n\n${shareUrl}\n\n${shareDescription ? `Description: ${shareDescription}\n\n` : ''}Best regards`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  const downloadChart = async () => {
    try {
      // Use html2canvas to capture the chart
      const element = document.querySelector('[data-chart-container]');
      if (!element) {
        toast({
          title: "Download failed",
          description: "Chart container not found",
          variant: "destructive",
        });
        return;
      }

      // Dynamic import to reduce bundle size
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `${chartTypeLabels[chartType].replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Chart downloaded!",
        description: "Chart saved as PNG image",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to capture chart image",
        variant: "destructive",
      });
    }
  };

  const IconComponent = chartTypeIcons[chartType];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share {chartTypeLabels[chartType]}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description for this shared chart..."
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anyone with the link to view
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Protection</Label>
                  <p className="text-sm text-muted-foreground">
                    Require password to access
                  </p>
                </div>
                <Switch 
                  checked={requiresPassword} 
                  onCheckedChange={setRequiresPassword}
                  disabled={!isPublic}
                />
              </div>
              
              {requiresPassword && (
                <div>
                  <Label htmlFor="password">Access Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password for access"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="expiry">Link Expires After</Label>
                <select
                  id="expiry"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="1">1 day</option>
                  <option value="7">1 week</option>
                  <option value="30">1 month</option>
                  <option value="90">3 months</option>
                  <option value="0">Never</option>
                </select>
              </div>
              
              <Button 
                onClick={generateShareLink} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Create Share Link"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            {shareUrl ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <IconComponent className="h-5 w-5" />
                      {chartTypeLabels[chartType]} Share
                    </CardTitle>
                    <CardDescription>
                      Share this link with your team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input value={shareUrl} readOnly className="flex-1" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(shareUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={shareViaEmail}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => copyToClipboard(shareUrl)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {isPublic ? (
                        <>
                          <Globe className="h-4 w-4" />
                          Public access
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Team members only
                        </>
                      )}
                      {requiresPassword && (
                        <>
                          • <Lock className="h-4 w-4" />
                          Password protected
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Create a share link first to enable sharing options</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Options
                  </CardTitle>
                  <CardDescription>
                    Download your chart in different formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={downloadChart}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download as PNG Image
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const dataStr = JSON.stringify(chartData, null, 2);
                      const dataBlob = new Blob([dataStr], {type: 'application/json'});
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${chartType}_data.json`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data as JSON
                  </Button>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    PNG images are perfect for presentations and reports. 
                    JSON data can be imported into other project management tools.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}