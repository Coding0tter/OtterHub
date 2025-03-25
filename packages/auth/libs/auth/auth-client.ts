import { createAuthClient } from "better-auth/solid";

export const authClient = createAuthClient({
  baseURL: import.meta.env.OTTER_AUTH_API_URL,
});
