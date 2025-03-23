interface Attendee {
  id: string;
  email: string;
  name: string;
  status: string;
  guest_count: number;
  created_at: string;
  invitation_token: string;
}

export type { Attendee };
