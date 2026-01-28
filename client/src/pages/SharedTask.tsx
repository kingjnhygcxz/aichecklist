import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, Flag, Share2, Check, AlertCircle, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Task, TaskPriority } from "@/types";

interface SharedTaskProps {
  shareId: string;
}

interface SharedTaskResponse {
  task: Task;
  expiresAt: string;
}

export function SharedTask({ shareId }: SharedTaskProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [remainingTime, setRemainingTime] = useState<string>("");
  
  // Fetch the shared task data
  const { data, isLoading, isError, error } = useQuery<SharedTaskResponse>({
    queryKey: [`/api/share/${shareId}`],
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Calculate remaining time until the shared link expires
  useEffect(() => {
    if (!data?.expiresAt) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(data.expiresAt);
      const diffMs = expiresAt.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setRemainingTime("Expired");
        return;
      }
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0) {
        setRemainingTime(`${diffHours}h ${diffMinutes}m remaining`);
      } else {
        setRemainingTime(`${diffMinutes}m remaining`);
      }
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [data?.expiresAt]);
  
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "High": return "text-red-500";
      case "Medium": return "text-primary";
      case "Low": return "text-gray-500";
      default: return "text-gray-500";
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const handleImportTask = () => {
    navigate(`/share/${shareId}/import`);
  };
  
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
        duration: 3000,
      });
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
        duration: 3000,
      });
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to My Tasks
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
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{data?.task.title}</CardTitle>
                    <CardDescription>
                      Shared task • {remainingTime}
                    </CardDescription>
                  </div>
                  <Badge variant={data?.task.completed ? "outline" : "default"}>
                    {data?.task.completed ? (
                      <><Check className="h-3 w-3 mr-1" /> Completed</>
                    ) : "Active"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="outline" className="px-3 py-1 rounded-full font-normal">
                    {data?.task.category}
                  </Badge>
                  <span className={`flex items-center ${getPriorityColor(data?.task.priority as TaskPriority)}`}>
                    <Flag className="h-4 w-4 mr-1" />
                    {data?.task.priority} Priority
                  </span>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-5">
                  {data?.task.timer && (
                    <div className="flex items-center">
                      <Clock className="text-primary h-5 w-5 mr-2" />
                      <span>{data.task.timer} min timer</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="text-primary h-5 w-5 mr-2" />
                    <span>Created {formatDate(data?.task.createdAt || '')}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleImportTask} className="w-full sm:w-auto">
                  <span className="mr-2">Add to My Tasks</span>
                </Button>
                <Button variant="outline" onClick={handleCopyLink} className="w-full sm:w-auto">
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Copy Share Link</span>
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

export default SharedTask;