import { model, Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String },
  email: { type: String },
  weight: { type: Number },
  dateOfBirth: { type: Date },
  height: { type: Number },
  picture: { type: String },
  plannedWorkouts: [{ type: Schema.Types.ObjectId, ref: "Workout" }],
  actualWorkouts: [{ type: Schema.Types.ObjectId, ref: "ActualWorkout" }],
});

export const UserModel = model("User", userSchema);
