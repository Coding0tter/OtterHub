import { useNavigate } from "@solidjs/router";
import { authClient } from "auth";
import axios from "axios";
import { Card, Header } from "components";
import { createResource, For, Suspense } from "solid-js";
import { fitnessApi } from "../App";

export default function Dashboard() {
  const navigation = useNavigate();
  const session = authClient.useSession();

  const [plannedWorkouts] = createResource(
    () => session().data?.user,
    async () => {
      return (await fitnessApi.get("/user")).data.plannedWorkouts;
    },
  );

  const openWorkout = (id: string) => {
    navigation(`/fitness/active-workout/${id}`);
  };

  return (
    <main class="flex-1 container py-4 space-y-4">
      <Header title="Workouts" />
      <div class="grid gap-4">
        <Suspense fallback={<div>Loading...</div>}>
          <For each={plannedWorkouts()}>
            {(workout) => (
              <Card
                onClick={() => openWorkout(workout._id!)}
                title={workout.name}
                subtitle={`${workout.exercises.length} exercises`}
                class="flex flex-row"
              >
                <div class="p-4 flex justify-end">
                  <i class="text-base-content fa-solid fa-caret-right"></i>
                </div>
              </Card>
            )}
          </For>
        </Suspense>
      </div>
    </main>
  );
}
