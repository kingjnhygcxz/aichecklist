import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useInboxUnreadCount } from "@/hooks/useInboxUnreadCount";

export function InboxBadge() {
  const [, setLocation] = useLocation();
  const { data, isLoading } = useInboxUnreadCount();
  const count = data?.count ?? 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocation("/aidomo/inbox")}
      className="relative"
      title="Messages"
    >
      <Mail className="h-5 w-5" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {count > 9 ? "9+" : count}
        </Badge>
      )}
    </Button>
  );
}
