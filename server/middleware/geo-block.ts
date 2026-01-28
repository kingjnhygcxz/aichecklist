import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';

const BLOCKED_COUNTRIES = [
  'IR',  // Iran
  'KP',  // North Korea
  'CU',  // Cuba
  'SY',  // Syria
  'BY',  // Belarus
  'VE',  // Venezuela
  'AF',  // Afghanistan
  'MM',  // Myanmar (Burma)
  'LY',  // Libya
  'ZW',  // Zimbabwe
  'MX',  // Mexico
];

const MONITORED_COUNTRIES = [
  'BG',  // Bulgaria
];

const MONITORED_COUNTRY_NAMES: Record<string, string> = {
  'BG': 'Bulgaria',
};

const BLOCKED_COUNTRY_NAMES: Record<string, string> = {
  'IR': 'Iran',
  'KP': 'North Korea',
  'CU': 'Cuba',
  'SY': 'Syria',
  'BY': 'Belarus',
  'VE': 'Venezuela',
  'AF': 'Afghanistan',
  'MM': 'Myanmar',
  'LY': 'Libya',
  'ZW': 'Zimbabwe',
  'MX': 'Mexico',
};

function getClientIP(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = (typeof forwardedFor === 'string' ? forwardedFor : forwardedFor[0]).split(',');
    return ips[0].trim();
  }
  
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return typeof realIP === 'string' ? realIP : realIP[0];
  }
  
  return req.socket.remoteAddress || req.ip || '';
}

function getCountryFromHeaders(req: Request): string | null {
  const cfCountry = req.headers['cf-ipcountry'];
  if (cfCountry) {
    return typeof cfCountry === 'string' ? cfCountry : cfCountry[0];
  }
  
  const xCountry = req.headers['x-country-code'];
  if (xCountry) {
    return typeof xCountry === 'string' ? xCountry : xCountry[0];
  }
  
  return null;
}

export function geoBlockMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIP = getClientIP(req);
  
  if (!clientIP || clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.') || clientIP.startsWith('10.')) {
    return next();
  }
  
  const country = getCountryFromHeaders(req);
  
  if (!country) {
    return next();
  }
  
  if (MONITORED_COUNTRIES.includes(country)) {
    const countryName = MONITORED_COUNTRY_NAMES[country] || country;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const path = req.path;
    const method = req.method;
    
    log(`[GEO-MONITOR] 🔍 Connection from ${countryName} (${country}) | IP: ${clientIP} | Path: ${method} ${path} | User-Agent: ${userAgent}`, 'warn');
  }
  
  if (BLOCKED_COUNTRIES.includes(country)) {
    const countryName = BLOCKED_COUNTRY_NAMES[country] || country;
    
    log(`[GEO-BLOCK] Access denied from ${countryName} (${country}) | IP: ${clientIP}`, 'warn');
    
    res.status(403);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Denied - AIChecklist.io</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            padding: 20px;
          }
          .container {
            text-align: center;
            max-width: 500px;
          }
          .icon {
            font-size: 64px;
            margin-bottom: 24px;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 16px;
            color: #f87171;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            color: #94a3b8;
            margin-bottom: 12px;
          }
          .code {
            font-family: monospace;
            background: rgba(255,255,255,0.1);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🚫</div>
          <h1>Access Denied</h1>
          <p>AIChecklist.io is not available in your region due to regulatory restrictions.</p>
          <p>This service complies with U.S. export control and sanctions regulations.</p>
          <p class="code">Error Code: GEO-403</p>
        </div>
      </body>
      </html>
    `);
  }
  
  next();
}

export function getGeoInfo(req: Request): { ip: string; country: string | null; city: string | null; region: string | null } {
  const clientIP = getClientIP(req);
  const country = getCountryFromHeaders(req);
  
  return {
    ip: clientIP,
    country: country,
    city: null,
    region: null,
  };
}
