import * as crypto from 'crypto';
import { db } from './db';
import { logger } from './logger';

// Secure audit logging system for customer requests
// Only AICHECKLIST staff can access for troubleshooting

interface SecureAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  endpoint: string;
  method: string;
  requestHash: string; // Hashed request data for privacy
  responseStatus: number;
  errorType?: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  encryptedPayload?: string; // Encrypted sensitive data
}

class SecureAuditLogger {
  private readonly encryptionKey: Buffer;
  private readonly staffAccessKey: string;

  constructor() {
    // Generate secure keys - in production these should be from environment variables
    this.encryptionKey = this.deriveKey(process.env.AUDIT_ENCRYPTION_KEY || this.generateSecureKey());
    this.staffAccessKey = process.env.STAFF_ACCESS_KEY || this.generateSecureKey();
    
    if (!process.env.AUDIT_ENCRYPTION_KEY) {
      logger.warn('AUDIT_ENCRYPTION_KEY not set, using generated key (not recommended for production)');
    }
  }

  private generateSecureKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private deriveKey(input: string): Buffer {
    // Derive a proper 32-byte key from any input string using SHA-256
    return crypto.createHash('sha256').update(input).digest();
  }

  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedData: string, staffKey: string): string | null {
    try {
      // Verify staff access key
      if (staffKey !== this.staffAccessKey) {
        logger.warn('Unauthorized audit log access attempt');
        return null;
      }

      const parts = encryptedData.split(':');
      if (parts.length !== 3) return null;

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      // Validate auth tag length to prevent tag truncation attacks
      if (authTag.length !== 16) {
        logger.warn('Invalid auth tag length detected - possible forgery attempt');
        return null;
      }

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv, {
        authTagLength: 16 // GCM standard 128-bit auth tag
      });
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Failed to decrypt audit log:', error);
      return null;
    }
  }

  private hashRequest(data: any): string {
    const dataString = JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16);
  }

  async logSecureRequest(
    userId: string,
    endpoint: string,
    method: string,
    requestData: any,
    responseStatus: number,
    req: any,
    errorType?: string
  ): Promise<void> {
    try {
      const auditLog: SecureAuditLog = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId,
        endpoint,
        method,
        requestHash: this.hashRequest(requestData),
        responseStatus,
        errorType,
        ipAddress: this.getClientIP(req),
        userAgent: req.headers['user-agent'] || 'Unknown',
        sessionId: req.headers['authorization']?.substring(0, 10) || 'None',
        encryptedPayload: this.encrypt(JSON.stringify({
          timestamp: new Date().toISOString(),
          endpoint,
          method,
          userId,
          requestHash: this.hashRequest(requestData),
          responseStatus,
          errorType
        }))
      };

      // Store in secure audit table (would need to create this table)
      logger.info('Secure audit log created', {
        id: auditLog.id,
        userId: auditLog.userId,
        endpoint: auditLog.endpoint,
        method: auditLog.method,
        responseStatus: auditLog.responseStatus,
        timestamp: auditLog.timestamp
      });

      // In production, this would store to a separate secure database
      // For now, we'll use secure logging
      this.storeAuditLog(auditLog);

    } catch (error) {
      logger.error('Failed to create secure audit log:', error);
    }
  }

  private getClientIP(req: any): string {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           'Unknown';
  }

  private async storeAuditLog(auditLog: SecureAuditLog): Promise<void> {
    // In production, this would store to a separate secure audit database
    // accessible only by AICHECKLIST staff with proper authentication
    
    // For now, we'll create a secure log entry
    const secureLogEntry = {
      audit_id: auditLog.id,
      timestamp: auditLog.timestamp,
      user_id_hash: crypto.createHash('sha256').update(String(auditLog.userId)).digest('hex').substring(0, 16),
      endpoint: auditLog.endpoint,
      method: auditLog.method,
      status: auditLog.responseStatus,
      ip_hash: crypto.createHash('sha256').update(auditLog.ipAddress).digest('hex').substring(0, 16),
      encrypted_payload: auditLog.encryptedPayload
    };

    logger.info('SECURE_AUDIT_LOG', secureLogEntry);
  }

  // Staff-only method to retrieve audit logs for troubleshooting
  async getAuditLogs(
    staffAccessKey: string,
    filters: {
      userId?: string;
      endpoint?: string;
      dateFrom?: Date;
      dateTo?: Date;
      errorOnly?: boolean;
    } = {}
  ): Promise<any[] | null> {
    
    // Verify staff access
    if (staffAccessKey !== this.staffAccessKey) {
      logger.warn('Unauthorized audit log access attempt');
      return null;
    }

    logger.info('STAFF_AUDIT_ACCESS', {
      timestamp: new Date(),
      filters,
      authorized: true
    });

    // In production, this would query the secure audit database
    // For now, return placeholder indicating staff access is required
    return [{
      message: "Audit logs available only to authorized AICHECKLIST staff",
      access_method: "Contact system administrator with valid staff credentials",
      security_note: "All customer interactions are logged securely and encrypted"
    }];
  }

  // Method to verify staff access key
  verifyStaffAccess(providedKey: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(providedKey),
      Buffer.from(this.staffAccessKey)
    );
  }
}

export const secureAuditLogger = new SecureAuditLogger();

// Additional security middleware for DomoAI requests
export function createSecureDomoAIMiddleware() {
  return async (req: any, res: any, next: any) => {
    console.log('[MIDDLEWARE] createSecureDomoAIMiddleware entered');
    try {
      // Rate limiting per user
      const userId = req.userId;
      console.log('[MIDDLEWARE] userId:', userId);
      const endpoint = req.path;
      
      // Security checks - only check actual message content, not JSON property names
      const suspiciousPatterns = [
        'sql injection', 'drop table', 'delete from', 
        'give me passwords', 'show passwords', 'database dump',
        'bypass security', 'bypass auth'
      ];

      // Only check actual message content, not the full JSON body
      // This prevents false positives from property names like "tokensUsed"
      const messageContent = req.body?.messages?.map((m: any) => m?.content || '').join(' ').toLowerCase() || '';
      const userMessage = req.body?.message?.toLowerCase() || '';
      const contentToCheck = messageContent + ' ' + userMessage;
      
      const isSuspicious = suspiciousPatterns.some(pattern => 
        contentToCheck.includes(pattern)
      );

      if (isSuspicious) {
        await secureAuditLogger.logSecureRequest(
          userId,
          endpoint,
          req.method,
          'SUSPICIOUS_REQUEST_BLOCKED',
          403,
          req,
          'SECURITY_VIOLATION'
        );

        return res.status(403).json({
          message: "Request blocked for security reasons",
          support: "Contact support if you believe this is an error"
        });
      }

      // Origin validation
      const allowedOrigins = [
        req.hostname,
        'aichecklist.com',
        'localhost'
      ];

      const origin = req.headers.origin || req.headers.referer;
      const isValidOrigin = !origin || allowedOrigins.some(allowed => 
        origin.includes(allowed)
      );

      if (!isValidOrigin) {
        await secureAuditLogger.logSecureRequest(
          userId,
          endpoint,
          req.method,
          'INVALID_ORIGIN',
          403,
          req,
          'ORIGIN_VIOLATION'
        );

        return res.status(403).json({
          message: "Access denied: Invalid origin"
        });
      }

      // Log successful request start
      req.auditStartTime = Date.now();
      next();

    } catch (error) {
      logger.error('Security middleware error:', error);
      res.status(500).json({ message: "Security check failed" });
    }
  };
}

// Middleware to log completion of requests
export function createAuditCompletionMiddleware() {
  return async (req: any, res: any, next: any) => {
    console.log('[MIDDLEWARE] createAuditCompletionMiddleware entered');
    const originalSend = res.send;
    
    res.send = function(data: any) {
      console.log('[MIDDLEWARE] res.send called, statusCode:', res.statusCode);
      // Log request completion
      if (req.userId && req.auditStartTime) {
        secureAuditLogger.logSecureRequest(
          req.userId,
          req.path,
          req.method,
          'REQUEST_COMPLETED',
          res.statusCode,
          req,
          res.statusCode >= 400 ? 'ERROR' : undefined
        );
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
}