import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, User, Share2, QrCode } from 'lucide-react';
import { QRCodeShare } from '@/components/sharing/QRCodeShare';

interface ShareTaskPopupProps {
  taskId: string;
  taskTitle: string;
  taskCategory: string;
  taskPriority: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export function ShareTaskPopup({ taskId, taskTitle, taskCategory, taskPriority, children, onClose }: ShareTaskPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const { toast } = useToast();

  // Debug logging
  console.log('ShareTaskPopup rendered with:', { taskId, taskTitle, isOpen });

  const generateShareLink = async (): Promise<string> => {
    const response = await fetch(`/api/tasks/${taskId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create share link');
    }

    const result = await response.json();
    return `${window.location.origin}/shared/${result.shareId}`;
  };

  const handleEmailShare = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to share the task.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      const shareLink = await generateShareLink();
      
      // Create email content
      const subject = encodeURIComponent(`Task Shared: ${taskTitle}`);
      const body = encodeURIComponent(`Hi!

I wanted to share this task with you:

Task: ${taskTitle}
Category: ${taskCategory}
Priority: ${taskPriority}

${message ? `Message: ${message}` : ''}

You can view this task here: ${shareLink}

Best regards!`);
      
      // Open email client
      window.open(`mailto:${email}?subject=${subject}&body=${body}`);
      
      toast({
        title: "Task Shared Successfully",
        description: `Email client opened with task details for ${email}`,
      });

      // Reset form and close popup
      setEmail('');
      setMessage('');
      setIsOpen(false);
      onClose?.();
      
    } catch (error) {
      toast({
        title: "Failed to Share Task",
        description: error instanceof Error ? error.message : "Failed to share task",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handlePhoneShare = async () => {
    if (!phone.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to share the task.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to share task');
      }

      const shareLink = await generateShareLink();
      
      // Create SMS message
      const smsMessage = `Hi! I wanted to share this task with you:\n\nTask: ${taskTitle}\nCategory: ${taskCategory}\nPriority: ${taskPriority}\n\n${message ? `Message: ${message}\n\n` : ''}View it here: ${shareLink}`;
      
      // Open SMS client (works on mobile and some desktop)
      const smsUrl = `sms:${phone}?body=${encodeURIComponent(smsMessage)}`;
      window.open(smsUrl);
      
      toast({
        title: "SMS Client Opened",
        description: `SMS ready to send to ${phone} - please send the message from your SMS app`,
      });

      // Reset form and close popup
      setPhone('');
      setMessage('');
      setIsOpen(false);
      onClose?.();
      
    } catch (error) {
      toast({
        title: "Failed to Share Task",
        description: error instanceof Error ? error.message : "Failed to share task",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleUserShare = async () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username or email to share the task.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/share-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientIdentifier: username.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to share task');
      }

      toast({
        title: "Task Shared Successfully",
        description: `Task "${taskTitle}" has been shared with ${username}`,
      });

      // Reset form and close popup
      setUsername('');
      setMessage('');
      setIsOpen(false);
      onClose?.();
      
    } catch (error) {
      toast({
        title: "Failed to Share Task",
        description: error instanceof Error ? error.message : "Failed to share task",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleQRCodeShare = async () => {
    setIsSharing(true);
    try {
      const shareLink = await generateShareLink();
      setShareUrl(shareLink);
      setShowQRCode(true);
    } catch (error) {
      toast({
        title: "Failed to Generate QR Code",
        description: error instanceof Error ? error.message : "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    console.log('Dialog state changing to:', open);
    setIsOpen(open);
  };

  const handleClick = () => {
    console.log('Share button clicked, opening dialog');
    setIsOpen(true);
  };

  return (
    <>
      <div onClick={handleClick}>
        {children}
      </div>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Task
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-1">{taskTitle}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">{taskCategory}</span>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">{taskPriority}</span>
          </div>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              User
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-1">
              <QrCode className="w-4 h-4" />
              QR Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message (optional)</Label>
              <Textarea
                id="email-message"
                placeholder="Add a message with the shared task..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleEmailShare} 
              disabled={isSharing}
              className="w-full"
            >
              {isSharing ? 'Sharing...' : 'Share via Email'}
            </Button>
          </TabsContent>
          
          <TabsContent value="phone" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-message">Message (optional)</Label>
              <Textarea
                id="phone-message"
                placeholder="Add a message with the shared task..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={handlePhoneShare} 
              disabled={isSharing}
              className="w-full"
            >
              {isSharing ? 'Sharing...' : 'Share via SMS'}
            </Button>
          </TabsContent>
          
          <TabsContent value="user" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                placeholder="Enter username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Share with registered AIChecklist users
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-message">Message (optional)</Label>
              <Textarea
                id="user-message"
                placeholder="Add a message with the shared task..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleUserShare} 
              disabled={isSharing}
              className="w-full"
            >
              {isSharing ? 'Sharing...' : 'Share with User'}
            </Button>
          </TabsContent>
          
          <TabsContent value="qr" className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a QR code that anyone can scan to access your shared task
              </p>
              
              <Button 
                onClick={handleQRCodeShare} 
                disabled={isSharing}
                className="w-full"
                size="lg"
              >
                <QrCode className="w-5 h-5 mr-2" />
                {isSharing ? 'Generating...' : 'Generate QR Code'}
              </Button>
              
              <div className="text-xs text-muted-foreground">
                Perfect for sharing tasks between mobile and desktop devices
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
    
    <QRCodeShare
      isOpen={showQRCode}
      onClose={() => setShowQRCode(false)}
      shareUrl={shareUrl}
      taskTitle={taskTitle}
      taskCategory={taskCategory}
      taskPriority={taskPriority}
    />
    </>
  );
}