import { config } from "./config.js";

/**
 * Sends a GraphQL query to the API and returns the data.
 * Automatically attaches the auth token from localStorage.
 */
export async function fetchGraphQL(query, variables = {}) {
  const token = localStorage
    .getItem(config.authTokenKey)
    ?.trim()
    .replace(/^"+|"+$/g, "");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(config.graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(errors[0]?.message || "GraphQL query failed");
  }

  return data;
}
