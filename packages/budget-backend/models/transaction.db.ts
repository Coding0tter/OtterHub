import { model, Schema } from "mongoose";

export const Transaction = new Schema({
  email: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  subCategory: { type: Schema.Types.ObjectId, ref: "SubCategory" },
  account: { type: Schema.Types.ObjectId, ref: "Account" },
  description: { type: String },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  type: { type: String, required: true, enum: ["income", "expense"] },
});

export const TransactionModel = model("Transaction", Transaction);
