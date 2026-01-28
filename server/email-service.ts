import { randomBytes } from 'crypto';
import { logger } from './logger';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Store verification tokens temporarily (in production, use Redis or database)
const verificationTokens = new Map<string, {
  email: string;
  userId: number;
  expiresAt: Date;
  username: string;
}>();

/**
 * Generates a secure email verification token with enhanced entropy
 */
export function generateVerificationToken(): string {
  // Generate a more secure token with timestamp and random components
  const timestamp = Date.now().toString(36);
  const randomPart1 = randomBytes(24).toString('hex');
  const randomPart2 = randomBytes(16).toString('base64url');
  const randomPart3 = randomBytes(8).toString('hex');
  
  // Combine and shuffle for maximum entropy
  return `${randomPart1}${timestamp}${randomPart2}${randomPart3}`.replace(/[+=\/]/g, '');
}

/**
 * Stores a verification token for email confirmation
 */
export function storeVerificationToken(token: string, email: string, userId: number, username: string): void {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours
  
  verificationTokens.set(token, {
    email,
    userId,
    expiresAt,
    username
  });
}

/**
 * Retrieves and validates a verification token
 */
export function getVerificationToken(token: string): {
  email: string;
  userId: number;
  username: string;
} | null {
  const tokenData = verificationTokens.get(token);
  
  if (!tokenData) {
    return null;
  }
  
  if (new Date() > tokenData.expiresAt) {
    verificationTokens.delete(token);
    return null;
  }
  
  return {
    email: tokenData.email,
    userId: tokenData.userId,
    username: tokenData.username
  };
}

/**
 * Removes a verification token (used after successful verification)
 */
export function removeVerificationToken(token: string): void {
  verificationTokens.delete(token);
}

/**
 * Create Resend client or fallback email transporter
 */
function createEmailClient() {
  // Try Resend first (recommended)
  if (process.env.RESEND_API_KEY) {
    return new Resend(process.env.RESEND_API_KEY);
  }
  
  return null;
}

function createEmailTransporter() {
  // Try MailerSend as secondary option
  if (process.env.MAILERSEND_API_KEY) {
    // Note: MailerSend will be handled separately since it doesn't use nodemailer
    return null;
  }
  
  // Try SendGrid as fallback
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Try Gmail SMTP (requires app password)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  
  // Try generic SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
  
  return null;
}

/**
 * Sends a login code email for authentication
 */
export async function sendLoginCodeEmail(email: string, code: string): Promise<boolean> {
  try {
    const fromEmail = 'noreply@aichecklist.io';
    
    // Try Resend first
    const resend = createEmailClient();
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: `AIChecklist <${fromEmail}>`,
        to: [email],
        subject: "Your AIChecklist login code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Login Code</h2>
            <p style="font-size: 16px; color: #666;">
              Enter this code to log in to AIChecklist:
            </p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #999;">
              This code expires in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
        `,
        text: `Your AIChecklist login code is: ${code}\n\nThis code expires in 10 minutes.`
      });

      if (error) {
        logger.error(`Error sending login code to ${email}:`, error);
        throw error;
      }
      
      logger.info(`Login code sent via Resend to ${email}`, { messageId: data?.id });
      return true;
    }
    
    // Try Nodemailer as fallback
    const transporter = createEmailTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `AIChecklist <${fromEmail}>`,
        to: email,
        subject: "Your AIChecklist login code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Login Code</h2>
            <p style="font-size: 16px; color: #666;">
              Enter this code to log in to AIChecklist:
            </p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #999;">
              This code expires in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
        `,
        text: `Your AIChecklist login code is: ${code}\n\nThis code expires in 10 minutes.`
      });
      
      logger.info(`Login code sent via Nodemailer to ${email}`);
      return true;
    }
    
    logger.error(`No email service configured for sending to ${email}`);
    return false;
    
  } catch (error) {
    logger.error("Failed to send login code email:", error);
    return false;
  }
}

/**
 * Sends email verification email using configured email service
 */
export async function sendVerificationEmail(email: string, token: string, username: string): Promise<boolean> {
  try {
    // Use the proper public URL for email verification
    // Get the Replit app URL from environment variables
    const publicUrl = process.env.PUBLIC_URL || 
      process.env.REPLIT_APP_URL ||
      (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : null) ||
      'https://app.aichecklist.io';
    const verificationUrl = `${publicUrl}/verify-email?token=${token}`;
    // Use the verified domain aichecklist.io instead of the subdomain
    const fromEmail = 'noreply@aichecklist.io';
    
    // Try Resend first
    const resend = createEmailClient();
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: `AIChecklist <${fromEmail}>`,
        to: [email],
        subject: "Verify your AIChecklist account",
        html: generateVerificationEmailHtml(username, verificationUrl),
        text: `Hello ${username},\n\nThank you for signing up for AIChecklist! Please verify your email by clicking this link: ${verificationUrl}\n\nThis link expires in 24 hours.\n\nBest regards,\nThe AIChecklist Team`
      });

      if (error) {
        logger.error(`Resend error sending to ${email}:`, error);
        throw error;
      }
      
      // Log success more efficiently
      logger.info(`Email verification sent via Resend to ${email}`, { messageId: data?.id });
      
      return true;
    }
    
    // Try MailerSend as fallback if available
    if (process.env.MAILERSEND_API_KEY) {
      const { MailerSend, EmailParams, Sender, Recipient } = await import('mailersend');
      const mailerSend = new MailerSend({
        apiKey: process.env.MAILERSEND_API_KEY,
      });
      
      const sentFrom = new Sender(fromEmail, "AIChecklist");
      const recipients = [new Recipient(email, username)];
      
      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("Verify your AIChecklist account")
        .setHtml(generateVerificationEmailHtml(username, verificationUrl))
        .setText(`Hello ${username},\n\nThank you for signing up for AIChecklist! Please verify your email by clicking this link: ${verificationUrl}\n\nThis link expires in 24 hours.\n\nBest regards,\nThe AIChecklist Team`);

      await mailerSend.email.send(emailParams);
      
      logger.info(`Email verification sent via MailerSend to ${email}`, {
        to: email,
        subject: 'Verify your AIChecklist account',
        username
      });
      
      return true;
    }
    
    // Fallback to other email services
    const transporter = createEmailTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Verify your AIChecklist account',
        html: generateVerificationEmailHtml(username, verificationUrl),
        text: `Hello ${username},\n\nThank you for signing up for AIChecklist! Please verify your email by clicking this link: ${verificationUrl}\n\nThis link expires in 24 hours.\n\nBest regards,\nThe AIChecklist Team`
      });
      
      logger.info(`Email verification sent via SMTP to ${email}`, {
        to: email,
        subject: 'Verify your AIChecklist account',
        username
      });
      
      return true;
    }
    
    // Development fallback - log to console
    logger.warn('No email service configured, logging verification details to console');
    console.log(`\n=== EMAIL VERIFICATION REQUIRED ===`);
    console.log(`User: ${username} (${email})`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token: ${token}`);
    console.log(`===================================\n`);
    
    return true;
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}:`, error);
    return false;
  }
}

/**
 * Generates email verification HTML content
 */
export function generateVerificationEmailHtml(username: string, verificationUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Verify AIChecklist</title></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px"><h1 style="text-align:center;color:#007bff">Welcome to AIChecklist!</h1><p>Hello ${username},</p><p>Please verify your email to complete registration:</p><div style="text-align:center;margin:20px 0"><a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background:#007bff;color:white;text-decoration:none;border-radius:4px">VERIFY EMAIL</a></div><p style="font-size:12px;color:#666">Link expires in 24 hours. If you didn't sign up, ignore this email.</p></body></html>`;
}

/**
 * Generic email sending function (mock implementation)
 * In production, integrate with your preferred email service
 */
export async function sendEmail(options: {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<boolean> {
  try {
    // Try Resend first
    const resend = createEmailClient();
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: `AIChecklist <noreply@aichecklist.io>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text
      });

      if (error) {
        logger.error(`Resend error sending to ${options.to}:`, error);
        throw error;
      }
      
      logger.info(`Email sent via Resend to ${options.to}`, {
        to: options.to,
        subject: options.subject,
        messageId: data?.id
      });
      
      return true;
    }
    
    // Try MailerSend as fallback if available
    if (process.env.MAILERSEND_API_KEY) {
      const { MailerSend, EmailParams, Sender, Recipient } = await import('mailersend');
      const mailerSend = new MailerSend({
        apiKey: process.env.MAILERSEND_API_KEY,
      });
      
      const sentFrom = new Sender(options.from, "AIChecklist");
      const recipients = [new Recipient(options.to)];
      
      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(options.subject);
        
      if (options.html) {
        emailParams.setHtml(options.html);
      }
      if (options.text) {
        emailParams.setText(options.text);
      }

      await mailerSend.email.send(emailParams);
      
      logger.info(`Email sent via MailerSend to ${options.to}`, {
        to: options.to,
        subject: options.subject
      });
      
      return true;
    }
    
    // Fallback to other email services
    const transporter = createEmailTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });
      
      logger.info(`Email sent via SMTP to ${options.to}`, {
        to: options.to,
        subject: options.subject
      });
      
      return true;
    }
    
    // Development fallback - log to console
    logger.warn('No email service configured, logging email details to console');
    console.log(`\n=== EMAIL SENT ===`);
    console.log(`To: ${options.to}`);
    console.log(`From: ${options.from}`);
    console.log(`Subject: ${options.subject}`);
    if (options.text) {
      console.log(`Text: ${options.text.substring(0, 200)}${options.text.length > 200 ? '...' : ''}`);
    }
    console.log(`==================\n`);
    
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    return false;
  }
}