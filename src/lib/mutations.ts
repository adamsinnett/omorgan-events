// EVENTS
export const CREATE_EVENT = `
  mutation CreateEvent(
    $title: String!
    $description: String!
    $start_time: timestamptz!
    $end_time: timestamptz!
    $location: String!
    $max_attendees: Int!
    $status: String!
    $is_private: Boolean!
  ) {
    insert_events_one(
      object: {
        title: $title
        description: $description
        start_time: $start_time
        end_time: $end_time
        location: $location
        max_attendees: $max_attendees
        status: $status
        is_private: $is_private
      }
    ) {
      id
      title
      description
      start_time
      end_time
      location
      max_attendees
      created_at
      updated_at
      created_by
      status
      is_private
    }
  }
`;

export const UPDATE_EVENT = `
  mutation UpdateEvent(
    $id: uuid!
    $title: String!
    $description: String!
    $start_time: timestamptz!
    $end_time: timestamptz!
    $location: String!
    $max_attendees: Int!
    $status: String!
    $is_private: Boolean!
  ) {
    update_events_by_pk(
      pk_columns: { id: $id }
      _set: {
        title: $title
        description: $description
        start_time: $start_time
        end_time: $end_time
        location: $location
        max_attendees: $max_attendees
        status: $status
        is_private: $is_private
      }
    ) {
      id
      title
      description
      start_time
      end_time
      location
      max_attendees
      created_at
      updated_at
      created_by
      status
      is_private
      attendees {
        id
        email
        name
        status
        guest_count
        created_at
      }
      invitations {
        id
        token
        created_at
        is_active
      }
    }
  }
`;

export const DELETE_EVENT = `
  mutation DeleteEvent($id: uuid!) {
    delete_events_by_pk(id: $id) {
      id
    }
  }
`;

// INVITATIONS
export const CREATE_INVITATION = `
  mutation CreateInvitation($event_id: uuid!, $token: String!) {
    insert_invitations_one(
      object: {
        event_id: $event_id
        token: $token
        created_by: "admin"
        is_active: true
      }
    ) {
      id
      token
      created_at
      is_active
    }
  }
`;

export const DELETE_INVITATION = `
  mutation DeleteInvitation($id: uuid!) {
    delete_invitations_by_pk(id: $id) {
      id
    }
  }
`;

// ATTENDEES
export const CREATE_ATTENDEE = `
  mutation CreateAttendee($event_id: uuid!, $name: String!, $email: String!, $status: String!, $guest_count: Int!, $invitation_token: String!) {
    insert_attendees_one(object: {
      event_id: $event_id,
      name: $name,
      email: $email,
      status: $status,
      guest_count: $guest_count,
      invitation_token: $invitation_token
    }) {
      id
      name
      email
      status
      guest_count
      created_at
      invitation_token
    }
  }
`;

// MESSAGES
export const CREATE_MESSAGE = `
  mutation CreateMessage($event_id: uuid!, $content: String!, $created_by: String!) {
    insert_messages_one(object: {
      event_id: $event_id,
      content: $content,
      created_by: $created_by
    }) {
      id
      content
      created_by
      created_at
      is_pinned
      reactions {
        id
        user_email
        reaction_type
      }
    }
  }
`;

// REACTIONS
export const CREATE_REACTION = `
  mutation CreateReaction($message_id: uuid!, $user_email: String!, $reaction_type: String!) {
    insert_reactions_one(object: {
      message_id: $message_id,
      user_email: $user_email,
      reaction_type: $reaction_type
    }) {
      id
      user_email
      reaction_type
    }
  }
`;

export const DELETE_REACTION = `
  mutation DeleteReaction($id: uuid!) {
    delete_reactions_by_pk(id: $id) {
      id
    }
  }
`;
