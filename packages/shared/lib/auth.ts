import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

let db;
if (Bun.env.NODE_ENV === "development") {
  const client = new MongoClient(`mongodb://${Bun.env.MONGO_URI}/auth`);
  db = client.db();
} else {
  const client = new MongoClient(
    `mongodb://${Bun.env.MONGO_USERNAME}:${Bun.env.MONGO_PASSWORD}@${Bun.env.MONGO_URI}/auth?authSource=admin`,
  );
  db = client.db();
}

export const auth = betterAuth({
  database: mongodbAdapter(db),
  user: {
    additionalFields: {
      apps: {
        type: "string[]",
        required: false,
        defaultValue: ["dashboard"],
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".theotter.at",
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [Bun.env.OTTER_FRONTEND_URL!],
  socialProviders: {
    google: {
      clientId: Bun.env.OTTER_GOOGLE_CLIENT_ID!,
      clientSecret: Bun.env.OTTER_GOOGLE_CLIENT_SECRET!,
    },
  },
});
