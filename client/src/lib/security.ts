/**
 * Security utilities for preventing phishing and malicious redirects
 * Provides URL validation and safe redirect mechanisms
 */

// Allowed internal routes and trusted external domains
const ALLOWED_INTERNAL_ROUTES = [
  '/',
  '/auth', 
  '/calendar',
  '/subscription',
  '/pricing',
  '/help',
  '/reset-password',
  '/share/',
  '/import/',
  '/robot-demo'
];

const TRUSTED_EXTERNAL_DOMAINS = [
  'aichecklist.com',
  'www.aichecklist.com',
  'docs.google.com',
  'github.com',
  'support.stripe.com'
];

/**
 * Validates if a URL is safe for redirects
 * @param url - The URL to validate
 * @returns boolean - true if URL is safe, false otherwise
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    // Handle relative URLs (internal routes)
    if (url.startsWith('/')) {
      // Check if it's an allowed internal route
      return ALLOWED_INTERNAL_ROUTES.some(route => 
        url === route || url.startsWith(route)
      );
    }
    
    // Handle absolute URLs
    const urlObj = new URL(url);
    
    // Only allow HTTPS in production, allow HTTP in development
    const isSecureProtocol = import.meta.env.NODE_ENV === 'development' 
      ? ['http:', 'https:'].includes(urlObj.protocol)
      : urlObj.protocol === 'https:';
    
    if (!isSecureProtocol) {
      return false;
    }
    
    // Check if domain is in trusted list
    return TRUSTED_EXTERNAL_DOMAINS.includes(urlObj.hostname);
    
  } catch (error) {
    // Invalid URL format
    return false;
  }
}

/**
 * Safely redirects to a URL after validation
 * @param url - The URL to redirect to
 * @param fallbackUrl - Fallback URL if the target is unsafe (default: '/')
 */
export function safeRedirect(url: string, fallbackUrl: string = '/'): void {
  const targetUrl = isValidRedirectUrl(url) ? url : fallbackUrl;
  window.location.href = targetUrl;
}

/**
 * Validates URL parameters to prevent injection attacks
 * @param value - The parameter value to validate
 * @returns boolean - true if safe, false otherwise
 */
export function isValidUrlParameter(value: string): boolean {
  // Check for common XSS patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    /on\w+=/i, // onload, onclick, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(value));
}

/**
 * Sanitizes URL parameters by removing dangerous characters
 * @param value - The parameter value to sanitize
 * @returns string - Sanitized value
 */
export function sanitizeUrlParameter(value: string): string {
  return value
    .replace(/[<>'"]/g, '') // Remove HTML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Creates a secure external link with proper attributes
 * @param url - The external URL
 * @param text - Link text
 * @returns object with href and security attributes
 */
export function createSecureExternalLink(url: string) {
  if (!isValidRedirectUrl(url)) {
    throw new Error('Invalid or untrusted URL');
  }
  
  return {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer', // Prevent window.opener access
    'data-testid': 'external-link'
  };
}

/**
 * Validates email links to prevent email injection
 * @param email - Email address
 * @returns boolean - true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && !email.includes('<') && !email.includes('>');
}