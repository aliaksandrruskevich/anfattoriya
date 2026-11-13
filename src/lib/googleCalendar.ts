export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  location?: string;
}

export const fetchUpcomingEvents = async (accessToken: string): Promise<CalendarEvent[]> => {
  const now = new Date().toISOString();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&orderBy=startTime&singleEvents=true&maxResults=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch events');
  }

  const data = await response.json();
  return data.items || [];
};

export const createMeetingEvent = async (
  accessToken: string,
  details: {
    summary: string;
    description: string;
    startTime: string;
    durationMinutes: number;
    location?: string;
  }
): Promise<CalendarEvent> => {
  const start = new Date(details.startTime);
  const end = new Date(start.getTime() + details.durationMinutes * 60000);

  const event = {
    summary: details.summary,
    description: details.description,
    location: details.location,
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: true,
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create event');
  }

  return response.json();
};
