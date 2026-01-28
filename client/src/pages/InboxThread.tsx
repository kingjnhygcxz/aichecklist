import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  threadId: number;
  subject: string | null;
  body: string;
  readAt: string | null;
  createdAt: string;
}

interface MessageThread {
  id: number;
  participantAUserId: number;
  participantBUserId: number;
  createdAt: string;
  updatedAt: string;
}

interface ThreadData {
  thread: MessageThread;
  messages: Message[];
}

interface InboxThreadProps {
  threadId: string;
}

export default function InboxThread({ threadId }: InboxThreadProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const threadIdNum = parseInt(threadId, 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/inbox/thread", threadIdNum, "messages"],
    queryFn: async () => {
      const r = await fetch(`/api/inbox/thread/${threadIdNum}/messages`, {
        credentials: "include",
      });
      if (!r.ok) {
        if (r.status === 404) throw new Error("Thread not found");
        throw new Error("Failed to fetch thread");
      }
      return (await r.json()) as ThreadData;
    },
    enabled: !isNaN(threadIdNum),
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/user"],
  }) as { data: { id: number; username: string; fullName?: string } | undefined };

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/inbox/thread/${threadIdNum}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbox/unread-thread-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inbox/thread-notifications"] });
    },
  });

  const hasMarkedRead = useRef(false);

  useEffect(() => {
    if (!data) return;
    if (isNaN(threadIdNum)) return;
    if (hasMarkedRead.current) return;

    hasMarkedRead.current = true;
    markReadMutation.mutate();
  }, [data, threadIdNum]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const messages = data?.messages ?? [];
  const thread = data?.thread;

  if (isNaN(threadIdNum)) {
    return (
      <div className="container max-w-2xl mx-auto py-6 px-4">
        <p className="text-center text-muted-foreground">Invalid thread ID</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/aidomo/inbox")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Conversation</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[70vh]">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-16 w-3/4 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Thread not found or access denied</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No messages in this thread</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {messages.map((message) => {
                  const isFromMe = currentUser && message.fromUserId === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isFromMe ? "flex-row-reverse" : ""}`}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className={`max-w-[75%] ${isFromMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isFromMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.subject && (
                            <p className="text-sm font-medium mb-1">{message.subject}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${isFromMe ? "text-right" : ""}`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
