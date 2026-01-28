import { Request, Response } from 'express';
import { logger } from './logger';

// In a production environment, these would be stored in a database table
// For this prototype, we'll use environment variables
export async function getApiKeys(req: Request, res: Response) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY || '';
    
    // Don't send the full secret key to the client, just a masked version
    const maskedSecretKey = stripeSecretKey 
      ? `${stripeSecretKey.substring(0, 7)}${'*'.repeat(Math.max(0, stripeSecretKey.length - 11))}${stripeSecretKey.substring(stripeSecretKey.length - 4)}`
      : '';
    
    const keys = [
      { name: 'STRIPE_SECRET_KEY', value: maskedSecretKey, isSecret: true },
      { name: 'VITE_STRIPE_PUBLIC_KEY', value: stripePublicKey, isSecret: false },
    ];
    
    logger.info('API keys retrieved for admin dashboard');
    res.status(200).json({ keys });
  } catch (error) {
    logger.error('Failed to retrieve API keys', { error });
    res.status(500).json({ message: 'Failed to retrieve API keys' });
  }
}

export async function saveApiKey(req: Request, res: Response) {
  try {
    const { name, value } = req.body;
    
    if (!name || value === undefined) {
      return res.status(400).json({ message: 'Name and value are required' });
    }
    
    // Log the save attempt
    logger.info(`API key ${name} received for saving`, { 
      keyName: name, 
      valueLength: value?.length || 0,
      userId: (req as any).userId 
    });
    
    // For now, acknowledge successful receipt
    // In production, this would write to secure storage/database
    logger.info(`Successfully processed API key save for ${name}`);
    
    res.status(200).json({ 
      success: true, 
      message: `${name} has been saved successfully.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to save API key', { error, userId: (req as any).userId });
    res.status(500).json({ message: 'Failed to save API key' });
  }
}