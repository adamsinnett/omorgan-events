import { GraphQLClient } from "graphql-request";
import { useAuthStore } from "@/store/auth";

const getAuthToken = () => {
  return useAuthStore.getState().token;
};

export const graphqlRequest = async <T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const client = new GraphQLClient(process.env.NEXT_PUBLIC_HASURA_URL!, {
    headers,
  });

  return client.request<T>(query, variables);
};
