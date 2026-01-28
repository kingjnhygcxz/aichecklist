import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Check, AlertCircle, Loader2, ArrowLeft, Download } from "lucide-react";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Task } from "@/types";

interface ImportSharedTaskProps {
  shareId: string;
}

interface SharedTaskResponse {
  task: Task;
  expiresAt: string;
}

export function ImportSharedTask({ shareId }: ImportSharedTaskProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  
  // Fetch the shared task data
  const { data, isLoading, isError } = useQuery<SharedTaskResponse>({
    queryKey: [`/api/share/${shareId}`],
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Mutation for importing the task
  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/share/${shareId}/import`, 'POST');
      return response;
    },
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Task imported!",
        description: "The task has been added to your task list",
        duration: 3000,
      });
      
      // Invalidate task queries to refresh the task list
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      // Navigate back to home after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    },
    onError: (error) => {
      console.error('Import failed:', error);
      toast({
        title: "Import failed",
        description: "Could not import task. The link may have expired.",
        variant: "destructive",
        duration: 5000,
      });
    }
  });
  
  const handleImport = () => {
    setIsImporting(true);
    importMutation.mutate();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/share/${shareId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shared Task
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Loading shared task...</span>
          </div>
        ) : isError ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center"
          >
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <h2 className="text-2xl font-semibold mb-2">Shared Task Not Found</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              This shared task link may have expired or is no longer available.
            </p>
            <Button asChild>
              <Link href="/">Return to My Tasks</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">Import Shared Task</CardTitle>
                <CardDescription>
                  Review the task before adding it to your task list
                </CardDescription>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-6">
                <div className="rounded-lg border p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{data?.task.title}</h3>
                    <Badge variant="outline">
                      {data?.task.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Badge variant="secondary" className="mr-2">{data?.task.priority}</Badge>
                      Priority
                    </span>
                    
                    {data?.task.timer && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-primary" />
                        {data.task.timer} min timer
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h3 className="font-medium flex items-center text-primary mb-2">
                    <Check className="h-4 w-4 mr-2" />
                    What will happen
                  </h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• This task will be added to your task list</li>
                    <li>• Task will be marked as "not completed" regardless of original status</li>
                    <li>• Task timer settings will be preserved</li>
                    <li>• Original task category and priority will be maintained</li>
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting}
                  className="min-w-[120px]"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Import Task
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default ImportSharedTask;