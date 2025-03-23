interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_attendees: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  status: string;
  is_private: boolean;
  attendees: Attendee[];
  invitations: Invitation[];
}

interface Attendee {
  id: string;
  email: string;
  name: string;
  status: string;
  guest_count: number;
  created_at: string;
}

interface Invitation {
  id: string;
  token: string;
  created_at: string;
  is_active: boolean;
}

interface EventResponse {
  events_by_pk: Event;
}

export type { Event, Attendee, Invitation, EventResponse };
