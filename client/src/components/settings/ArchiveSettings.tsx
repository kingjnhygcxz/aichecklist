import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Archive, Clock, Save, Loader2, Printer, Calendar, CheckCircle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { format } from "date-fns";
import DOMPurify from 'dompurify';

interface ArchiveSettings {
  autoArchiveEnabled: boolean;
  autoArchiveHours: number;
  deleteArchivedAfterDays: number | null;
}

export function ArchiveSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // Fetch current user settings
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["/api/user/settings"],
    enabled: true,
  });

  // Fetch archived tasks
  const { data: archivedTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["/api/tasks/archived"],
    enabled: true,
  });

  // Initialize settings with defaults (null for deleteArchivedAfterDays = keep forever by default)
  const [settings, setSettings] = useState<ArchiveSettings>({
    autoArchiveEnabled: false,
    autoArchiveHours: 24,
    deleteArchivedAfterDays: null,
  });

  // Update settings when server data loads
  useEffect(() => {
    if (userSettings && typeof userSettings === 'object') {
      // Debug logging to understand what's coming from server
      console.log('Archive Settings - Server data received:', userSettings);
      
      const serverAutoArchive = (userSettings as any).autoArchiveEnabled;
      const serverHours = (userSettings as any).autoArchiveHours;
      const serverDeleteAfterDays = (userSettings as any).deleteArchivedAfterDays;
      
      console.log('Archive Settings - Values:', {
        serverAutoArchive,
        serverHours,
        serverDeleteAfterDays,
        willBeEnabled: serverAutoArchive === true
      });
      
      setSettings({
        autoArchiveEnabled: serverAutoArchive === true, // Ensure boolean
        autoArchiveHours: serverHours || 24,
        // Preserve null from server (keep forever), don't default to 30
        deleteArchivedAfterDays: serverDeleteAfterDays !== undefined ? serverDeleteAfterDays : null,
      });
    }
  }, [userSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: ArchiveSettings) => {
      const response = await apiRequest("PATCH", "/api/user/settings", {
        autoArchiveEnabled: newSettings.autoArchiveEnabled,
        autoArchiveHours: newSettings.autoArchiveHours,
        deleteArchivedAfterDays: newSettings.deleteArchivedAfterDays,
      });
      return response;
    },
    onSuccess: (data) => {
      console.log('Archive Settings - Save successful, server returned:', data);
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "Settings Saved",
        description: "Your archive preferences have been updated.",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "There was an error saving your settings. Please try again.";
      toast({
        title: "Save Failed", 
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleSaveSettings = () => {
    console.log('Archive Settings - Saving:', settings);
    saveSettingsMutation.mutate(settings);
  };

  // Filter archived tasks by category
  const filteredTasks = filterCategory === "All" 
    ? archivedTasks 
    : archivedTasks.filter((task: Task) => task.category === filterCategory);

  // Get unique categories from archived tasks
  const categories = ["All", ...Array.from(new Set(archivedTasks.map((task: Task) => task.category)))];

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AICHECKLIST.IO - Archived Tasks</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2563eb; 
              margin-bottom: 10px; 
            }
            .task { 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              padding: 15px; 
              margin-bottom: 15px; 
              page-break-inside: avoid; 
            }
            .task-title { 
              font-size: 18px; 
              font-weight: 600; 
              margin-bottom: 8px; 
            }
            .task-meta { 
              display: flex; 
              gap: 15px; 
              font-size: 14px; 
              color: #6b7280; 
              margin-bottom: 10px; 
            }
            .badge { 
              background: #f3f4f6; 
              border: 1px solid #d1d5db; 
              border-radius: 4px; 
              padding: 2px 8px; 
              font-size: 12px; 
            }
            .summary { 
              margin-bottom: 30px; 
              padding: 15px; 
              background: #f9fafb; 
              border-radius: 8px; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">AICHECKLIST.IO</div>
            <h1>Archived Tasks Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            ${filterCategory !== "All" ? `<p>Filtered by: ${filterCategory}</p>` : ""}
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Archived Tasks:</strong> ${filteredTasks.length}</p>
            <p><strong>Categories:</strong> ${categories.filter(c => c !== "All").join(", ")}</p>
          </div>

          ${filteredTasks.map((task: Task) => `
            <div class="task">
              <div class="task-title">${task.title}</div>
              <div class="task-meta">
                <span class="badge">${task.category}</span>
                <span class="badge">${task.priority}</span>
                ${task.completedAt ? `<span>Completed: ${format(new Date(task.completedAt), "MMM dd, yyyy 'at' h:mm a")}</span>` : ""}
                ${task.archivedAt ? `<span>Archived: ${format(new Date(task.archivedAt), "MMM dd, yyyy 'at' h:mm a")}</span>` : ""}
              </div>
              ${task.checklistItems && task.checklistItems.length > 0 ? `
                <div style="margin-top: 10px;">
                  <strong>Checklist Items:</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${task.checklistItems.map(item => `
                      <li style="margin: 3px 0;">
                        ${item.completed ? "✅" : "⬜"} ${item.text}
                      </li>
                    `).join("")}
                  </ul>
                </div>
              ` : ""}
            </div>
          `).join("")}
          
          <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>© 2025 AICHECKLIST.IO - AI-Powered Task Management</p>
          </div>
        </body>
      </html>
    `;

    // Safely set document content using DOM methods instead of document.write
    const doc = printWindow.document;
    doc.open();
    
    // Sanitize and parse the HTML content safely
    const sanitizedContent = DOMPurify.sanitize(printContent, {
      ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'html', 'head', 'body', 'title', 'style'],
      ALLOWED_ATTR: ['style', 'class', 'charset'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'href', 'src'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'select', 'textarea', 'a', 'img']
    });
    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(sanitizedContent, 'text/html');
    
    // Copy the parsed document structure
    if (parsedDoc.documentElement) {
      doc.replaceChild(doc.importNode(parsedDoc.documentElement, true), doc.documentElement);
    }
    
    doc.close();
    printWindow.document.close();
    printWindow.print();
  };

  const hourOptions = [
    { value: 1, label: "1 hour" },
    { value: 3, label: "3 hours" },
    { value: 6, label: "6 hours" },
    { value: 12, label: "12 hours" },
    { value: 24, label: "24 hours (1 day)" },
    { value: 48, label: "48 hours (2 days)" },
    { value: 72, label: "72 hours (3 days)" },
  ];

  const retentionOptions = [
    { value: "7", label: "7 days" },
    { value: "14", label: "14 days (2 weeks)" },
    { value: "30", label: "30 days (1 month)" },
    { value: "60", label: "60 days (2 months)" },
    { value: "90", label: "90 days (3 months)" },
    { value: "180", label: "180 days (6 months)" },
    { value: "365", label: "365 days (1 year)" },
    { value: "forever", label: "Keep forever (never delete)" },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archive Settings
          </CardTitle>
          <CardDescription>
            Configure automatic archiving for completed tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Archive className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Archive Management</h2>
          <p className="text-muted-foreground">
            Configure archive settings and view your completed tasks
          </p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="settings">Archive Settings</TabsTrigger>
          <TabsTrigger value="viewer">Archived Tasks ({archivedTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archive Configuration
              </CardTitle>
              <CardDescription>
                Configure automatic archiving for completed tasks to keep your task list organized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-archive" className="text-base font-medium">
              Auto-Archive Completed Tasks
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically archive completed tasks after a specified time
            </p>
          </div>
          <Switch
            id="auto-archive"
            checked={settings.autoArchiveEnabled}
            onCheckedChange={(enabled) => {
              console.log('Archive Switch - Toggle clicked, changing to:', enabled);
              setSettings(prev => ({ ...prev, autoArchiveEnabled: enabled }));
            }}
          />
        </div>

        {settings.autoArchiveEnabled && (
          <div className="space-y-6 pl-6 border-l-2 border-primary/20">
            {/* Archive After Configuration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" />
                Archive After
              </div>
              <Select
                value={settings.autoArchiveHours.toString()}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, autoArchiveHours: parseInt(value) }))
                }
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Tasks will be automatically archived {settings.autoArchiveHours} hours after completion
              </p>
            </div>

            {/* Retention Period Configuration */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Archive className="h-4 w-4 text-primary" />
                Delete Archived Tasks After
              </div>
              <Select
                value={settings.deleteArchivedAfterDays === null ? "forever" : settings.deleteArchivedAfterDays.toString()}
                onValueChange={(value) =>
                  setSettings((prev) => ({ 
                    ...prev, 
                    deleteArchivedAfterDays: value === "forever" ? null : parseInt(value) 
                  }))
                }
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {retentionOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.deleteArchivedAfterDays === null 
                  ? "Archived tasks will be kept forever and never automatically deleted"
                  : `Archived tasks will be permanently deleted after ${settings.deleteArchivedAfterDays} days`
                }
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
            className="w-full sm:w-auto"
          >
            {saveSettingsMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Archive Settings
          </Button>
        </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Archive className="h-4 w-4 text-primary" />
                  Manual Archive
                </div>
                <p className="text-xs text-muted-foreground">
                  You can also manually archive completed tasks using the Archive button that appears
                  next to each completed task in your task list.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viewer" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Archived Tasks
              </CardTitle>
              <CardDescription>
                View and print your completed tasks archive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter and Print Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category} {category !== "All" ? `(${archivedTasks.filter((t: Task) => t.category === category).length})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handlePrint} 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={filteredTasks.length === 0}
                >
                  <Printer className="h-4 w-4" />
                  Print List
                </Button>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {isLoadingTasks ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No archived tasks found</p>
                    <p className="text-sm">
                      {filterCategory !== "All" 
                        ? `No tasks in "${filterCategory}" category have been archived yet.`
                        : "Complete some tasks to see them here after they're archived."
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground mb-4">
                      Showing {filteredTasks.length} archived task{filteredTasks.length !== 1 ? 's' : ''}
                      {filterCategory !== "All" && ` in "${filterCategory}" category`}
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredTasks.map((task: Task) => (
                        <div key={task.id} className="border rounded-lg p-4 bg-muted/20">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground mb-2">{task.title}</h4>
                              
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="secondary">{task.category}</Badge>
                                <Badge variant="outline">{task.priority}</Badge>
                              </div>
                              
                              <div className="text-xs text-muted-foreground space-y-1">
                                {task.completedAt && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Completed: {format(new Date(task.completedAt), "MMM dd, yyyy 'at' h:mm a")}
                                  </div>
                                )}
                                {task.archivedAt && (
                                  <div className="flex items-center gap-1">
                                    <Archive className="h-3 w-3" />
                                    Archived: {format(new Date(task.archivedAt), "MMM dd, yyyy 'at' h:mm a")}
                                  </div>
                                )}
                              </div>

                              {/* Show checklist items if they exist */}
                              {task.checklistItems && task.checklistItems.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Checklist Items ({task.checklistItems.filter(item => item.completed).length}/{task.checklistItems.length} completed)
                                  </p>
                                  <div className="space-y-1">
                                    {task.checklistItems.slice(0, 3).map((item) => (
                                      <div key={item.id} className="flex items-center gap-2 text-xs">
                                        <span className={item.completed ? "text-green-600" : "text-muted-foreground"}>
                                          {item.completed ? "✅" : "⬜"}
                                        </span>
                                        <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                                          {item.text}
                                        </span>
                                      </div>
                                    ))}
                                    {task.checklistItems.length > 3 && (
                                      <p className="text-xs text-muted-foreground">
                                        ...and {task.checklistItems.length - 3} more item{task.checklistItems.length - 3 !== 1 ? 's' : ''}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}