import { hashPassword } from "@/lib/auth";
import { graphqlRequest } from "@/lib/graphql";

const UPDATE_ADMIN_PASSWORD = `
  mutation UpdateAdminPassword($email: String!, $password_hash: String!) {
    update_admin_users(
      where: { email: { _eq: $email } }
      _set: { password_hash: $password_hash }
    ) {
      affected_rows
      returning {
        id
        email
        is_active
        updated_at
      }
    }
  }
`;

async function updateAdminPassword(email: string, newPassword: string) {
  try {
    const passwordHash = await hashPassword(newPassword);

    const response = await graphqlRequest(UPDATE_ADMIN_PASSWORD, {
      email,
      password_hash: passwordHash,
    });

    console.log("Admin password updated successfully:", response);
  } catch (error) {
    console.error("Failed to update admin password:", error);
  }
}

// Update the admin user's password
updateAdminPassword("admin@example.com", "admin123");
