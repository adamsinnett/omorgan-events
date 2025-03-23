import { useAuthStore } from "@/store/auth";
import { GraphQLClient } from "graphql-request";

const HASURA_URL =
  process.env.NEXT_PUBLIC_HASURA_URL || "http://localhost:8080/v1/graphql";

export const graphqlRequest = async <T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  const { token } = useAuthStore.getState();

  const client = new GraphQLClient(HASURA_URL, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
          "x-hasura-role": "admin",
        }
      : {},
  });

  try {
    return await client.request<T>(query, variables);
  } catch (error) {
    console.error("GraphQL request failed:", error);
    throw error;
  }
};
