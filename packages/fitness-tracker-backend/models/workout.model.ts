import { model, Schema } from "mongoose";

export const workoutSchema = new Schema({
  name: String,
  exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
});

export const actualWorkoutSchema = new Schema({
  name: String,
  date: Date,
  sets: [
    {
      set: Number,
      repetitions: Number,
      weight: Number,
    },
  ],
});

export const WorkoutModel = model("Workout", workoutSchema);
export const ActualWorkoutModel = model("ActualWorkout", actualWorkoutSchema);
