import type { User } from "shared";
import type { ActualWorkout, Workout } from "./workout";

export interface FitnessUser extends Partial<User> {
  userId: string;
  weight: number;
  dateOfBirth: Date;
  height: Number;
  plannedWorkouts: Workout[];
  actualWorkouts: ActualWorkout[];
}
