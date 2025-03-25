import { Elysia } from "elysia";
import jwt, { type Secret } from "jsonwebtoken";
import cors from "@elysiajs/cors";

const PORT = Bun.env.GATEWAY_PORT as any;

const services: { [key: string]: string } = {
  fitness: Bun.env.FITNESS_URL as string,
  budget: Bun.env.BUDGET_URL as string,
};

const parseCookie = (cookie: string) =>
  Object.fromEntries(
    cookie.split(";").map((c) => {
      const [key, ...v] = c.trim().split("=");
      return [key, v.join("=")];
    }),
  );

const withAuth =
  (handler: (ctx: any) => Promise<Response> | Response) => async (ctx: any) => {
    console.log(`[withAuth] Processing auth for ${ctx.request.url}`);
    const cookieHeader = ctx.request.headers.get("Cookie");
    const cookies = parseCookie(cookieHeader || "");
    const token = cookies.token;
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as Secret,
      ) as any;
      console.log(
        "[withAuth] Token decoded successfully for user: ",
        decoded.name,
      );
      ctx.user = decoded;
      const pathname = new URL(ctx.request.url).pathname;
      const parts = pathname.split("/");
      const service = parts[1];
      console.log(`[withAuth] Service requested: ${service}`);
      if (!decoded.services.includes(service)) {
        console.warn(`[withAuth] Service ${service} not allowed for user`);
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
        });
      }
      return handler(ctx);
    } catch (err) {
      console.error("[withAuth] Token verification failed", err);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }
  };

const createProxyHandler = (targetBase: string, prefix: string) => {
  return async (ctx: any) => {
    const requestUrl = new URL(ctx.request.url);
    const newPath = requestUrl.pathname.replace(prefix, "");
    const targetUrl = targetBase + newPath + requestUrl.search;
    console.log(
      `[Proxy] Forwarding ${ctx.request.method} ${ctx.request.url} to ${targetUrl}`,
    );

    const headers = Object.fromEntries(ctx.request.headers.entries());
    if (ctx.user) {
      headers["x-user"] = JSON.stringify(ctx.user);
    }

    const reqInit: RequestInit = {
      method: ctx.request.method,
      headers,
      body: JSON.stringify(ctx.body),
    };

    const response = await fetch(targetUrl, reqInit);
    const resBody = await response.arrayBuffer();
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    console.log(
      `[Proxy] Received response with status ${response.status} from ${targetUrl}`,
    );
    return new Response(resBody, {
      status: response.status,
      headers: responseHeaders,
    });
  };
};

const app = new Elysia().use(cors());

Object.keys(services).forEach((service) => {
  console.log(`Registering ${service}`);
  return app.all(
    `/${service}/*`,
    withAuth(createProxyHandler(services[service], `/${service}`)),
  );
});

app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
