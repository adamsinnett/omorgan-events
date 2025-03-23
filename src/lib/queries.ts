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
      created_at
      updated_at
      created_by
      status
      is_private
      attendees {
        id
        name
        email
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
