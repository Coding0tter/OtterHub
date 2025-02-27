import { model, Schema } from "mongoose";

export const Category = new Schema({
  email: { type: String, required: true },
  name: { type: String },
  color: { type: String },
  deleted: { type: Boolean, default: false },
});

export const CategoryModel = model("Category", Category);
