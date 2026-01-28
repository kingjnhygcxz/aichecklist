import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Mail, MailOpen, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ThreadNotification {
  threadId: number;
  lastMessageId: number;
  subject: string | null;
  body: string;
  senderName: string;
  senderUserId: number;
  unreadCount: number;
  createdAt: string;
  deepLink: string;
}

export default function Inbox() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/inbox/thread-notifications", { unreadOnly: false, limit: 30 }],
    queryFn: async () => {
      const r = await fetch("/api/inbox/thread-notifications?unreadOnly=false&limit=30", {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to fetch inbox");
      return (await r.json()) as { threads: ThreadNotification[] };
    },
  });

  const threads = data?.threads ?? [];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleThreadClick = (thread: ThreadNotification) => {
    setLocation(thread.deepLink);
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Inbox</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Message Threads
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[70vh]">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MailOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm mt-1">Use AIDOMO to send messages to your contacts</p>
              </div>
            ) : (
              <div className="divide-y">
                {threads.map((thread) => (
                  <div
                    key={thread.threadId}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      thread.unreadCount > 0 ? "bg-blue-50 dark:bg-blue-950/20" : ""
                    }`}
                    onClick={() => handleThreadClick(thread)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-medium truncate ${thread.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                            {thread.senderName}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatTimeAgo(thread.createdAt)}
                          </span>
                        </div>
                        {thread.subject && (
                          <p className="text-sm font-medium truncate">{thread.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">{thread.body}</p>
                      </div>
                      {thread.unreadCount > 0 && (
                        <Badge variant="destructive" className="flex-shrink-0">
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
