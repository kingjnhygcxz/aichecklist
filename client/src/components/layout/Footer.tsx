import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { DisclaimerDialog } from "@/components/legal/DisclaimerDialog";
import sslBadge from "@assets/GPT_Image_1_create_for_me_a_site_cert_icon256bit_AES_make_it_l_0_76872523-4840-4257-b980-89f1078202af_1762655837304.png";

export function Footer() {
  return (
    <footer className="border-t border-border py-4 px-6">
      <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row justify-between items-center text-muted-foreground text-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <p>AICHECKLIST.IO AND ETS © {new Date().getFullYear()}</p>
            <p className="text-xs mt-1">All rights reserved.</p>
          </div>
          <img 
            src={sslBadge} 
            alt="Site protected with 256-bit AES encryption" 
            className="h-16 w-auto object-contain"
            data-testid="ssl-certificate-badge"
          />
        </div>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary" asChild>
            <Link href="/help">Help</Link>
          </Button>
          <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
          <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary" asChild>
            <Link href="/feedback">Feedback</Link>
          </Button>
          <DisclaimerDialog />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
