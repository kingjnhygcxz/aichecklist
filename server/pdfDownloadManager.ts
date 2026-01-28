import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

interface PdfRecord {
  token: string;
  filePath: string;
  userId: number;
  createdAt: Date;
  expiresAt: Date;
  downloaded: boolean;
}

export class PdfDownloadManager {
  private pdfs: Map<string, PdfRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  // PDF expires after 1 hour or after download
  private readonly PDF_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
  
  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Register a PDF for download
   * Returns a secure token for downloading
   */
  async registerPdf(filePath: string, userId: number): Promise<string> {
    const token = this.generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.PDF_EXPIRY_MS);

    const record: PdfRecord = {
      token,
      filePath,
      userId,
      createdAt: now,
      expiresAt,
      downloaded: false
    };

    this.pdfs.set(token, record);

    logger.info('PDF registered for download', {
      token: token.substring(0, 8) + '...',
      userId,
      expiresAt: expiresAt.toISOString()
    });

    return token;
  }

  /**
   * Get PDF record by token
   * Validates token and checks expiration
   */
  getPdfRecord(token: string, userId: number): PdfRecord | null {
    const record = this.pdfs.get(token);

    if (!record) {
      logger.warn('PDF not found', { token: token.substring(0, 8) + '...' });
      return null;
    }

    // Check if PDF belongs to the requesting user
    if (record.userId !== userId) {
      logger.warn('Unauthorized PDF access attempt', {
        token: token.substring(0, 8) + '...',
        requestingUserId: userId,
        ownerUserId: record.userId
      });
      return null;
    }

    // Check if PDF has expired
    if (new Date() > record.expiresAt) {
      logger.info('PDF expired', { token: token.substring(0, 8) + '...' });
      this.cleanupPdf(token);
      return null;
    }

    // Check if file exists
    if (!fs.existsSync(record.filePath)) {
      logger.error('PDF file not found on disk', { 
        token: token.substring(0, 8) + '...',
        filePath: record.filePath
      });
      this.pdfs.delete(token);
      return null;
    }

    return record;
  }

  /**
   * Mark PDF as downloaded
   * This triggers cleanup after a short grace period
   */
  markAsDownloaded(token: string): void {
    const record = this.pdfs.get(token);
    if (record) {
      record.downloaded = true;
      
      // Schedule cleanup after 5 minutes to allow retry
      setTimeout(() => {
        this.cleanupPdf(token);
      }, 5 * 60 * 1000);

      logger.info('PDF marked as downloaded', {
        token: token.substring(0, 8) + '...'
      });
    }
  }

  /**
   * Clean up a single PDF (remove file and record)
   */
  private cleanupPdf(token: string): void {
    const record = this.pdfs.get(token);
    if (!record) return;

    // Delete the file
    try {
      if (fs.existsSync(record.filePath)) {
        fs.unlinkSync(record.filePath);
        logger.info('PDF file deleted', {
          token: token.substring(0, 8) + '...',
          filePath: path.basename(record.filePath)
        });
      }
    } catch (error) {
      logger.error('Failed to delete PDF file', {
        error,
        token: token.substring(0, 8) + '...',
        filePath: record.filePath
      });
    }

    // Remove from tracking
    this.pdfs.delete(token);
  }

  /**
   * Periodic cleanup of expired PDFs
   */
  private startCleanupTimer(): void {
    // Run cleanup every 10 minutes
    this.cleanupInterval = setInterval(() => {
      const now = new Date();
      const expiredTokens: string[] = [];

      for (const [token, record] of this.pdfs.entries()) {
        // Clean up if expired or downloaded more than 5 minutes ago
        const downloadedAndOld = record.downloaded && 
          (now.getTime() - record.createdAt.getTime() > 5 * 60 * 1000);
        
        if (now > record.expiresAt || downloadedAndOld) {
          expiredTokens.push(token);
        }
      }

      if (expiredTokens.length > 0) {
        logger.info(`Cleaning up ${expiredTokens.length} expired PDFs`);
        expiredTokens.forEach(token => this.cleanupPdf(token));
      }
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  /**
   * Stop the cleanup timer (for graceful shutdown)
   */
  stopCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get statistics for monitoring
   */
  getStats(): { total: number; expired: number; downloaded: number } {
    const now = new Date();
    let expired = 0;
    let downloaded = 0;

    for (const record of this.pdfs.values()) {
      if (now > record.expiresAt) expired++;
      if (record.downloaded) downloaded++;
    }

    return {
      total: this.pdfs.size,
      expired,
      downloaded
    };
  }
}

export const pdfDownloadManager = new PdfDownloadManager();
