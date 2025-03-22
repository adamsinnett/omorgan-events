import { env, publicEnv } from "./env";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  headers: Record<string, string> = {}
): Promise<GraphQLResponse<T>> {
  const response = await fetch(publicEnv.NEXT_PUBLIC_HASURA_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": env.HASURA_ADMIN_SECRET!,
      ...headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result;
}
