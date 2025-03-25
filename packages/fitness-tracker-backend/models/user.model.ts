import { model, Schema } from "mongoose";

const userSchema = new Schema({
  userId: { type: String },
  weight: { type: Number },
  dateOfBirth: { type: Date },
  height: { type: Number },
  plannedWorkouts: [{ type: Schema.Types.ObjectId, ref: "Workout" }],
  actualWorkouts: [{ type: Schema.Types.ObjectId, ref: "ActualWorkout" }],
});

export const UserModel = model("User", userSchema);
