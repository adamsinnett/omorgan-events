interface Message {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
  is_pinned: boolean;
  reactions: Reaction[];
}

interface Reaction {
  id: string;
  user_email: string;
  message_id: string;
  reaction_type: string;
  created_at: string;
}

export type { Message, Reaction };
