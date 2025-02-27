import { model, Schema } from "mongoose";

export const FinanceUser = new Schema({
  email: { type: String },
  savingsGoal: { type: Number, min: 0, max: 50, default: 25 },
  picture: { type: String },
});

export const FinanceUserModel = model("FinanceUser", FinanceUser);
