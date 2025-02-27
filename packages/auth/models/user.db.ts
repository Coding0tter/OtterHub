import { model, Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  services: { type: Array },
  picture: { type: String },
});

export const UserModel = model("User", userSchema);
