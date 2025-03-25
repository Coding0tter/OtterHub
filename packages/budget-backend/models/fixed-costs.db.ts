import { model, Schema } from "mongoose";

export const FixedCosts = new Schema({
  userId: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  subCategory: { type: Schema.Types.ObjectId, ref: "SubCategory" },
  name: { type: String },
  amount: { type: Number },
  type: { type: String, allowedValues: ["income", "expense"] },
});

export const FixedCostsModel = model("FixedCosts", FixedCosts);
