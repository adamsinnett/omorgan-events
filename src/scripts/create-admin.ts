import { hashPassword } from "@/lib/auth";
import { graphqlRequest } from "@/lib/graphql";

const CREATE_ADMIN = `
  mutation CreateAdmin($email: String!, $password_hash: String!) {
    insert_admin_users_one(
      object: {
        email: $email,
        password_hash: $password_hash,
        is_active: true
      }
    ) {
      id
      email
      is_active
      created_at
    }
  }
`;

async function createAdminUser(email: string, password: string) {
  try {
    const passwordHash = await hashPassword(password);

    const { data } = await graphqlRequest(CREATE_ADMIN, {
      email,
      password_hash: passwordHash,
    });

    console.log("Admin user created successfully:", data);
  } catch (error) {
    console.error("Failed to create admin user:", error);
  }
}

// Create a test admin user
createAdminUser("admin@example.com", "admin123");
