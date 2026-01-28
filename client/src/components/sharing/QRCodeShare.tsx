import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Download, Copy, Share2 } from 'lucide-react';
import * as QRCode from 'qrcode';

interface QRCodeShareProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  taskTitle: string;
  taskCategory: string;
  taskPriority: string;
}

export function QRCodeShare({ isOpen, onClose, shareUrl, taskTitle, taskCategory, taskPriority }: QRCodeShareProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && shareUrl) {
      generateQRCode();
    }
  }, [isOpen, shareUrl]);

  const generateQRCode = async () => {
    if (!shareUrl) return;
    
    setIsGenerating(true);
    try {
      // Generate QR code with custom styling
      const qrCodeUrl = await QRCode.toDataURL(shareUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 300
      });
      
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast({
        title: "QR Code Generation Failed",
        description: "Could not generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `${taskTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr_code.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: "QR code saved to your downloads folder",
    });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "URL Copied",
        description: "Share URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Task: ${taskTitle}`,
          text: `Check out this task I wanted to share with you: ${taskTitle} (${taskCategory}, ${taskPriority} priority)`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback to copy URL
      handleCopyUrl();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Share via QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Task Info */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium text-sm mb-2">{taskTitle}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">{taskCategory}</span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">{taskPriority}</span>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4">
            {isGenerating ? (
              <div className="flex items-center justify-center w-[300px] h-[300px] border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                </div>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code for task share" 
                  className="w-[300px] h-[300px] block"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-[300px] h-[300px] border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-muted-foreground">QR Code will appear here</p>
              </div>
            )}

            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Scan this QR code with any smartphone camera to open the shared task
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadQR}
              disabled={!qrCodeDataUrl}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCopyUrl}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
            
            <Button
              onClick={handleShareNative}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            This QR code contains the secure share link for your task. Anyone with the link can view the task details.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}