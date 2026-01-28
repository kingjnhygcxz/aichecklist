import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OfflineModelDownloadProps {
  onComplete?: () => void;
}

export function OfflineModelDownload({ onComplete }: OfflineModelDownloadProps) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Offline AI is not available in this build. Please use cloud AI features (OpenAI or Gemini) for report generation.
      </AlertDescription>
    </Alert>
  );
}
