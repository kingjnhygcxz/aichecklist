import { AchievementList } from "@/components/achievements/AchievementList";
import { Trophy, Share2, Printer } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ChartShareDialog } from "@/components/sharing/ChartShareDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';

export default function Achievements() {
  const { toast } = useToast();

  const handlePrint = async () => {
    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          request: 'print achievements progress report'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate achievements report');
      }

      const result = await response.json();
      
      if (result.success) {
        const printWindow = window.open('', '_blank', 'noopener,noreferrer');
        if (printWindow) {
          // Safely construct document using DOM methods instead of document.write
          const doc = printWindow.document;
          doc.open();
          
          // Create document structure
          const html = doc.createElement('html');
          const head = doc.createElement('head');
          const body = doc.createElement('body');
          
          // Set title safely
          const title = doc.createElement('title');
          title.textContent = result.title || 'Achievements Report';
          head.appendChild(title);
          
          // Add styles safely
          const style = doc.createElement('style');
          style.textContent = `
            body { margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; }
            }
          `;
          head.appendChild(style);
          
          // Sanitize and set body content safely
          if (result.content) {
            const sanitizedContent = DOMPurify.sanitize(result.content, {
              ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th'],
              ALLOWED_ATTR: ['style', 'class'],
              FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'href', 'src'],
              FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'select', 'textarea', 'a', 'img']
            });
            const parser = new DOMParser();
            const contentDoc = parser.parseFromString(sanitizedContent, 'text/html');
            if (contentDoc.body) {
              while (contentDoc.body.firstChild) {
                body.appendChild(doc.importNode(contentDoc.body.firstChild, true));
              }
            }
          }
          
          // Assemble the document
          html.appendChild(head);
          html.appendChild(body);
          doc.appendChild(html);
          doc.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
        
        toast({
          title: "Achievements Report Generated",
          description: "Your achievements progress report is ready for printing!"
        });
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error",
        description: "Failed to generate achievements report. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Achievements</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Track your progress and unlock achievements as you complete tasks and reach milestones.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handlePrint}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          
          <ChartShareDialog chartType="achievements">
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Progress
            </Button>
          </ChartShareDialog>
        </div>
      </div>
      
      <div data-chart-container>
        <AchievementList />
      </div>
      </div>
    </div>
  );
}