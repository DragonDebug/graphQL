import { config } from "./config.js";

/**
 * Exchanges username/password for a Bearer token via Basic Auth.
 * Stores the token in localStorage on success.
 */
export async function authenticate(username, password) {
  const response = await fetch(config.authEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
    },
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const token = await response.text();
  if (!token) {
    throw new Error("No token received");
  }

  localStorage.setItem(config.authTokenKey, token);
  return token;
}
