// This will be expanded when we set up Hasura
export const API_URL = process.env.NEXT_PUBLIC_HASURA_URL || "";

export async function graphqlRequest(
  query: string,
  variables: Record<string, unknown> = {}
) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}
