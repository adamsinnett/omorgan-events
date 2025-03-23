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
  reaction_type: string;
}

export type { Message, Reaction };
