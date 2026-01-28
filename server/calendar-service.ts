import { calendar_v3 } from '@googleapis/calendar';
import { OAuth2Client } from 'google-auth-library';
import type { User } from '@shared/schema';
import { logger } from './logger';

// Abstract calendar provider interface for future extensibility
export interface CalendarProvider {
  checkAvailability(startTime: Date, endTime: Date): Promise<boolean>;
  createEvent(event: CalendarEvent): Promise<string>;
  updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  listCalendars(): Promise<Calendar[]>;
  refreshAccessToken(): Promise<{ accessToken: string; expiresAt: Date }>;
}

export interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendees?: { email: string; name?: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: 'email' | 'popup'; minutes: number }[];
  };
}

export interface Calendar {
  id: string;
  summary: string;
  primary: boolean;
}

// Google Calendar provider implementation
export class GoogleCalendarProvider implements CalendarProvider {
  private oauth2Client: any;
  private calendar: any;
  private user: User;
  private calendarId: string;

  constructor(user: User) {
    this.user = user;
    this.calendarId = user.calendarId || 'primary';
    
    // Initialize OAuth2 client
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.REPL_SLUG ? 
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
        'http://localhost:5000'}/api/calendar/google/callback`
    );

    // Set credentials if available
    if (user.calendarAccessToken && user.calendarRefreshToken) {
      this.oauth2Client.setCredentials({
        access_token: user.calendarAccessToken,
        refresh_token: user.calendarRefreshToken,
        expiry_date: user.calendarTokenExpiry?.getTime(),
      });
    }

    this.calendar = new calendar_v3.Calendar({ auth: this.oauth2Client });
  }

  async refreshAccessToken(): Promise<{ accessToken: string; expiresAt: Date }> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return {
        accessToken: credentials.access_token!,
        expiresAt: new Date(credentials.expiry_date!),
      };
    } catch (error) {
      logger.error('Failed to refresh Google Calendar access token', { error });
      throw new Error('Failed to refresh calendar access token');
    }
  }

  async checkAvailability(startTime: Date, endTime: Date): Promise<boolean> {
    try {
      // Check if token needs refresh
      if (this.user.calendarTokenExpiry && new Date() >= this.user.calendarTokenExpiry) {
        const { accessToken, expiresAt } = await this.refreshAccessToken();
        this.oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: this.user.calendarRefreshToken,
          expiry_date: expiresAt.getTime(),
        });
      }

      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: this.calendarId }],
        },
      });

      const busySlots = response.data.calendars?.[this.calendarId]?.busy || [];
      return busySlots.length === 0; // Available if no busy slots
    } catch (error) {
      logger.error('Failed to check Google Calendar availability', { error });
      throw new Error('Failed to check calendar availability');
    }
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    try {
      // Check if token needs refresh
      if (this.user.calendarTokenExpiry && new Date() >= this.user.calendarTokenExpiry) {
        const { accessToken, expiresAt } = await this.refreshAccessToken();
        this.oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: this.user.calendarRefreshToken,
          expiry_date: expiresAt.getTime(),
        });
      }

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: {
          summary: event.summary,
          description: event.description,
          location: event.location,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: this.user.timezone || 'America/New_York',
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: this.user.timezone || 'America/New_York',
          },
          attendees: event.attendees?.map(a => ({ email: a.email, displayName: a.name })),
          reminders: event.reminders || {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 24 hours before
              { method: 'popup', minutes: 30 }, // 30 minutes before
            ],
          },
        },
      });

      return response.data.id!;
    } catch (error) {
      logger.error('Failed to create Google Calendar event', { error });
      throw new Error('Failed to create calendar event');
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    try {
      // Check if token needs refresh
      if (this.user.calendarTokenExpiry && new Date() >= this.user.calendarTokenExpiry) {
        const { accessToken, expiresAt } = await this.refreshAccessToken();
        this.oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: this.user.calendarRefreshToken,
          expiry_date: expiresAt.getTime(),
        });
      }

      await this.calendar.events.patch({
        calendarId: this.calendarId,
        eventId,
        requestBody: {
          ...(event.summary && { summary: event.summary }),
          ...(event.description && { description: event.description }),
          ...(event.location && { location: event.location }),
          ...(event.startTime && {
            start: {
              dateTime: event.startTime.toISOString(),
              timeZone: this.user.timezone || 'America/New_York',
            },
          }),
          ...(event.endTime && {
            end: {
              dateTime: event.endTime.toISOString(),
              timeZone: this.user.timezone || 'America/New_York',
            },
          }),
          ...(event.attendees && {
            attendees: event.attendees.map(a => ({ email: a.email, displayName: a.name })),
          }),
        },
      });
    } catch (error) {
      logger.error('Failed to update Google Calendar event', { error });
      throw new Error('Failed to update calendar event');
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      // Check if token needs refresh
      if (this.user.calendarTokenExpiry && new Date() >= this.user.calendarTokenExpiry) {
        const { accessToken, expiresAt } = await this.refreshAccessToken();
        this.oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: this.user.calendarRefreshToken,
          expiry_date: expiresAt.getTime(),
        });
      }

      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });
    } catch (error) {
      logger.error('Failed to delete Google Calendar event', { error });
      throw new Error('Failed to delete calendar event');
    }
  }

  async listCalendars(): Promise<Calendar[]> {
    try {
      // Check if token needs refresh
      if (this.user.calendarTokenExpiry && new Date() >= this.user.calendarTokenExpiry) {
        const { accessToken, expiresAt } = await this.refreshAccessToken();
        this.oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: this.user.calendarRefreshToken,
          expiry_date: expiresAt.getTime(),
        });
      }

      const response = await this.calendar.calendarList.list();
      return (response.data.items || []).map((cal: any) => ({
        id: cal.id,
        summary: cal.summary,
        primary: cal.primary || false,
      }));
    } catch (error) {
      logger.error('Failed to list Google calendars', { error });
      throw new Error('Failed to list calendars');
    }
  }

  static getAuthUrl(state?: string): string {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.REPL_SLUG ? 
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
        'http://localhost:5000'}/api/calendar/google/callback`
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      state,
      prompt: 'consent', // Force consent screen to get refresh token
    });
  }

  static async handleCallback(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    email: string;
  }> {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.REPL_SLUG ? 
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
        'http://localhost:5000'}/api/calendar/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user email from userinfo endpoint
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const userInfo = await response.json();

    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: new Date(tokens.expiry_date!),
      email: userInfo.email!,
    };
  }
}

// Microsoft Calendar provider (stub for future implementation)
export class MicrosoftCalendarProvider implements CalendarProvider {
  constructor(user: User) {
    throw new Error('Microsoft Calendar integration coming soon!');
  }

  async checkAvailability(startTime: Date, endTime: Date): Promise<boolean> {
    throw new Error('Microsoft Calendar integration coming soon!');
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    throw new Error('Microsoft Calendar integration coming soon!');
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    throw new Error('Microsoft Calendar integration coming soon!');
  }

  async deleteEvent(eventId: string): Promise<void> {
    throw new Error('Microsoft Calendar integration coming soon!');
  }

  async listCalendars(): Promise<Calendar[]> {
    throw new Error('Microsoft Calendar integration coming soon!');
  }

  async refreshAccessToken(): Promise<{ accessToken: string; expiresAt: Date }> {
    throw new Error('Microsoft Calendar integration coming soon!');
  }
}

// Factory function to create calendar provider based on user settings
export function createCalendarProvider(user: User): CalendarProvider | null {
  if (!user.calendarProvider || !user.calendarSyncEnabled) {
    return null;
  }

  switch (user.calendarProvider) {
    case 'google':
      return new GoogleCalendarProvider(user);
    case 'microsoft':
      return new MicrosoftCalendarProvider(user);
    default:
      logger.warn(`Unknown calendar provider: ${user.calendarProvider}`);
      return null;
  }
}
