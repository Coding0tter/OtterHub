import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { auth, connectToDb } from "shared";
import {
  deleteWorkout,
  getGroupedWorkouts,
  getProgress,
  getUser,
  getWorkoutById,
  saveActualWorkout,
  upsertUser,
  upsertWorkout,
} from "./services/workoutService";
import type { FitnessUser } from "./types/user";
import type { ActualWorkout, Workout } from "./types/workout";

const PORT = Bun.env.FITNESS_PORT as string;
await connectToDb("fitness");

const betterAuth = new Elysia({ name: "better-auth" })
  .use(
    cors({
      origin: Bun.env.OTTER_FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
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

new Elysia()
  .onError(({ code, error }) => console.error(code, error))
  .use(betterAuth)
  .get(
    "/user",
    async ({ user }: { user: FitnessUser }) => {
      const existingUser = await getUser(user.id!);
      if (!existingUser) {
        return await upsertUser(user);
      }
      return existingUser;
    },
    { auth: true },
  )
  .get("/workout", async ({ query }) => await getWorkoutById(query.id), {
    auth: true,
  })
  .get(
    "/past-workouts",
    async ({ user }: { user: FitnessUser }) => {
      return await getGroupedWorkouts(user.id!);
    },
    { auth: true },
  )
  .get(
    "/progress",
    async ({ user }: { user: FitnessUser }) => {
      return await getProgress(user.id!);
    },
    { auth: true },
  )
  .post(
    "/workout",
    async ({
      body,
      user,
    }: {
      body: { workout: Workout };
      user: FitnessUser;
    }) => {
      return await upsertWorkout(user.id!, body.workout);
    },
    { auth: true },
  )
  .post(
    "/workout/finish",
    async ({
      body,
      user,
    }: {
      body: { exercises: ActualWorkout[] };
      user: FitnessUser;
    }) => {
      await saveActualWorkout(user.id!, body.exercises);
    },
    { auth: true },
  )
  .put(
    "/user",
    async ({ body }: { body: { user: FitnessUser } }) => {
      return await upsertUser(body.user);
    },
    { auth: true },
  )
  .delete(
    "/workout",
    async ({ query }) => {
      await deleteWorkout(query.id);
    },
    { auth: true },
  )
  .listen(PORT, () =>
    console.log(`Fitness Tracker Service running on port ${PORT}`),
  );
