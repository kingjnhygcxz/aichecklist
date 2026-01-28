import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useInboxUnreadCount() {
  const { toast } = useToast();
  const prevCountRef = useRef<number | null>(null);
  const lastToastAtRef = useRef<number>(0);

  const query = useQuery({
    queryKey: ["/api/inbox/unread-thread-count"],
    queryFn: async () => {
      const r = await fetch("/api/inbox/unread-thread-count", {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to fetch unread count");
      return (await r.json()) as { count: number };
    },
    refetchInterval:
      typeof document !== "undefined" &&
      document.hasFocus() &&
      document.visibilityState === "visible"
        ? 30000
        : false,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    const next = query.data?.count;

    if (next === undefined) return;

    if (prevCountRef.current === null) {
      prevCountRef.current = next;
      return;
    }

    const prev = prevCountRef.current;

    if (next > prev) {
      const now = Date.now();
      const cooldownMs = 2 * 60 * 1000;
      if (now - lastToastAtRef.current > cooldownMs) {
        toast({
          title: "New message",
          description: `You have ${next} unread thread${next === 1 ? "" : "s"}.`,
        });
        lastToastAtRef.current = now;
      }
    }

    prevCountRef.current = next;
  }, [query.data?.count, toast]);

  return query;
}
