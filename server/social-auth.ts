import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage';
import type { User, InsertUser } from '@shared/schema';

// Social authentication setup
export async function setupSocialAuth(app: Express) {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists by email
        const email = profile.emails?.[0]?.value || '';
        if (!email) {
          return done(new Error('No email provided by Google'), undefined);
        }

        const existingUser = await storage.getUserByEmail(email);
        
        if (existingUser) {
          return done(null, existingUser);
        }
        
        // Create new user from Google profile
        const userData: InsertUser = {
          username: email.split('@')[0] || `user_${Date.now()}`,
          email: email,
          firstName: profile.name?.givenName || null,
          lastName: profile.name?.familyName || null,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
          emailVerifiedAt: new Date() // Google accounts are verified
        };
        
        const newUser = await storage.createUser(userData);
        return done(null, newUser);
      } catch (error) {
        return done(error, undefined);
      }
    }));
  }

  // Local Strategy for email/password (supports both personal email and Proton Mail)
  passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      if (!user.password) {
        return done(null, false, { message: 'Password not set for this account' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return done(null, false, { message: 'Invalid password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }));

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user || false);
    } catch (error) {
      done(error, false);
    }
  });

  // Initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
}

// Authentication middleware
export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

// Check if email is Proton Mail
export function isProtonMail(email: string): boolean {
  const protonDomains = ['protonmail.com', 'proton.me', 'pm.me'];
  const domain = email.split('@')[1]?.toLowerCase();
  return protonDomains.includes(domain);
}

// Enhanced email validation for different providers
export function validateEmailProvider(email: string): { valid: boolean; provider: string; secure: boolean } {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return { valid: false, provider: 'unknown', secure: false };
  }

  // Proton Mail domains
  const protonDomains = ['protonmail.com', 'proton.me', 'pm.me'];
  if (protonDomains.includes(domain)) {
    return { valid: true, provider: 'proton', secure: true };
  }

  // Gmail domains
  const gmailDomains = ['gmail.com', 'googlemail.com'];
  if (gmailDomains.includes(domain)) {
    return { valid: true, provider: 'google', secure: true };
  }

  // Apple domains
  const appleDomains = ['icloud.com', 'me.com', 'mac.com'];
  if (appleDomains.includes(domain)) {
    return { valid: true, provider: 'apple', secure: true };
  }

  // Other common secure providers
  const secureProviders = ['outlook.com', 'hotmail.com', 'yahoo.com', 'fastmail.com', 'tutanota.com'];
  if (secureProviders.includes(domain)) {
    return { valid: true, provider: 'personal', secure: true };
  }

  // Generic personal email
  return { valid: true, provider: 'personal', secure: false };
}