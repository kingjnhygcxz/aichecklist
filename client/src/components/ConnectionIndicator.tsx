import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { connectionMonitor, ConnectionStatus } from '@/lib/connectionMonitor';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ConnectionIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');

  useEffect(() => {
    const unsubscribe = connectionMonitor.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: Wifi,
          label: 'Online',
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600'
        };
      case 'offline':
        return {
          icon: WifiOff,
          label: 'Offline',
          variant: 'destructive' as const,
          className: ''
        };
      case 'checking':
        return {
          icon: Loader2,
          label: 'Checking...',
          variant: 'secondary' as const,
          className: 'animate-spin'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className={config.className}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {status === 'online' && 'Connected to cloud AI (OpenAI/Gemini)'}
            {status === 'offline' && 'Offline mode - will use local AI when needed'}
            {status === 'checking' && 'Verifying connection...'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
