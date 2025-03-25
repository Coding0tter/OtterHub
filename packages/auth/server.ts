import cors from "@elysiajs/cors";
import Elysia from "elysia";
import betterAuthView from "./libs/auth/auth-view";
import { connectToDb, auth, ImageCache } from "shared";

const PORT = Bun.env.AUTH_PORT as string;
await connectToDb("auth");

const betterAuth = new Elysia({ name: "better-auth" })
  .use(
    cors({
      origin: Bun.env.OTTER_FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ error, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return error(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

const app = new Elysia()
  .use(betterAuth)
  .get("/user", ({ user }) => user, {
    auth: true,
  })
  .get(
    "/profile-picture",
    async ({ query }) => {
      const imageUrl = query.url;
      if (!imageUrl)
        return new Response("No image URL provided", { status: 400 });

      let cachedImage = await ImageCache.findOne({ imageUrl });
      const now = new Date();

      if (
        cachedImage &&
        now.getTime() - cachedImage.lastFetched.getTime() < 1000 * 60 * 60
      ) {
        return new Response(cachedImage.data, {
          headers: { "Content-Type": cachedImage.contentType },
        });
      }

      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image from Google");
      const contentType = response.headers.get("content-type") || "image/jpeg";
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      if (cachedImage) {
        cachedImage.data = imageBuffer;
        cachedImage.contentType = contentType;
        cachedImage.lastFetched = now;
        await cachedImage.save();
      } else {
        cachedImage = await ImageCache.create({
          imageUrl,
          data: imageBuffer,
          contentType,
        });
      }

      return new Response(imageBuffer, {
        headers: { "Content-Type": contentType },
      });
    },
    { auth: true },
  )
  .all("/api/auth/*", betterAuthView)
  .listen(PORT);

console.log(`Auth is running at ${app.server?.hostname}:${app.server?.port}`);
