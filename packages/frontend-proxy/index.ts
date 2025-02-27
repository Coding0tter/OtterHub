import { serve } from "bun";

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/fitness")) {
      return fetch(`http://localhost:5174${url.pathname}`);
    } else if (url.pathname.startsWith("/budget")) {
      return fetch(`http://localhost:5175${url.pathname}`);
    }

    return fetch(`http://localhost:5173${url.pathname}`);
  },
});

console.log("Frontend Proxy running on port 3000");
