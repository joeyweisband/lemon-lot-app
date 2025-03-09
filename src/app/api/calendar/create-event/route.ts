import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load service account credentials
// For production, store this securely in environment variables or secret management
const CREDENTIALS = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS ||
  fs.readFileSync(path.join(process.cwd(), 'service-account-key.json'), 'utf8')
);

// The calendar ID to add events to
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { summary, description, startTime, endTime } = body;
    
    if (!summary || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const auth = getAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Create the calendar event
    const event = {
      summary,
      description,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'America/Los_Angeles' // Adjust to your timezone
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: 'America/Los_Angeles' // Adjust to your timezone
      }
    };
    
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event
    });
    
    return NextResponse.json(
      { eventId: response.data.id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}