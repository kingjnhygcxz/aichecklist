import { logger } from './logger';

export interface EmailValidationResult {
  email: string;
  result: 'valid' | 'invalid' | 'disposable' | 'catchall' | 'unknown';
  flags: string[];
  suggested_correction?: string;
  execution_time: number;
}

/**
 * Validates an email address using NeverBounce API
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  let apiKey = process.env.NEVERBOUNCE_API_KEY;
  
  if (!apiKey) {
    logger.warn('NEVERBOUNCE_API_KEY not found, allowing email validation');
    // Return a default valid result if no API key is configured
    return {
      email,
      result: 'valid',
      flags: ['no_api_key'],
      execution_time: 0
    };
  }



  // Extract API key if it's embedded in a URL format
  if (apiKey.includes('/')) {
    const keyMatch = apiKey.match(/key=([^&]+)/);
    if (keyMatch) {
      apiKey = keyMatch[1];
      logger.info('Extracted API key from URL format');
    }
  }

  try {
    logger.info(`Validating email: ${email} with API key: ${apiKey.substring(0, 8)}...`);
    
    const requestBody = {
      key: apiKey,
      email: email,
      address_info: 1,
      credits_info: 0,
      timeout: 15
    };
    
    const response = await fetch('https://api.neverbounce.com/v4/single/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AIChecklist/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`NeverBounce API error: ${response.status} ${response.statusText}`, { errorText });
      throw new Error(`NeverBounce API error: ${response.status}`);
    }

    const data = await response.json();
    
    logger.info(`Email validation result for ${email}:`, {
      result: data.result,
      flags: data.flags,
      status: data.status
    });

    // Handle API errors
    if (data.status && data.status !== 'success') {
      logger.error(`NeverBounce API error status: ${data.status}`, { message: data.message });
      
      // Return unknown result for API errors
      return {
        email,
        result: 'unknown',
        flags: ['api_error'],
        execution_time: data.execution_time || 0
      };
    }

    return {
      email: data.email,
      result: data.result,
      flags: data.flags || [],
      suggested_correction: data.suggested_correction,
      execution_time: data.execution_time || 0
    };

  } catch (error) {
    logger.error(`Failed to validate email ${email}:`, error);
    
    // Return unknown result on error - let the application decide how to handle
    return {
      email,
      result: 'unknown',
      flags: ['validation_error'],
      execution_time: 0
    };
  }
}

/**
 * Checks if an email validation result indicates a deliverable email
 */
export function isEmailDeliverable(result: EmailValidationResult): boolean {
  // Consider valid emails as deliverable
  if (result.result === 'valid') {
    return true;
  }
  
  // Consider catchall emails as potentially deliverable (risky but acceptable)
  if (result.result === 'catchall') {
    return true;
  }
  
  // Allow unknown results (temporary for testing)
  if (result.result === 'unknown') {
    return true;
  }
  
  // Reject disposable and invalid emails
  return false;
}

/**
 * Gets a user-friendly message for email validation results
 */
export function getEmailValidationMessage(result: EmailValidationResult): string {
  switch (result.result) {
    case 'valid':
      return 'Email address is valid and deliverable';
    case 'invalid':
      return result.suggested_correction 
        ? `Email address is invalid. Did you mean: ${result.suggested_correction}?`
        : 'Email address is invalid';
    case 'disposable':
      return 'Disposable email addresses are not allowed. Please use a permanent email address';
    case 'catchall':
      return 'Email address accepted (catchall domain detected)';
    case 'unknown':
      return 'Unable to verify email address. Please double-check and try again';
    default:
      return 'Email validation failed. Please try again';
  }
}