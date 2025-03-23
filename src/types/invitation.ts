import { Attendee } from "./attendee";

export interface Invitation {
  id: string;
  token: string;
  created_at: string;
  attendee: Attendee | null;
}
