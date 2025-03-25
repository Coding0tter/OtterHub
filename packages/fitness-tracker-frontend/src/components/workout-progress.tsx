import moment from "moment";
import { Card, Header } from "components";
import { createResource, For, Show, Suspense } from "solid-js";
import { OverallProgressChart } from "./overall-progress-chart";
import { fitnessApi } from "../App";

export const WorkoutProgress = () => {
  const [progress] = createResource(async () => {
    const progress = await fitnessApi.get("/progress");
    return progress.data;
  });

  const [pastWorkouts] = createResource(async () => {
    try {
      const workouts = await fitnessApi.get("/past-workouts");
      return Object.keys(workouts.data).map((date: any) => ({
        date,
        exercises: workouts.data[date],
      }));
    } catch {
      return Promise.reject();
    }
  });

  return (
    <main class="flex-1 container py-4 space-y-4 mb-16">
      <Header title="Progress" />
      <Show when={progress()}>
        <OverallProgressChart data={progress().overallProgress} />
      </Show>
      <Suspense fallback={<i class="fa-solid fa-spinner animate-spin" />}>
        <For each={pastWorkouts()!}>
          {(workout, index) => (
            <Card
              title={moment(workout.date).format("DD.MM.YYYY")}
              subtitle={`${workout.exercises.length} Exercises`}
            />
          )}
        </For>
      </Suspense>
    </main>
  );
};
