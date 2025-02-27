import { useNavigate, useParams } from "@solidjs/router";
import type { Workout } from "fitness-tracker-backend/types/workout";
import { createResource, createSignal, For, Show } from "solid-js";
import { Button, Card, Header, Label, Input, useToast } from "components";
import type { Exercise } from "fitness-tracker-backend/types/exercise";
import { fitnessApiClient } from "../App";

export const ActiveWorkout = () => {
  const { addToast } = useToast();
  const params = useParams();
  const navigation = useNavigate();
  const [finishedSets, setFinishedSets] = createSignal<{
    [key: string]: {
      set: number;
      weight: number;
      repetitions: number;
    }[];
  }>();

  const [workout, { mutate }] = createResource<Workout>(async () => {
    const response = await fitnessApiClient.get(`/workout?id=${params.id}`);
    const workoutData = response.data;

    return workoutData;
  });

  const openEdit = () => {
    navigation(`/fitness/workout-editor/${params.id}`);
  };

  const calculateProgress = () => {
    const totalExercises = workout()?.exercises.reduce(
      (acc, exercise) => acc + exercise.sets,
      0,
    );
    const completedExercises = Object.values(finishedSets() || []).reduce(
      (acc, values) => values.length + acc,
      0,
    );
    return Math.round((completedExercises / totalExercises!) * 100);
  };

  const updateExercise = <K extends keyof Exercise>(
    index: number,
    key: K,
    value: Exercise[K],
  ) => {
    mutate((prev) => {
      if (!prev) return prev;
      const updatedExercises = [...prev.exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [key]: value,
      };
      return { ...prev, exercises: updatedExercises };
    });
  };

  const toggleSetCompletion = (exerciseName: string, setNumber: number) => {
    setFinishedSets((prev) => {
      const newFinishedSets = Object.assign({}, prev);
      const currentSets = newFinishedSets[exerciseName]
        ? [...newFinishedSets[exerciseName]]
        : [];

      if (currentSets.some((set) => set.set === setNumber)) {
        newFinishedSets[exerciseName] = currentSets.filter(
          (entry) => entry.set !== setNumber,
        );
      } else {
        const exercise = workout()!.exercises.find(
          (entry) => entry.name === exerciseName,
        );
        newFinishedSets[exerciseName] = [
          ...currentSets,
          {
            set: setNumber,
            repetitions: exercise!.repetitions,
            weight: exercise!.weight,
          },
        ];
      }

      return newFinishedSets;
    });
  };

  const handleSave = async () => {
    try {
      const exercises = finishedSets() ? Object.keys(finishedSets()!) : [];
      const payload = exercises.map((exercise) => ({
        name: exercise,
        sets: finishedSets()![exercise],
      }));

      await fitnessApiClient.post("/workout/finish", { exercises: payload });
      navigation("/fitness");
      addToast({ message: "Workout saved. Well done" });
    } catch (err) {
      addToast({ type: "error", message: "Error saving workout" });
    }
  };

  return (
    <main class="flex-1 container py-4 space-y-4 mb-16">
      {workout.loading && (
        <i class="fa-solid fa-spinner text-primary animate-spin"></i>
      )}
      {workout.error && (
        <span class="text-md text-red-500">Failed to load workout</span>
      )}
      <Show when={workout()}>
        <div class="flex items-center justify-between">
          <div>
            <Header title={workout()!.name} />
          </div>
          <Button
            type="neutral"
            onClick={openEdit}
            label="Edit"
            icon={<i class="mr-2 fa-solid fa-pen-to-square" />}
          />
        </div>

        <div class="space-y-4">
          <For each={workout()!.exercises}>
            {(exercise: any, index) => (
              <Card class="card-sm" title={`${exercise.name}`}>
                <div class="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <Input
                      type="number"
                      name="repetitions"
                      label="Reps"
                      value={exercise.repetitions}
                      onChange={(e) =>
                        updateExercise(
                          index(),
                          "repetitions",
                          Number.parseInt(
                            (e.target as HTMLInputElement).value,
                          ) || 0,
                        )
                      }
                      class="h-8"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      name="sets"
                      label="Sets"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExercise(
                          index(),
                          "sets",
                          Number.parseInt(
                            (e.target as HTMLInputElement).value,
                          ) || 0,
                        )
                      }
                      class="h-8"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      label="Weight"
                      name="weight"
                      value={exercise.weight}
                      onChange={(e) =>
                        updateExercise(
                          index(),
                          "weight",
                          Number.parseInt(
                            (e.target as HTMLInputElement).value,
                          ) || 0,
                        )
                      }
                      class="h-8"
                    />
                  </div>
                </div>

                <div class="mt-2">
                  <Label class="text-xs mb-1 block">Track Sets</Label>
                  <div class="flex text-primary flex-wrap gap-2">
                    {Array.from({ length: exercise.sets }, (_, i) => i + 1).map(
                      (setNumber) => (
                        <Button
                          label={setNumber}
                          type={
                            finishedSets() &&
                            finishedSets()![exercise.name]?.some(
                              (entry) => entry.set === setNumber,
                            )
                              ? "info"
                              : "neutral"
                          }
                          onClick={() =>
                            toggleSetCompletion(exercise.name, setNumber)
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              </Card>
            )}
          </For>

          <Button
            type="info"
            label={`Finish Workout (${calculateProgress()}% finished)`}
            onClick={handleSave}
          />
        </div>
      </Show>
    </main>
  );
};
