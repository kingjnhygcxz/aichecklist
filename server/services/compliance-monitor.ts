import { sendEmail } from '../email-service';
import { log } from '../vite';

const ADMIN_EMAIL = 'admin@aichecklist.io';

const ILLEGAL_KEYWORDS = [
  'bomb', 'explosive', 'weapon', 'gun', 'firearm', 'ammunition',
  'murder', 'kill', 'assassinate', 'hitman',
  'drug', 'cocaine', 'heroin', 'meth', 'fentanyl', 'narcotics',
  'child porn', 'cp', 'minor', 'underage', 'pedophile',
  'hack', 'ddos', 'ransomware', 'malware', 'phishing', 'exploit',
  'fraud', 'scam', 'launder', 'counterfeit',
  'terrorism', 'terrorist', 'isis', 'al-qaeda', 'jihad',
  'human trafficking', 'slavery', 'smuggle',
  'jailbreak', 'bypass', 'ignore previous', 'ignore instructions',
  'suicide', 'self-harm', 'how to die',
  'steal', 'rob', 'break into', 'pickpocket',
  'identity theft', 'social security', 'credit card number',
  'poison', 'toxic', 'lethal dose',
];

const SUSPICIOUS_PATTERNS = [
  /how (to|can i|do i) (make|build|create) (a )?(bomb|explosive|weapon)/i,
  /how (to|can i|do i) (hack|break into|steal|scam)/i,
  /how (to|can i|do i) (kill|murder|hurt|harm)/i,
  /how (to|can i|do i) (buy|sell|get) (drugs|weapons|guns)/i,
  /ignore (all )?(previous|prior|above) (instructions|prompts|rules)/i,
  /you are now|pretend (to be|you are)|roleplay as/i,
  /bypass (safety|security|filters|restrictions)/i,
  /\b(ssn|social security number|credit card|cvv|pin)\b/i,
];

interface ComplianceCheckResult {
  isSuspicious: boolean;
  matchedKeywords: string[];
  matchedPatterns: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UserContext {
  userId: number;
  email: string;
  username?: string;
  ipAddress?: string;
}

export function checkForIllegalContent(message: string): ComplianceCheckResult {
  const lowerMessage = message.toLowerCase();
  const matchedKeywords: string[] = [];
  const matchedPatterns: string[] = [];
  
  for (const keyword of ILLEGAL_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(message)) {
      matchedPatterns.push(pattern.source);
    }
  }
  
  const isSuspicious = matchedKeywords.length > 0 || matchedPatterns.length > 0;
  
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (matchedPatterns.length > 0) {
    severity = 'high';
  }
  if (matchedKeywords.length >= 3 || matchedPatterns.length >= 2) {
    severity = 'critical';
  } else if (matchedKeywords.length >= 1) {
    severity = 'medium';
  }
  
  const criticalKeywords = ['bomb', 'explosive', 'terrorism', 'child porn', 'murder', 'human trafficking'];
  if (matchedKeywords.some(k => criticalKeywords.includes(k))) {
    severity = 'critical';
  }
  
  return {
    isSuspicious,
    matchedKeywords,
    matchedPatterns,
    severity,
  };
}

export async function alertAdminOfSuspiciousActivity(
  message: string,
  result: ComplianceCheckResult,
  userContext: UserContext
): Promise<void> {
  if (!result.isSuspicious) return;
  
  const severityEmoji = {
    low: '🟡',
    medium: '🟠',
    high: '🔴',
    critical: '🚨',
  };
  
  const timestamp = new Date().toISOString();
  
  log(`[COMPLIANCE] ${severityEmoji[result.severity]} Suspicious activity detected - User: ${userContext.email} (ID: ${userContext.userId}) - Severity: ${result.severity.toUpperCase()}`, 'warn');
  log(`[COMPLIANCE] Matched keywords: ${result.matchedKeywords.join(', ') || 'none'}`, 'warn');
  log(`[COMPLIANCE] Matched patterns: ${result.matchedPatterns.length} pattern(s)`, 'warn');
  
  const truncatedMessage = message.length > 500 ? message.substring(0, 500) + '...' : message;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${result.severity === 'critical' ? '#dc2626' : result.severity === 'high' ? '#ea580c' : '#f59e0b'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${severityEmoji[result.severity]} AIDOMO Compliance Alert</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Severity: ${result.severity.toUpperCase()}</p>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
        <h2 style="margin-top: 0; color: #1e293b;">User Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 120px;">User ID:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${userContext.userId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${userContext.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Username:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${userContext.username || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">IP Address:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${userContext.ipAddress || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Timestamp:</td>
            <td style="padding: 8px 0;">${timestamp}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
        <h2 style="margin-top: 0; color: #1e293b;">Detection Details</h2>
        
        <div style="margin-bottom: 15px;">
          <strong>Matched Keywords:</strong>
          <div style="margin-top: 5px;">
            ${result.matchedKeywords.length > 0 
              ? result.matchedKeywords.map(k => `<span style="background: #fef2f2; color: #dc2626; padding: 2px 8px; border-radius: 4px; margin-right: 5px; font-size: 13px;">${k}</span>`).join('')
              : '<span style="color: #6b7280;">None</span>'}
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>Pattern Matches:</strong>
          <div style="margin-top: 5px; color: #6b7280;">
            ${result.matchedPatterns.length} suspicious pattern(s) detected
          </div>
        </div>
        
        <div>
          <strong>User Message (truncated):</strong>
          <div style="margin-top: 10px; background: #f1f5f9; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 13px; word-break: break-word; white-space: pre-wrap;">
${truncatedMessage}
          </div>
        </div>
      </div>
      
      <div style="background: #1e293b; color: white; padding: 15px 20px; border-radius: 0 0 8px 8px; font-size: 12px;">
        <p style="margin: 0;">This is an automated compliance alert from AIChecklist.io</p>
        <p style="margin: 5px 0 0 0; opacity: 0.7;">Review this activity and take appropriate action if necessary.</p>
      </div>
    </div>
  `;
  
  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `${severityEmoji[result.severity]} [${result.severity.toUpperCase()}] AIDOMO Compliance Alert - User ${userContext.userId}`,
      html: emailHtml,
    });
    log(`[COMPLIANCE] Alert email sent to admin for user ${userContext.userId}`, 'info');
  } catch (error) {
    log(`[COMPLIANCE] Failed to send alert email: ${error}`, 'error');
  }
}

export async function monitorAIRequest(
  message: string,
  userContext: UserContext
): Promise<ComplianceCheckResult> {
  const result = checkForIllegalContent(message);
  
  if (result.isSuspicious) {
    await alertAdminOfSuspiciousActivity(message, result, userContext);
  }
  
  return result;
}
