import { model, Schema } from "mongoose";

export const Account = new Schema({
  userId: { type: String, required: true },
  name: { type: String },
  amount: { type: Number },
});

export const AccountModel = model("Account", Account);
