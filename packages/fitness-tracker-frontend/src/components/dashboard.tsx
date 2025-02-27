import { useNavigate } from "@solidjs/router";
import type { FitnessUser } from "fitness-tracker-backend/types/user";
import { createResource, For } from "solid-js";
import { Card, Header } from "components";
import { authApiClient, fitnessApiClient } from "../App";

export default function Dashboard() {
  const navigation = useNavigate();

  const [user] = createResource(
    async (): Promise<FitnessUser & { image: string }> => {
      const result = await fitnessApiClient.get("/user");
      const imageResponse = await authApiClient.get(
        `/profile-picture?url=${result.data.picture}`,
        { responseType: "blob" },
      );
      const imageUrl = URL.createObjectURL(imageResponse.data);
      return { ...result.data, image: imageUrl };
    },
  );

  const openWorkout = (id: string) => {
    navigation(`/fitness/active-workout/${id}`);
  };

  return (
    <main class="flex-1 container py-4 space-y-4">
      <Header title="Workouts" />
      <div class="grid gap-4">
        <For each={user()?.plannedWorkouts}>
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
      </div>
    </main>
  );
}
