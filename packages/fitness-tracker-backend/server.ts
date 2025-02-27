import { Elysia } from "elysia";
import { connectToDb, parseUserHeader } from "shared";
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

new Elysia()
  .onError(({ code, error }) => console.error(code, error))
  .onBeforeHandle(parseUserHeader)
  .get("/user", async ({ user }: { user: FitnessUser }) => {
    const existingUser = await getUser(user.email!);
    if (!existingUser) {
      return await upsertUser(user);
    }
    return existingUser;
  })
  .get("/workout", async ({ query }) => await getWorkoutById(query.id))
  .get("/past-workouts", async ({ user }: { user: FitnessUser }) => {
    return await getGroupedWorkouts(user.email!);
  })
  .get("/progress", async ({ user }: { user: FitnessUser }) => {
    return await getProgress(user.email!);
  })
  .post(
    "/workout",
    async ({
      body,
      user,
    }: {
      body: { workout: Workout };
      user: FitnessUser;
    }) => {
      return await upsertWorkout(user.email!, body.workout);
    },
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
      await saveActualWorkout(user.email!, body.exercises);
    },
  )
  .put("/user", async ({ body }: { body: { user: FitnessUser } }) => {
    return await upsertUser(body.user);
  })
  .delete("/workout", async ({ query }) => {
    await deleteWorkout(query.id);
  })
  .listen(PORT, () =>
    console.log(`Fitness Tracker Service running on port ${PORT}`),
  );
