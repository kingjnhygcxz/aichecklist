import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsOfService({ isOpen, onClose, onAccept }: TermsOfServiceProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Terms of Service & License Agreement</DialogTitle>
          <DialogDescription>
            Please read these terms carefully before using AIChecklist.io
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] p-4 border rounded-md">
          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-bold mb-3">1. PROHIBITION OF ILLEGAL ACTIVITY</h3>
              <p className="text-sm mb-2">
                AIChecklist.io and its AI assistant AIDOMO are automated, AI-driven services. 
                By using this platform, you explicitly acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>ANY AND ALL ILLEGAL ACTIVITY IS STRICTLY PROHIBITED, including but not limited to: fraud, money laundering, terrorism, human trafficking, drug trafficking, child exploitation, hacking, cyberattacks, harassment, threats of violence, or any activity that violates local, state, federal, or international law</li>
                <li>You shall NOT use this service, its AI features, or any outputs for planning, facilitating, or executing illegal activities</li>
                <li>You shall NOT attempt to manipulate, deceive, or "jailbreak" our AI systems to produce harmful, illegal, or unethical content</li>
                <li>All AI interactions and requests may be monitored, logged, and reported to law enforcement if illegal activity is suspected</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">2. USER RESPONSIBILITY & INDEMNIFICATION</h3>
              <p className="text-sm mb-2">
                This is an automated, AI-driven platform. As such:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>YOU BEAR THE FULL BURDEN AND RESPONSIBILITY for any and all use of this service, including any illegal, harmful, or unethical activities conducted through your account</li>
                <li>AIChecklist.io, AIDOMO, and all associated entities, owners, officers, employees, and agents are HELD COMPLETELY HARMLESS from any liability arising from your use or misuse of this automated service</li>
                <li>You agree to INDEMNIFY, DEFEND, AND HOLD HARMLESS AIChecklist.io and its affiliates from any claims, damages, losses, costs, or legal fees arising from your violation of these terms or any illegal activity</li>
                <li>We reserve the right to cooperate fully with law enforcement investigations and to provide all available data, logs, and records related to suspected illegal activity</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">3. ACCEPTABLE USE POLICY</h3>
              <p className="mb-2">By using this service, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Use the software only for legitimate task management and productivity purposes</li>
                <li>NOT attempt to reverse engineer, copy, or replicate the software</li>
                <li>NOT use the software's outputs, data, or insights for competitive analysis against the service provider</li>
                <li>NOT engage in any trading, financial, or business activities that directly compete with or undermine the service provider</li>
                <li>NOT access the service through automated means without explicit permission</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">4. LICENSE RESTRICTIONS</h3>
              <p className="mb-2">This license does NOT grant you the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Use the software for benchmarking against competing services</li>
                <li>Extract data or insights for competitive intelligence purposes</li>
                <li>Attempt to interfere with, disrupt, or harm the service provider's business</li>
                <li>Create derivative works or competing products based on this software</li>
                <li>Share, resell, or redistribute access to premium features</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">5. ACCOUNT TERMINATION</h3>
              <p className="text-sm">
                Violation of these terms, particularly illegal activity or competitive use restrictions, will result in:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                <li>Immediate account suspension without notice</li>
                <li>Forfeiture of any subscription fees paid</li>
                <li>Reporting to law enforcement where applicable</li>
                <li>Legal action for breach of contract where applicable</li>
                <li>Permanent ban from future service access</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">6. DATA PROTECTION & PRIVACY</h3>
              <p className="text-sm mb-2">
                We are committed to protecting your personal data and privacy. By using this service, you acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Your task data is stored securely and used only for service provision</li>
                <li>Analytics data may be collected to improve service quality</li>
                <li>We do not sell personal information to third parties</li>
                <li>You may request data deletion in accordance with applicable privacy laws</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-3">7. SESSION PERSISTENCE ("STAY LOGGED IN") DISCLAIMER</h3>
              <p className="text-sm mb-2">
                We do not recommend using the "Keep me logged in for 30 days" feature. 
                For maximum security, we strongly recommend that you:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Log in each time you access your account, OR</li>
                <li>Use the email code authentication method for secure, passwordless login</li>
              </ul>
              <p className="text-sm mt-2">
                AIChecklist.io and all associated doing-business-as entities (DBAs) DO NOT SUPPORT the "Stay Logged In" feature. 
                If you choose to enable this feature, you do so entirely at your own risk.
              </p>
              <p className="text-sm mt-2">
                Liability Waiver: By selecting the "Keep me logged in for 30 days" option, you acknowledge and agree that 
                AIChecklist.io and all associated entities are absolved of any and all liability for unauthorized account access, 
                data breaches, or security incidents that may result from extended session persistence. You assume full responsibility 
                for the security of your account when using this convenience feature.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-3">8. SERVICE AVAILABILITY</h3>
              <p className="text-sm">
                While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. 
                Premium features may have usage limits as outlined in your subscription plan.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-3">9. LIMITATION OF LIABILITY</h3>
              <p className="text-sm">
                This software is provided "as is" without warranty. We are not liable for any damages 
                arising from the use or inability to use this service, including but not limited to 
                lost productivity, data loss, or business interruption.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-3">10. PROHIBITED COMPETITIVE USE</h3>
              <p className="text-sm mb-2">
                CUSTOMERS ARE FORBIDDEN TO TRADE AGAINST THE SERVICE PROVIDER WITH THIS SOFTWARE. 
                ANY SUCH ATTEMPTS WILL NOT WORK AND WILL RESULT IN IMMEDIATE ACCOUNT TERMINATION.
              </p>
              <p className="text-sm">
                This software is provided under license for legitimate productivity and task management purposes only.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-3">11. GEOGRAPHIC RESTRICTIONS & EXPORT COMPLIANCE</h3>
              <p className="text-sm mb-2">
                In compliance with U.S. export control laws, sanctions regulations, and international trade restrictions, 
                access to AIChecklist.io and all associated services is STRICTLY PROHIBITED from the following countries and territories:
              </p>
              <p className="text-sm mb-1">Comprehensively Sanctioned:</p>
              <ul className="list-disc list-inside space-y-1 text-sm mb-2">
                <li>Iran</li>
                <li>North Korea</li>
                <li>Cuba</li>
                <li>Syria</li>
              </ul>
              <p className="text-sm mb-1">Targeted Restrictions:</p>
              <ul className="list-disc list-inside space-y-1 text-sm mb-2">
                <li>Belarus</li>
                <li>Venezuela</li>
                <li>Afghanistan</li>
                <li>Myanmar</li>
                <li>Libya</li>
                <li>Zimbabwe</li>
                <li>Mexico</li>
              </ul>
              <p className="text-sm mb-2">
                NOTICE: Individuals, entities, or any persons located in, operating from, or citizens of the above-listed countries 
                are NOT AUTHORIZED to access, use, or interact with AIChecklist.io, AIDOMO, or any related services for ANY REASON WHATSOEVER.
              </p>
              <p className="text-sm">
                Attempts to circumvent these geographic restrictions through VPN, proxy servers, or any other means 
                constitutes a violation of these terms and may be reported to appropriate authorities.
              </p>
            </div>

            <div>
              <p className="text-sm">
                By clicking "I Accept", you acknowledge that you have read, understood, and agree to be bound by these terms. 
                This agreement is effective immediately and remains in effect for the duration of your use of this service.
              </p>
              <p className="text-sm mt-2">
                Version 2.0 - Effective Date: December 27, 2025
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onAccept} className="bg-blue-600 hover:bg-blue-700">
            I Accept These Terms
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}