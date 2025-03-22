import { env, publicEnv } from "../lib/env";

async function testHasuraConnection() {
  try {
    const response = await fetch(publicEnv.NEXT_PUBLIC_HASURA_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": env.HASURA_ADMIN_SECRET!,
      },
      body: JSON.stringify({
        query: `
          query TestQuery {
            __schema {
              queryType {
                name
              }
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Hasura connection successful:", data);
  } catch (error) {
    console.error("Hasura connection failed:", error);
  } finally {
    process.exit();
  }
}

testHasuraConnection();
