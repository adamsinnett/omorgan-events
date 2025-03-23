import { Message } from "./messages";
import { Invitation } from "./invitation";
import { Attendee } from "./attendee";

interface Event {
  id?: string;
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
  attendees?: Attendee[];
  invitations?: Invitation[];
  messages?: Message[];
}

interface EventResponse {
  events_by_pk: Event;
}

export type { Event, EventResponse };
