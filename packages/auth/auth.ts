import { Elysia } from "elysia";
import { OAuth2Client } from "google-auth-library";
import jwt, { type Secret } from "jsonwebtoken";
import { connectToDb, ImageCache, parseUserHeader, type User } from "shared";
import { UserModel } from "./models/user.db.ts";
import bcrypt from "bcrypt";

const PORT = Bun.env.AUTH_PORT as string;

const client = new OAuth2Client(process.env.OTTER_GOOGLE_CLIENT_ID);
await connectToDb("auth");

const getTokenPair = (jwtPayload: any) => {
  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET as Secret, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(
    jwtPayload,
    process.env.JWT_REFRESH_SECRET as Secret,
    {
      expiresIn: "7d",
    },
  );

  const accessExpires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
  const accessCookie = `token=${token}; HttpOnly; Path=/; Expires=${accessExpires}; SameSite=Strict; Secure`;

  return { refreshToken, accessCookie };
};

new Elysia()
  .post(
    "/login",
    async ({ body }: { body: { email: string; password: string } }) => {
      try {
        const existingUser = await UserModel.findOne({ email: body.email });
        if (!existingUser) return 404;

        const match = await bcrypt.compare(
          body.password,
          existingUser.password!,
        );

        if (!match) return 400;

        const payload = {
          email: existingUser.email,
          name: existingUser.name,
          picture: existingUser.picture,
          services: existingUser.services,
        };

        const { refreshToken, accessCookie } = getTokenPair(payload);

        return new Response(
          JSON.stringify({ message: "Logged in successfully", refreshToken }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": accessCookie,
            },
          },
        );
      } catch (err) {
        console.error("Login failed", err);
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        });
      }
    },
  )
  .post(
    "/signup",
    async ({
      body,
    }: {
      body: { email: string; password: string; name: string };
    }) => {
      try {
        const salt = bcrypt.genSaltSync(Number.parseInt(Bun.env.SALT_ROUNDS!));
        const hash = bcrypt.hashSync(body.password, salt);

        const picture =
          "https://api.dicebear.com/9.x/pixel-art/svg?seed=" + body.name;

        await UserModel.create({
          name: body.name,
          email: body.email,
          password: hash,
          services: ["auth", "fitness", "budget"],
          picture,
        });

        const payload = {
          email: body.email,
          name: body.name,
          picture,
          services: ["auth", "fitness", "budget"],
        };

        const { refreshToken, accessCookie } = getTokenPair(payload);

        return new Response(
          JSON.stringify({ message: "Logged in successfully", refreshToken }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": accessCookie,
            },
          },
        );
      } catch (err) {
        console.error("Signup failed", err);
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        });
      }
    },
  )
  .post("/google", async ({ body }) => {
    try {
      const { idToken } = body as { idToken: string };
      const ticket = await client.verifyIdToken({
        idToken,
        audience: Bun.env.OTTER_GOOGLE_CLIENT_ID,
      });

      console.log(idToken)

      const payload = ticket.getPayload();
      if (!payload) throw new Error("Invalid token");

      const existingUser = await UserModel.findOne({ email: payload.email });
      if (!existingUser) {
        await UserModel.create({
          name: payload.name,
          email: payload.email,
          services: ["auth", "fitness", "budget"],
          picture:
            payload.picture ||
            "https://api.dicebear.com/9.x/pixel-art/svg?seed=" + payload.sub,
        });
      }

      const jwtPayload = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        services: ["auth", "fitness", "budget"],
      };

      const { refreshToken, accessCookie } = getTokenPair(jwtPayload);
      console.log(refreshToken, accessCookie)

      return new Response(
        JSON.stringify({ message: "Logged in successfully", refreshToken }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": accessCookie,
          },
        },
      );
    } catch (err) {
      console.error("Authentication failed", err);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
  })
  .post("/refresh", async ({ body }: { body: { refreshToken: string } }) => {
    if (!body.refreshToken) {
      return new Response(JSON.stringify({ error: "Missing refresh token" }), {
        status: 401,
      });
    }

    try {
      const payload = jwt.verify(
        body.refreshToken,
        process.env.JWT_REFRESH_SECRET as Secret,
      ) as any;

      // TODO: save token pair in db to invalidate old refresh tokens
      const jwtPayload = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        // TODO: add permissions
        services: ["auth", "fitness", "budget"],
      };

      const newAccessToken = jwt.sign(
        jwtPayload,
        process.env.JWT_SECRET as Secret,
        {
          expiresIn: "1h",
        },
      );

      const newRefreshToken = jwt.sign(
        jwtPayload,
        process.env.JWT_REFRESH_SECRET as Secret,
        { expiresIn: "7d" },
      );

      const newAccessExpires = new Date(
        Date.now() + 60 * 60 * 1000,
      ).toUTCString();
      const newAccessCookie = `token=${newAccessToken}; HttpOnly; Path=/; Expires=${newAccessExpires}; SameSite=Strict; Secure`;

      return new Response(
        JSON.stringify({
          message: "Token refreshed successfully",
          refreshToken: newRefreshToken,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": newAccessCookie,
          },
        },
      );
    } catch (err) {
      console.error("Refresh token error", err);
      return new Response(JSON.stringify({ error: "Invalid refresh token" }), {
        status: 401,
      });
    }
  })
  .post("/logout", () => {
    const expiredCookie = `token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;

    return new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": expiredCookie,
        },
      },
    );
  })
  .get(
    "/user",
    (ctx: { user: User }) => {
      return {
        email: ctx.user.email,
        name: ctx.user.name,
        picture: ctx.user.picture,
        services: ctx.user.services,
      };
    },
    {
      beforeHandle: parseUserHeader,
    },
  )
  .get("/profile-picture", async ({ query }) => {
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
  })
  .listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
