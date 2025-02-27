import { Schema, model } from "mongoose";

export const exerciseSchema = new Schema({
  name: String,
  repetitions: Number,
  sets: Number,
  weight: Number,
});

export const ExerciseModel = model("Exercise", exerciseSchema);
