import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText, Database, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface BulkOperationsProps {
  children: React.ReactNode;
}

export function BulkOperations({ children }: BulkOperationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const { toast } = useToast();

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/tasks/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `aichecklist_tasks.${format}`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Your tasks have been exported as ${format.toUpperCase()} file`,
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export tasks",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResults(null);
    }
  };

  const processCSV = (csvContent: string): any[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const task: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header.toLowerCase()) {
            case 'title':
              task.title = value;
              break;
            case 'description':
              task.description = value;
              break;
            case 'category':
              task.category = value || 'Personal';
              break;
            case 'priority':
              task.priority = ['Low', 'Medium', 'High'].includes(value) ? value : 'Medium';
              break;
            case 'status':
              task.completed = value.toLowerCase().includes('completed');
              break;
            case 'due date':
              task.dueDate = value ? new Date(value).toISOString() : null;
              break;
          }
        });
        
        return task;
      })
      .filter(task => task.title); // Only include tasks with titles
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const fileContent = await importFile.text();
      let tasks: any[] = [];

      if (importFile.name.endsWith('.json')) {
        const jsonData = JSON.parse(fileContent);
        tasks = jsonData.tasks || jsonData; // Handle both wrapped and unwrapped formats
      } else if (importFile.name.endsWith('.csv')) {
        tasks = processCSV(fileContent);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV files.');
      }

      const response = await apiRequest('/api/tasks/import', {
        method: 'POST',
        body: { tasks, format: importFile.name.split('.').pop() },
      });

      setImportResults(response);
      
      toast({
        title: "Import Completed",
        description: `${response.imported} tasks imported successfully`,
      });

    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import tasks",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Bulk Operations
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Tasks
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Tasks
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Your Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Download all your tasks in various formats for backup or migration to other platforms.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleExport('json')}
                      disabled={isExporting}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      variant="outline"
                    >
                      <FileText className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">JSON Format</div>
                        <div className="text-xs text-muted-foreground">
                          Complete data with metadata
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      onClick={() => handleExport('csv')}
                      disabled={isExporting}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      variant="outline"
                    >
                      <FileText className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">CSV Format</div>
                        <div className="text-xs text-muted-foreground">
                          Excel-compatible spreadsheet
                        </div>
                      </div>
                    </Button>
                  </div>
                  
                  {isExporting && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Preparing your export...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Import Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <strong>Note:</strong> Importing will add new tasks to your existing list. 
                      Make sure to backup your current tasks before importing.
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="import-file">Select File</Label>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JSON, CSV
                    </p>
                  </div>
                  
                  {importFile && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{importFile.name}</span>
                          <span className="text-muted-foreground">
                            ({Math.round(importFile.size / 1024)} KB)
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Button
                    onClick={handleImport}
                    disabled={!importFile || isImporting}
                    className="w-full"
                  >
                    {isImporting ? 'Importing...' : 'Import Tasks'}
                  </Button>
                  
                  {importResults && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="font-medium text-green-800">Import Results</div>
                          <div className="text-sm text-green-700">
                            <div>✅ {importResults.imported} tasks imported successfully</div>
                            {importResults.skipped > 0 && (
                              <div>⚠️ {importResults.skipped} tasks skipped</div>
                            )}
                          </div>
                          {importResults.errors && importResults.errors.length > 0 && (
                            <details className="text-xs text-red-600 mt-2">
                              <summary className="cursor-pointer">View errors</summary>
                              <ul className="mt-1 pl-4">
                                {importResults.errors.map((error: string, index: number) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}