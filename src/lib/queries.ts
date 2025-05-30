// Admin

export const LOGIN_ADMIN = `
  query LoginAdmin($email: String!) {
    admin_users(where: { email: { _eq: $email } }) {
      id
      email
      password_hash
      created_at
      updated_at
      last_login_at
      is_active
    }
  }
`;

export const UPDATE_LAST_LOGIN = `
  mutation UpdateLastLogin($id: uuid!) {
    update_admin_users_by_pk(
      pk_columns: { id: $id }
      _set: { last_login_at: "now()" }
    ) {
      id
      last_login_at
    }
  }
`;

// Events

export const GET_EVENT = `
  query GetEvent($id: uuid!) {
    events_by_pk(id: $id) {
      id
      title
      description
      start_time
      end_time
      location
      max_attendees
      status
      is_private
      created_by
      created_at
      updated_at
      invitations {
        id
        token
        created_at
        attendee {
          id
          email
        }
      }
      attendees {
        id
        name
        email
        status
        guest_count
        created_at
      }
      messages {
        id
        content
        created_by
        created_at
        reactions {
          id
          reaction_type
          user_email
          created_at
        }
      }
    }
  }
`;

export const GET_EVENTS = `
  query GetEvents {
    events(order_by: { created_at: desc }) {
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

export const GET_EVENT_BY_TOKEN = `
    query GetEvent($token: String!) {
        invitations(where: { 
            token: { _eq: $token },
            is_active: { _eq: true }
        }) {
            id
            token
            event {
                id
                title
                description
                start_time
                end_time
                location
                max_attendees
                status
                is_private
                attendees {
                    id
                    name
                    email
                    status
                    guest_count
                    created_at
                    invitation_token
                }
                messages(order_by: { created_at: desc }) {
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
        }
    }
`;
