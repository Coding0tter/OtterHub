import { model, Schema } from "mongoose";

export const Account = new Schema({
  email: { type: String, required: true },
  name: { type: String },
  amount: { type: Number },
});

export const AccountModel = model("Account", Account);
