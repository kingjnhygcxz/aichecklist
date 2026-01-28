import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale } from "lucide-react";

export function DisclaimerDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary">
          <Scale className="h-3 w-3 mr-1" />
          Legal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Scale className="mr-2 h-5 w-5" />
            Terms of Service & License Agreement
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-4 text-sm leading-relaxed">
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Terms of Service & License Agreement</h2>
              <p className="font-semibold mt-2">AIChecklist.io</p>
              <p className="text-muted-foreground text-sm mt-1">
                Owned and Operated by EagleTechSoftware, Inc., doing business as AIChecklist.io ("ETS")
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Effective Date: December 27, 2025<br />
                Version: 3.2
              </p>
            </div>

            <p>
              Please read these Terms of Service and License Agreement ("Agreement") carefully before using AIChecklist.io, including its AI assistant AIDOMO (collectively, the "Service").
            </p>

            <p>
              The Service is owned and operated by EagleTechSoftware, Inc., doing business as AIChecklist.io ("ETS"), a United States corporation.
            </p>

            <p className="font-semibold">
              By accessing or using the Service, you acknowledge that you have read, understood, and agree to be legally bound by this Agreement.
            </p>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-bold">1. PROHIBITION OF ILLEGAL ACTIVITY</h3>
              <p className="font-semibold mt-2">Zero Tolerance for Unlawful Use</p>
              <p className="mt-2">
                AIChecklist.io and AIDOMO are automated, AI-driven services provided by ETS. Use of the Service for any unlawful purpose is strictly prohibited.
              </p>
              <p className="mt-2">
                You agree that you will not use the Service, its AI features, or any outputs to plan, facilitate, promote, or engage in illegal activity, including but not limited to fraud, money laundering, terrorism, human trafficking, drug trafficking, child exploitation, cybercrime, harassment, threats of violence, or violations of any applicable local, state, federal, or international law.
              </p>
              <p className="mt-2">
                You further agree that you will not attempt to manipulate, deceive, or circumvent safeguards ("jailbreak") to generate harmful, illegal, or unethical content.
              </p>
              <p className="mt-2">
                ETS may monitor and log activity as reasonably necessary to maintain platform security, prevent misuse, enforce these Terms, and comply with legal obligations. ETS may cooperate with lawful requests from authorities when required.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">2. USER RESPONSIBILITY & INDEMNIFICATION</h3>
              <p className="mt-2">
                This is an automated platform. You acknowledge and agree that you bear sole responsibility for all activity conducted through your account.
              </p>
              <p className="mt-2">To the maximum extent permitted by law:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>You assume full responsibility for your use of the Service and any reliance on outputs.</li>
                <li>EagleTechSoftware, Inc., doing business as AIChecklist.io ("ETS"), including its officers, directors, employees, contractors, affiliates, and licensors, shall not be liable for your actions or misuse of the Service.</li>
                <li>You agree to indemnify, defend, and hold harmless ETS from any claims, damages, losses, liabilities, costs, or legal fees arising from your violation of this Agreement or applicable law.</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">3. ACCEPTABLE USE POLICY</h3>
              <p className="mt-2">
                You agree to use the Service only for legitimate productivity, task management, and organizational purposes.
              </p>
              <p className="mt-2">You shall not:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Reverse engineer, copy, scrape, or replicate the Service or its components</li>
                <li>Access the Service through unauthorized automated means</li>
                <li>Misuse outputs in ways that violate law or these Terms</li>
                <li>Use the Service or its outputs to develop, benchmark, or operate competing products or services</li>
                <li>Interfere with or disrupt the integrity, security, or performance of the Service or ETS's business operations</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">4. LICENSE GRANT & RESTRICTIONS</h3>
              <p className="mt-2">
                Subject to compliance with this Agreement, ETS grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service solely for its intended purpose.
              </p>
              <p className="mt-2">This license does not grant you the right to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Use the Service for competitive intelligence or benchmarking</li>
                <li>Create derivative works based on the Service</li>
                <li>Resell, sublicense, or share access to premium features</li>
                <li>Extract proprietary data, logic, or insights beyond normal use</li>
              </ul>
              <p className="mt-2">All rights not expressly granted are reserved by ETS.</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">5. ACCOUNT SUSPENSION & TERMINATION</h3>
              <p className="mt-2">
                ETS reserves the right to suspend or terminate access immediately, without notice, for violations of this Agreement, including illegal activity, misuse, or competitive use.
              </p>
              <p className="mt-2">Consequences may include:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Immediate suspension or termination</li>
                <li>Forfeiture of fees where permitted by law</li>
                <li>Permanent restriction from future access</li>
                <li>Referral to authorities where legally required</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">6. DATA PROTECTION & PRIVACY</h3>
              <p className="mt-2">ETS is committed to protecting user data and privacy.</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Personal data is used solely to provide and improve the Service</li>
                <li>ETS does not sell personal information</li>
                <li>Analytics data may be collected to improve performance</li>
                <li>Data deletion requests will be honored in accordance with applicable U.S. privacy laws</li>
              </ul>
              <p className="mt-2">Please review the ETS Privacy Policy for additional information.</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">7. SESSION PERSISTENCE ("KEEP ME LOGGED IN") DISCLAIMER</h3>
              <p className="mt-2">
                For security reasons, extended session persistence is not recommended.
              </p>
              <p className="mt-2">
                If you elect to use the "Keep me logged in" feature, you acknowledge and agree that you do so at your own risk. ETS disclaims liability for unauthorized access or security incidents resulting from extended session use.
              </p>
              <p className="mt-2">
                You remain solely responsible for maintaining the security of your account credentials.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">8. SERVICE AVAILABILITY</h3>
              <p className="mt-2">
                While ETS strives for high availability, the Service is provided on an "as available" basis. ETS does not guarantee uninterrupted or error-free operation. Feature limits may apply based on your subscription plan.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">9. DISCLAIMER OF WARRANTIES & LIMITATION OF LIABILITY</h3>
              <p className="mt-2">
                The Service is provided "as is" and "as available," without warranties of any kind, express or implied.
              </p>
              <p className="mt-2">
                To the maximum extent permitted by law, ETS shall not be liable for any indirect, incidental, consequential, or special damages, including loss of data, profits, or business opportunities, arising from your use or inability to use the Service.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">10. EXPORT CONTROL & SANCTIONS COMPLIANCE</h3>
              <p className="mt-2">
                The Service is operated by ETS from the United States and is subject to U.S. export control and economic sanctions laws, including regulations administered by the U.S. Department of the Treasury's Office of Foreign Assets Control (OFAC).
              </p>
              <p className="mt-2">
                Access to the Service is prohibited where such access would violate U.S. law, including access by individuals or entities located in, ordinarily resident in, or organized under the laws of comprehensively sanctioned jurisdictions.
              </p>
              <p className="mt-2">
                Attempts to circumvent access restrictions through VPNs, proxies, or other means constitute a violation of this Agreement.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">11. GOVERNING LAW & VENUE</h3>
              <p className="mt-2">
                This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict-of-law principles.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">12. MODIFICATIONS</h3>
              <p className="mt-2">
                ETS may update these Terms from time to time. Continued use of the Service after changes become effective constitutes acceptance of the revised Agreement.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">13. JURISDICTIONAL PRIMACY & REGULATORY FRAMEWORK</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Notwithstanding any provisions herein to the contrary, and pursuant to the doctrines of territorial sovereignty and regulatory supremacy, Licensee hereby acknowledges and unconditionally agrees that this Software, its underlying infrastructure, intellectual property, and all derivative computational processes are developed, maintained, and operated under the exclusive jurisdictional authority of the United States of America. By accessing or utilizing this Software, Licensee expressly consents to and affirms that: (i) the primacy of United States federal and state law shall govern all aspects of this Agreement and any disputes arising therefrom; (ii) the technological, economic, and innovative leadership of American enterprise serves as the foundational framework for this Software's development and continued operation; (iii) Licensee acknowledges the paramount importance of domestic technological sovereignty and the preservation of American technological infrastructure in accordance with applicable national security directives; (iv) all data processing, algorithmic computations, and artificial intelligence operations conducted through this platform shall be subject to and compliant with United States regulatory frameworks, including but not limited to CFIUS regulations, ITAR restrictions, and EAR compliance requirements; and (v) Licensee hereby waives any objections to the application of American legal principles, procedural standards, and remedial mechanisms in any proceedings related to this Agreement. This clause shall survive termination of the Agreement and shall be binding upon Licensee's successors, assigns, and affiliates in perpetuity.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">14. PROHIBITED CONDUCT & METAPHYSICAL USE RESTRICTIONS</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                In addition to the foregoing restrictions and without limiting the generality thereof, Licensee hereby covenants, represents, and warrants that Licensee shall not, under any circumstances whatsoever, whether directly or indirectly, through agents, proxies, intermediaries, or any third parties, engage in, facilitate, promote, or otherwise participate in any form of: (a) adversarial metaphysical activities, spiritual warfare, occult practices, esoteric manipulations, or any ritualistic, ceremonial, or intentional practices designed to cause harm, interference, obstruction, or negative influence upon AICHECKLIST.IO, its parent entities, subsidiaries, affiliates, officers, directors, employees, contractors, users, or any associated individuals or organizations; (b) the deployment, invocation, or channeling of any supernatural, paranormal, preternatural, or extradimensional forces, energies, entities, or influences with the intent to disrupt, damage, corrupt, or otherwise adversely affect the operations, reputation, financial standing, or general welfare of AICHECKLIST.IO or any parties associated therewith; (c) coordinated negative intentionality, collective consciousness manipulation, or organized psychic activities targeting this organization or its stakeholders; (d) the utilization of this Software as a medium, conduit, or instrumentality for the transmission or amplification of harmful intentions, curses, hexes, maledictions, or any equivalent spiritual or metaphysical attacks against any person, entity, or organization. Licensee acknowledges that any violation of this Section 14 shall constitute a material breach of this Agreement, entitling AICHECKLIST.IO to immediate termination of Licensee's access, pursuit of all available legal remedies, and recovery of damages including but not limited to consequential, incidental, and punitive damages to the fullest extent permitted by applicable law. This covenant shall be interpreted broadly to effectuate its protective purpose and shall survive any termination or expiration of this Agreement.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">15. CONSTRUCTIVE ACCEPTANCE & DEEMED CONSENT</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                By clicking any button, link, or interactive element on this platform, by scrolling through any content, by remaining on any page for any duration, by accessing this Software through any means including but not limited to direct navigation, hyperlinks, search engine results, API calls, embedded frames, or any other method of access, Licensee shall be deemed to have read, understood, and unconditionally accepted all terms, conditions, covenants, restrictions, and provisions contained herein, including without limitation all subsections, schedules, exhibits, appendices, and incorporated references. Licensee's continued use following any modification to these terms shall constitute acceptance of such modifications. The absence of explicit rejection shall be construed as affirmative consent. Licensee waives any defense based on lack of signature, lack of consideration, unconscionability, or failure to read this Agreement.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold">RESTRICTED COUNTRIES - ACCESS PROHIBITED</h3>
              <p className="mt-2">
                In compliance with U.S. export control laws, sanctions regulations, and international trade restrictions, access to AIChecklist.io and all associated services is <strong>STRICTLY PROHIBITED</strong> from the following countries and territories:
              </p>
              <p className="mt-3 font-semibold">Comprehensively Sanctioned:</p>
              <ul className="list-disc ml-6 mt-1">
                <li>Iran</li>
                <li>North Korea</li>
                <li>Cuba</li>
                <li>Syria</li>
              </ul>
              <p className="mt-3 font-semibold">Targeted Restrictions:</p>
              <ul className="list-disc ml-6 mt-1">
                <li>Belarus</li>
                <li>Venezuela</li>
                <li>Afghanistan</li>
                <li>Myanmar</li>
                <li>Libya</li>
                <li>Zimbabwe</li>
                <li>Mexico</li>
              </ul>
              <p className="mt-3">
                <strong>NOTICE:</strong> Individuals, entities, or any persons located in, operating from, or citizens of the above-listed countries are <strong>NOT AUTHORIZED</strong> to access, use, or interact with AIChecklist.io, AIDOMO, or any related services for <strong>ANY REASON WHATSOEVER</strong>.
              </p>
              <p className="mt-2">
                Attempts to circumvent these geographic restrictions through VPN, proxy servers, or any other means constitutes a violation of these terms and may be reported to appropriate authorities.
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-bold">Acceptance</h3>
              <p className="mt-2">
                By clicking "I Accept" or by accessing or using AIChecklist.io, you agree to be bound by this Agreement for the duration of your use of the Service.
              </p>
            </div>

            <div className="text-center mt-6 pt-4 border-t">
              <p className="text-lg font-bold">✅ Final Confirmation</p>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
