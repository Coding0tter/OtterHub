import { useNavigate, useParams } from "@solidjs/router";
import type { Exercise } from "fitness-tracker-backend/types/exercise";
import type { Workout } from "fitness-tracker-backend/types/workout";
import { Button, Card, Header, Input, useToast } from "components";
import { createSignal, For, onMount } from "solid-js";
import { fitnessApiClient } from "../App";

export const WorkoutEditor = () => {
  const { addToast } = useToast();
  const params = useParams();
  const navigator = useNavigate();
  const [workout, setWorkout] = createSignal<Workout>({
    name: "",
    exercises: [{} as Exercise],
  });

  onMount(async () => {
    const workout = await fitnessApiClient.get("/workout?id=" + params.id);
    setWorkout(workout.data);
  });

  const addExercise = () =>
    setWorkout((prev) => ({
      ...prev,
      exercises: [...prev.exercises, {} as Exercise],
    }));

  const updateExercise = <K extends keyof Exercise>(
    id: number,
    key: K,
    value: Exercise[K],
  ) =>
    setWorkout((prev) => {
      prev.exercises[id][key] = value;
      return prev;
    });

  const removeExercise = (id: number) =>
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, index) => index !== id),
    }));

  const handleSave = async () => {
    try {
      await fitnessApiClient.post("/workout", { workout: workout() });
      addToast({ message: "Workout saved" });
      navigator("/fitness");
    } catch (err) {
      addToast({
        type: "error",
        message: "Failed to save workout",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await fitnessApiClient.delete("/workout?id=" + params.id);
      addToast({ message: "Workout deleted" });
      navigator("/fitness");
    } catch (err) {
      addToast({
        type: "error",
        message: "Failed to delete workout",
      });
    }
  };

  return (
    <main class="flex-1 container py-4 mb-16">
      <Header title={params.id === "new" ? "Create Workout" : "Edit Workout"} />
      <Input
        label="Workout Name"
        placeholder="e.g., Upper Body Strength"
        name="name"
        value={workout().name}
        onInput={(e) => (workout().name = (e.target as HTMLInputElement).value)}
      />
      <h3 class="text-lg my-4 font-bold text-base-content">Exercises</h3>
      <For each={workout().exercises}>
        {(exercise, index) => (
          <Card
            class="mb-4"
            title={
              <div class="flex w-full justify-between">
                {`Exercise ${index() + 1}`}
                {workout().exercises.length > 1 && (
                  <Button
                    type="neutral"
                    class="h-8 w-8 bg-base"
                    onClick={() => removeExercise(index())}
                    icon={<i class="text-red-300 fa-solid fa-trash"></i>}
                  />
                )}
              </div>
            }
          >
            <form>
              <Input
                placeholder="Exercise name"
                label="Exercise"
                value={exercise.name}
                enterkeyhint={"next"}
                onChange={(e) =>
                  updateExercise(
                    index(),
                    "name",
                    (e.target as HTMLInputElement).value,
                  )
                }
              />

              <div class="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <Input
                    label="Sets"
                    type="number"
                    enterkeyhint={"next"}
                    value={exercise.sets}
                    placeholder="3"
                    onInput={(e) =>
                      updateExercise(
                        index(),
                        "sets",
                        Number.parseInt((e.target as HTMLInputElement).value) ||
                          0,
                      )
                    }
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    label="Reps"
                    value={exercise.repetitions}
                    placeholder="15"
                    enterkeyhint={"next"}
                    onChange={(e) =>
                      updateExercise(
                        index(),
                        "repetitions",
                        Number.parseInt((e.target as HTMLInputElement).value) ||
                          0,
                      )
                    }
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    label="Weight"
                    value={exercise.weight}
                    placeholder="15"
                    enterkeyhint={
                      index() + 1 === workout().exercises.length
                        ? "done"
                        : "next"
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        index() + 1 === workout().exercises.length
                      ) {
                        e.currentTarget.blur();
                        handleSave();
                      }
                    }}
                    onChange={(e) =>
                      updateExercise(
                        index(),
                        "weight",
                        Number.parseInt((e.target as HTMLInputElement).value) ||
                          0,
                      )
                    }
                  />
                </div>
              </div>
            </form>
          </Card>
        )}
      </For>

      <Button
        type="neutral"
        class="w-full flex items-center gap-1"
        onClick={addExercise}
        label="Add Exercise"
        icon={<i class="fa-solid fa-plus"></i>}
      />

      <div class="divider" />

      <Button
        type="info"
        label="Save Workout"
        class="w-full"
        onClick={handleSave}
      />

      {params.id !== "new" && (
        <Button
          type="error"
          label="Delete Workout"
          class="w-full mt-4"
          onClick={handleDelete}
          icon={<i class="fa-solid fa-trash"></i>}
        />
      )}
    </main>
  );
};
