import type { Exercise } from "./exercise";

export interface Workout {
  _id?: string;
  name: string;
  exercises: Exercise[];
}

export interface ActualWorkout {
  name: string;
  sets: [
    {
      set: number;
      repetitions: number;
      weight: number;
    },
  ];
}
