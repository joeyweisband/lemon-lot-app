import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Email address to grant calendar access to
const GMAIL_ACCOUNT = 'josephweisband@gmail.com';

export async function GET() {
  try {
    // Load service account credentials
    // For production, store this securely in environment variables or secret management
    const CREDENTIALS = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS ||
      fs.readFileSync(path.join(process.cwd(), 'service-account-key.json'), 'utf8')
    );

    // Configure a JWT auth client
    function getAuthClient() {
      const jwtClient = new google.auth.JWT(
        CREDENTIALS.client_email,
        undefined,
        CREDENTIALS.private_key,
        ['https://www.googleapis.com/auth/calendar']
      );
      return jwtClient;
    }

    // Initialize Google Calendar API client
    const auth = getAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = 'primary';
    
    // Get events from primary calendar
    const response = await calendar.events.list({
      calendarId,
      timeMin: (new Date()).toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return NextResponse.json({ events: response.data.items });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}