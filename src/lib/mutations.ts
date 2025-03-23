// EVENTS

const UPDATE_EVENT = `
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

const DELETE_EVENT = `
  mutation DeleteEvent($id: uuid!) {
    delete_events_by_pk(id: $id) {
      id
    }
  }
`;

const CREATE_INVITATION = `
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

const DELETE_INVITATION = `
  mutation DeleteInvitation($id: uuid!) {
    delete_invitations_by_pk(id: $id) {
      id
    }
  }
`;

export { UPDATE_EVENT, DELETE_EVENT, CREATE_INVITATION, DELETE_INVITATION };
