import { serve } from "bun";

serve({
  port: Bun.env.PROXY_PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/fitness")) {
      return await fetch(`${Bun.env.FITNESS_FRONTEND_URL}${url.pathname}`);
    } else if (url.pathname.startsWith("/budget")) {
      return await fetch(`${Bun.env.BUDGET_FRONTEND_URL}${url.pathname}`);
    }
    return await fetch(`${Bun.env.DASHBOARD_FRONTEND_URL}${url.pathname}`);
  },
  hostname: "0.0.0.0",
});

console.log("Frontend Proxy running on port 3000");
