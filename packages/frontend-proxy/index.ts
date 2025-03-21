import { serve } from "bun";

serve({
  port: Bun.env.PROXY_PORT,
  async fetch(req) {
    const url = new URL(req.url);
    console.log("Forwarding " + url);

    if (url.pathname.startsWith("/fitness")) {
      return await fetch(`http://fitness-tracker-frontend:5174${url.pathname}`);
    } else if (url.pathname.startsWith("/budget")) {
      return await fetch(`http://budget-frontend:5175${url.pathname}`);
    }

    return await fetch(`http://gateway-frontend:5173${url.pathname}`);
  },
  hostname: "0.0.0.0",
});

console.log("Frontend Proxy running on port 3000");
